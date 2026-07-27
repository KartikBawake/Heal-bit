-- ============================================================================
--  Heal-Bit — dummy / test data (Indian names)
-- ----------------------------------------------------------------------------
--  HOW TO RUN
--    1. Start the backend ONCE first so Hibernate creates all tables
--       (ddl-auto=update) and data.sql seeds the specializations.
--    2. Then load this file into MySQL, e.g.:
--         mysql -u root -p healbit_db < seed-test-data.sql
--       (or paste it into MySQL Workbench / DBeaver and run).
--
--  LOGIN CREDENTIALS  (every seeded user shares the same password)
--    Password for ALL hospitals, doctors and patients:   Password@123
--    Admin (auto-seeded by the app, not here):            admin@healbit.com / Admin@123
--
--  This script first deletes any previous rows it created (matched by email),
--  so it is safe to run repeatedly.
-- ============================================================================

SET @pw = '$2b$10$uOykklSCcrt82SwIWZIfMu5L58kkeJdn0V8Xf76pMNSjUcmOwEqOe'; -- bcrypt of "Password@123"

-- MySQL Workbench runs in "safe update mode" by default, which blocks the cleanup
-- DELETEs below (they filter with a subquery, not a primary key). Turn it off for
-- THIS session only; it is restored at the end of the script.
SET SQL_SAFE_UPDATES = 0;

-- ---------------------------------------------------------------------------
-- 0. Clean up previous test data (child tables first for FK safety)
-- ---------------------------------------------------------------------------
DELETE FROM doctor_ratings   WHERE patient_id IN (SELECT patient_id FROM patients WHERE email LIKE '%@example.com');
DELETE FROM hospital_ratings WHERE patient_id IN (SELECT patient_id FROM patients WHERE email LIKE '%@example.com');
DELETE FROM appointments     WHERE patient_id IN (SELECT patient_id FROM patients WHERE email LIKE '%@example.com');
DELETE FROM doctors          WHERE email LIKE '%@healbit.com';
DELETE FROM patients         WHERE email LIKE '%@example.com';
DELETE FROM hospitals        WHERE email LIKE '%@healbit.com';

-- ---------------------------------------------------------------------------
-- 1. Hospitals  (4 ACTIVE so patients can browse/book them, 1 PENDING to test admin approval)
-- ---------------------------------------------------------------------------
INSERT INTO hospitals
  (hospital_name, registration_number, email, password, phone, address, city, state, pincode, description,
   status, created_at, deleted, allow_cancellation_after_acceptance, cancellation_min_hours)
VALUES
  ('Apollo Care Hospital',        'HB-2026-AP001', 'apollo@healbit.com',  @pw, '9820011001', 'FC Road',              'Pune',      'Maharashtra', '411001', 'Multispeciality hospital with 24x7 emergency care.', 'ACTIVE',  NOW() - INTERVAL 40 DAY, 0, 1, 2),
  ('Fortis Wellness Hospital',    'HB-2026-FR002', 'fortis@healbit.com',  @pw, '9820011002', 'Andheri West',         'Mumbai',    'Maharashtra', '400058', 'Advanced cardiac and orthopedic care.',              'ACTIVE',  NOW() - INTERVAL 35 DAY, 0, 1, NULL),
  ('Sunrise Multispeciality',     'HB-2026-SR003', 'sunrise@healbit.com', @pw, '9880011003', 'MG Road',              'Bengaluru', 'Karnataka',   '560001', 'Trusted neighbourhood multispeciality hospital.',    'ACTIVE',  NOW() - INTERVAL 25 DAY, 0, 0, NULL),
  ('Medanta City Hospital',       'HB-2026-MD004', 'medanta@healbit.com', @pw, '9810011004', 'Connaught Place',      'New Delhi', 'Delhi',       '110001', 'Comprehensive tertiary care hospital.',              'ACTIVE',  NOW() - INTERVAL 15 DAY, 0, 1, 4),
  ('Rainbow Children''s Hospital','HB-2026-RB005', 'rainbow@healbit.com', @pw, '9848011005', 'Banjara Hills',        'Hyderabad', 'Telangana',   '500034', 'Dedicated paediatric and neonatal hospital.',        'PENDING', NOW() - INTERVAL 3  DAY, 0, 1, NULL);

-- ---------------------------------------------------------------------------
-- 2. Patients
-- ---------------------------------------------------------------------------
INSERT INTO patients
  (full_name, email, password, phone_number, age, gender, address, city, created_at, deleted)
VALUES
  ('Amit Sharma',   'amit@example.com',   @pw, '9876500001', 34, 'Male',   'Kothrud',        'Pune',      NOW() - INTERVAL 38 DAY, 0),
  ('Sneha Nair',    'sneha@example.com',  @pw, '9876500002', 28, 'Female', 'Bandra',         'Mumbai',    NOW() - INTERVAL 33 DAY, 0),
  ('Rohan Gupta',   'rohan@example.com',  @pw, '9876500003', 41, 'Male',   'Indiranagar',    'Bengaluru', NOW() - INTERVAL 30 DAY, 0),
  ('Kavya Reddy',   'kavya@example.com',  @pw, '9876500004', 25, 'Female', 'Jubilee Hills',  'Hyderabad', NOW() - INTERVAL 20 DAY, 0),
  ('Vikram Singh',  'vikram@example.com', @pw, '9876500005', 37, 'Male',   'Saket',          'New Delhi', NOW() - INTERVAL 12 DAY, 0),
  ('Ananya Iyer',   'ananya@example.com', @pw, '9876500006', 30, 'Female', 'Aundh',          'Pune',      NOW() - INTERVAL 8  DAY, 0);

-- ---------------------------------------------------------------------------
-- 3. Doctors  (hospital linked by the hospital's email; breaks left empty)
-- ---------------------------------------------------------------------------
INSERT INTO doctors
  (hospital_id, doctor_name, email, password, qualification, specialization, experience, consultation_fee,
   working_days, start_time, end_time, breaks, deleted)
VALUES
  ((SELECT hospital_id FROM hospitals WHERE email='apollo@healbit.com'),  'Dr. Rajesh Kumar',     'rajesh@healbit.com', @pw, 'MBBS, MD (Cardiology)',      'Cardiology',       15, 800,  'MON,TUE,WED,THU,FRI,SAT', '09:00:00', '17:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='apollo@healbit.com'),  'Dr. Priya Deshpande',  'priya@healbit.com',  @pw, 'MBBS, MD (Dermatology)',     'Dermatology',       9, 600,  'MON,TUE,WED,THU,FRI',     '10:00:00', '16:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='fortis@healbit.com'),  'Dr. Anil Mehta',       'anil@healbit.com',   @pw, 'MBBS, MS (Orthopedics)',     'Orthopedics',      12, 900,  'MON,TUE,WED,THU,FRI,SAT', '09:30:00', '18:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='fortis@healbit.com'),  'Dr. Meera Iyer',       'meera@healbit.com',  @pw, 'MBBS, DCH (Pediatrics)',     'Pediatrics',        7, 500,  'MON,TUE,WED,THU,FRI',     '09:00:00', '14:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='sunrise@healbit.com'), 'Dr. Suresh Rao',       'suresh@healbit.com', @pw, 'MBBS, DM (Neurology)',       'Neurology',        18, 1200, 'TUE,WED,THU,FRI,SAT',     '11:00:00', '19:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='sunrise@healbit.com'), 'Dr. Divya Menon',      'divya@healbit.com',  @pw, 'MBBS, MD (Gynecology)',      'Gynecology',       10, 700,  'MON,TUE,WED,THU,FRI,SAT', '10:00:00', '17:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='medanta@healbit.com'), 'Dr. Arjun Malhotra',   'arjun@healbit.com',  @pw, 'MBBS, MD (General Medicine)','General Medicine',   8, 400,  'MON,TUE,WED,THU,FRI,SAT', '08:00:00', '15:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='medanta@healbit.com'), 'Dr. Neha Kapoor',      'neha@healbit.com',   @pw, 'MBBS, MS (ENT)',             'ENT',               6, 550,  'MON,TUE,WED,THU,FRI',     '10:00:00', '17:00:00', NULL, 0),
  ((SELECT hospital_id FROM hospitals WHERE email='rainbow@healbit.com'), 'Dr. Kiran Rathod',     'kiran@healbit.com',  @pw, 'MBBS, DCH (Pediatrics)',     'Pediatrics',       11, 650,  'MON,TUE,WED,THU,FRI,SAT', '09:00:00', '16:00:00', NULL, 0);

-- ---------------------------------------------------------------------------
-- 4. Appointments  (patient + doctor by email; hospital taken from the doctor's hospital)
--    Mixed statuses: PENDING / CONFIRMED / COMPLETED / CANCELLED / REJECTED
-- ---------------------------------------------------------------------------
INSERT INTO appointments
  (patient_id, hospital_id, doctor_id, appointment_date, appointment_time, reason, status, created_at)
VALUES
  ((SELECT patient_id FROM patients WHERE email='amit@example.com'),   (SELECT hospital_id FROM doctors WHERE email='rajesh@healbit.com'), (SELECT doctor_id FROM doctors WHERE email='rajesh@healbit.com'), CURDATE() + INTERVAL 3 DAY, '10:00:00', 'Chest pain and shortness of breath',   'CONFIRMED', NOW() - INTERVAL 2 DAY),
  ((SELECT patient_id FROM patients WHERE email='sneha@example.com'),  (SELECT hospital_id FROM doctors WHERE email='priya@healbit.com'),  (SELECT doctor_id FROM doctors WHERE email='priya@healbit.com'),  CURDATE() + INTERVAL 5 DAY, '11:00:00', 'Persistent skin rash on arms',         'PENDING',   NOW() - INTERVAL 1 DAY),
  ((SELECT patient_id FROM patients WHERE email='rohan@example.com'),  (SELECT hospital_id FROM doctors WHERE email='anil@healbit.com'),   (SELECT doctor_id FROM doctors WHERE email='anil@healbit.com'),   CURDATE() - INTERVAL 10 DAY,'12:00:00', 'Knee pain after playing football',     'COMPLETED', NOW() - INTERVAL 14 DAY),
  ((SELECT patient_id FROM patients WHERE email='kavya@example.com'),  (SELECT hospital_id FROM doctors WHERE email='meera@healbit.com'),  (SELECT doctor_id FROM doctors WHERE email='meera@healbit.com'),  CURDATE() + INTERVAL 2 DAY, '09:30:00', 'Child has fever and cough',            'CONFIRMED', NOW() - INTERVAL 1 DAY),
  ((SELECT patient_id FROM patients WHERE email='vikram@example.com'), (SELECT hospital_id FROM doctors WHERE email='suresh@healbit.com'), (SELECT doctor_id FROM doctors WHERE email='suresh@healbit.com'), CURDATE() + INTERVAL 6 DAY, '14:00:00', 'Frequent migraines',                   'PENDING',   NOW() - INTERVAL 1 DAY),
  ((SELECT patient_id FROM patients WHERE email='ananya@example.com'), (SELECT hospital_id FROM doctors WHERE email='divya@healbit.com'),  (SELECT doctor_id FROM doctors WHERE email='divya@healbit.com'),  CURDATE() - INTERVAL 20 DAY,'10:30:00', 'Routine gynaecological check-up',      'COMPLETED', NOW() - INTERVAL 24 DAY),
  ((SELECT patient_id FROM patients WHERE email='amit@example.com'),   (SELECT hospital_id FROM doctors WHERE email='arjun@healbit.com'),  (SELECT doctor_id FROM doctors WHERE email='arjun@healbit.com'),  CURDATE() - INTERVAL 5 DAY, '08:30:00', 'General weakness and fatigue',         'CANCELLED', NOW() - INTERVAL 9 DAY),
  ((SELECT patient_id FROM patients WHERE email='sneha@example.com'),  (SELECT hospital_id FROM doctors WHERE email='neha@healbit.com'),   (SELECT doctor_id FROM doctors WHERE email='neha@healbit.com'),   CURDATE() + INTERVAL 4 DAY, '15:00:00', 'Ear infection and pain',               'REJECTED',  NOW() - INTERVAL 2 DAY),
  ((SELECT patient_id FROM patients WHERE email='rohan@example.com'),  (SELECT hospital_id FROM doctors WHERE email='rajesh@healbit.com'), (SELECT doctor_id FROM doctors WHERE email='rajesh@healbit.com'), CURDATE() - INTERVAL 30 DAY,'16:00:00', 'Follow-up cardiac review',             'COMPLETED', NOW() - INTERVAL 34 DAY),
  ((SELECT patient_id FROM patients WHERE email='kavya@example.com'),  (SELECT hospital_id FROM doctors WHERE email='suresh@healbit.com'), (SELECT doctor_id FROM doctors WHERE email='suresh@healbit.com'), CURDATE() + INTERVAL 7 DAY, '11:30:00', 'Headache evaluation',                  'CONFIRMED', NOW() - INTERVAL 1 DAY),
  ((SELECT patient_id FROM patients WHERE email='vikram@example.com'), (SELECT hospital_id FROM doctors WHERE email='anil@healbit.com'),   (SELECT doctor_id FROM doctors WHERE email='anil@healbit.com'),   CURDATE() + INTERVAL 1 DAY, '10:00:00', 'Lower back pain',                      'PENDING',   NOW()),
  ((SELECT patient_id FROM patients WHERE email='ananya@example.com'), (SELECT hospital_id FROM doctors WHERE email='priya@healbit.com'),  (SELECT doctor_id FROM doctors WHERE email='priya@healbit.com'),  CURDATE() - INTERVAL 15 DAY,'13:00:00', 'Acne treatment consultation',          'COMPLETED', NOW() - INTERVAL 19 DAY);

-- ---------------------------------------------------------------------------
-- 5. Doctor ratings  (unique per doctor+patient; mostly from completed visits)
-- ---------------------------------------------------------------------------
INSERT INTO doctor_ratings (doctor_id, patient_id, rating, review, created_at, updated_at)
VALUES
  ((SELECT doctor_id FROM doctors WHERE email='anil@healbit.com'),   (SELECT patient_id FROM patients WHERE email='rohan@example.com'),  5, 'Excellent orthopedic, quick recovery.',            NOW() - INTERVAL 8 DAY,  NULL),
  ((SELECT doctor_id FROM doctors WHERE email='divya@healbit.com'),  (SELECT patient_id FROM patients WHERE email='ananya@example.com'), 4, 'Very professional and caring.',                    NOW() - INTERVAL 18 DAY, NULL),
  ((SELECT doctor_id FROM doctors WHERE email='rajesh@healbit.com'), (SELECT patient_id FROM patients WHERE email='rohan@example.com'),  5, 'Great cardiologist, explained everything clearly.', NOW() - INTERVAL 26 DAY, NULL),
  ((SELECT doctor_id FROM doctors WHERE email='priya@healbit.com'),  (SELECT patient_id FROM patients WHERE email='ananya@example.com'), 4, 'Good results, friendly staff.',                    NOW() - INTERVAL 12 DAY, NULL),
  ((SELECT doctor_id FROM doctors WHERE email='rajesh@healbit.com'), (SELECT patient_id FROM patients WHERE email='amit@example.com'),   4, 'Helpful and thorough consultation.',               NOW() - INTERVAL 1 DAY,  NULL),
  ((SELECT doctor_id FROM doctors WHERE email='suresh@healbit.com'), (SELECT patient_id FROM patients WHERE email='kavya@example.com'),  5, 'Finally resolved my migraines.',                   NOW() - INTERVAL 1 DAY,  NULL);

-- ---------------------------------------------------------------------------
-- 6. Hospital ratings  (unique per hospital+patient)
-- ---------------------------------------------------------------------------
INSERT INTO hospital_ratings (hospital_id, patient_id, rating, review, created_at, updated_at)
VALUES
  ((SELECT hospital_id FROM hospitals WHERE email='fortis@healbit.com'),  (SELECT patient_id FROM patients WHERE email='rohan@example.com'),  5, 'Clean facility and great doctors.',   NOW() - INTERVAL 8 DAY,  NULL),
  ((SELECT hospital_id FROM hospitals WHERE email='sunrise@healbit.com'), (SELECT patient_id FROM patients WHERE email='ananya@example.com'), 4, 'Smooth and quick experience.',        NOW() - INTERVAL 18 DAY, NULL),
  ((SELECT hospital_id FROM hospitals WHERE email='apollo@healbit.com'),  (SELECT patient_id FROM patients WHERE email='amit@example.com'),   4, 'Good care and helpful staff.',        NOW() - INTERVAL 1 DAY,  NULL),
  ((SELECT hospital_id FROM hospitals WHERE email='apollo@healbit.com'),  (SELECT patient_id FROM patients WHERE email='rohan@example.com'),  5, 'Top-notch cardiac care.',             NOW() - INTERVAL 26 DAY, NULL),
  ((SELECT hospital_id FROM hospitals WHERE email='sunrise@healbit.com'), (SELECT patient_id FROM patients WHERE email='kavya@example.com'),  4, 'Friendly and attentive staff.',       NOW() - INTERVAL 1 DAY,  NULL);

-- Restore safe update mode.
SET SQL_SAFE_UPDATES = 1;

-- ============================================================================
--  Done. Quick counts:  5 hospitals, 9 doctors, 6 patients, 12 appointments,
--                       6 doctor ratings, 5 hospital ratings.
-- ============================================================================
