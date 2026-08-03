# Heal-Bit — Booking Hardening Test Plan

Covers the fixes made to appointment booking: DB-level slot locking, abandoned-payment
release, expiry of un-actioned appointments, patient clash/cap guards, hospital-approval
guard, schedule-change protection, doctor-removal cascade, reschedule, and the cash-collected
choice.

---

## 0. Before you start

1. **Clean-rebuild the backend** (new columns, new enum value, new scheduled jobs):
   ```
   cd backend
   ./mvnw clean spring-boot:run          (Windows: mvnw.cmd clean spring-boot:run)
   ```
   Hibernate adds the `slot_key` column + unique index and the `EXPIRED` status automatically.

   ⚠️ **One manual step:** `appointments.status` is a MySQL ENUM, and Hibernate does **not**
   add new values to an existing ENUM. Run this once, or the expiry job will fail with
   *"Data truncated for column 'status'"*:
   ```sql
   ALTER TABLE appointments
     MODIFY COLUMN status ENUM('PENDING','CONFIRMED','COMPLETED','REJECTED','CANCELLED','EXPIRED') NOT NULL;
   ```
   (Then restart the backend.)

2. **Frontend**: `cd frontend && npm run dev` (no new dependencies).

3. **Speed up the background jobs for testing.** The defaults are realistic but slow to watch.
   Temporarily put these in `backend/src/main/resources/application.properties`, restart, and
   revert when you're done:
   ```properties
   healbit.booking.online-hold-minutes=1
   healbit.booking.hold-sweep-ms=20000
   healbit.booking.expiry-sweep-ms=20000
   ```

4. Logins (from the seed data) — password for all: `Password@123`
   - Patients: `amit@example.com`, `sneha@example.com`
   - Doctors: `rajesh@healbit.com` (Apollo), `anil@healbit.com` (Fortis)
   - Hospitals: `apollo@healbit.com`, `fortis@healbit.com`
   - Admin: `admin@healbit.com` / `Admin@123`

---

## 1. Slot can never be double-booked (DB-level)

**A. Verify the index exists** — in MySQL Workbench:
```sql
SHOW INDEX FROM appointments WHERE Column_name = 'slot_key';
```
✅ Expect one row with `Non_unique = 0` (i.e. it is UNIQUE).

**B. Prove the database rejects a duplicate** — book any appointment in the UI, then:
```sql
SELECT appointment_id, doctor_id, appointment_date, appointment_time, slot_key
FROM appointments WHERE slot_key IS NOT NULL ORDER BY appointment_id DESC LIMIT 3;
```
Copy a `slot_key` value and try to force a clash:
```sql
UPDATE appointments SET slot_key = '<paste the slot_key here>'
WHERE appointment_id = <some OTHER appointment id>;
```
✅ Expect **Error 1062 — Duplicate entry**. That's the guarantee working.

**C. Two-browser race (optional)** — open the same doctor/date in a normal window (patient A)
and an incognito window (patient B), select the **same slot**, and click Book at the same time.
✅ One booking succeeds; the other gets *"That slot has just been booked…"*.

**D. Cancelling frees the slot** — cancel a booking, then rebook the same slot.
✅ Rebooking succeeds (`slot_key` is cleared to NULL on cancel/reject/expire).

---

## 2. Abandoned online payment releases the slot

1. As a patient, book a slot and choose **Pay now · online**.
2. When the Razorpay popup opens, **close the browser tab entirely** (do *not* click the
   popup's ✕ — that path already cleans up instantly, we're testing the crash case).
3. Check it is holding the slot:
   ```sql
   SELECT appointment_id, status, payment_status, payment_method, slot_key
   FROM appointments ORDER BY appointment_id DESC LIMIT 1;
   ```
   ✅ `PENDING / UNPAID / ONLINE` with a non-null `slot_key`.
4. Wait for the sweep (~20s with the test settings) and watch the backend console.
   ✅ Log line: `Released N abandoned online booking(s)…` and the row is gone.
5. Reload the doctor's slots for that date.
   ✅ The slot is bookable again.

**Also test the happy path:** book online and actually pay (Netbanking → Success).
✅ Appointment survives, shows **Paid via Online**, and is never swept.

---

## 3. Un-actioned appointments expire

1. Book a **cash** appointment as a patient (leave it PENDING — don't confirm as the doctor).
2. Force it into the past:
   ```sql
   UPDATE appointments SET appointment_date = CURDATE() - INTERVAL 1 DAY
   WHERE appointment_id = <that id>;
   ```
3. Wait for the expiry sweep (~20s with test settings).
   ✅ Backend logs `Expired N appointment(s)…`
   ✅ Patient's list shows the grey **Expired** badge; `slot_key` is now NULL.
   ✅ Doctor's list shows it under the new **Expired** filter chip.

> If it had been paid online, expiring also triggers a refund (see §8).

---

## 4. Patient can't be in two places at once

1. As `amit@example.com`, book **Dr. Rajesh** (Apollo) for a date/time — say Monday 10:00.
2. Now book **Dr. Anil** (Fortis) for the **same date and time**.
   ✅ Blocked: *"You already have another appointment at this date and time"*.
3. Book Dr. Anil at a **different** time on that day.
   ✅ Succeeds.

---

## 5. Open-booking cap

1. As one patient, create **5** live (pending/confirmed) appointments.
2. Try a 6th.
   ✅ Blocked: *"You already have 5 active appointments…"*.
3. Cancel one, then book again.
   ✅ Succeeds.

*(Cap is `healbit.booking.max-open-per-patient`.)*

---

## 6. Booking window

Try to book a date **more than 90 days** ahead (type it into the date field).
✅ Blocked: *"Appointments can only be booked up to 90 days in advance"*.

Also confirm the existing guards still hold: past dates rejected, non-working days rejected
(clear message naming the doctor's working days), break times not offered as slots.

---

## 7. Only approved hospitals are bookable

1. As **admin**, go to Hospitals and **Reject** (or Remove) an ACTIVE hospital — e.g. Fortis.
2. As a **patient**, go to Find hospitals.
   ✅ Fortis no longer appears.
3. Open a doctor list / try to reach one of its doctors.
   ✅ Its doctors no longer appear in public listings, and its slot list returns empty.
   ✅ A booking attempt fails with *"This doctor's hospital is not currently accepting appointments"*.
4. Re-approve the hospital as admin.
   ✅ Everything returns.

**Seed check:** *Rainbow Children's Hospital* is seeded as PENDING — its doctor (Dr. Kiran)
should never appear in patient browsing.

---

## 8. Refunds still work

1. Book online and pay (Netbanking → Success) → **Paid via Online**.
2. Cancel it as the patient (or reject it as the doctor).
   ✅ Status becomes **Refunded** in the app.
   ✅ Razorpay dashboard → **Transactions → Refunds** shows the refund.

---

## 9. Schedule changes can't strand patients

1. As a patient, book **Dr. Rajesh** on a **Saturday** slot.
2. Log in as `rajesh@healbit.com` → **My schedule** → uncheck **Sat** → Save.
   ✅ Blocked with a message naming the count and the first few clashing appointments,
   telling you to reject/complete them first.
3. As the doctor, **reject** that Saturday appointment, then uncheck Sat again.
   ✅ Now the schedule saves.
4. Repeat via the hospital's **Manage doctors → Edit** form (same guard applies there).

Also try narrowing hours or adding a break that covers a booked slot → same protection.

---

## 10. Removing a doctor doesn't orphan appointments

1. Ensure a doctor has 1–2 upcoming appointments (one paid online, if you want to see the refund).
2. As that doctor's **hospital**, go to Doctors → **Remove**.
   ✅ The patient's appointments for that doctor become **Cancelled**.
   ✅ Any online-paid one becomes **Refunded** (check Razorpay Refunds).
   ✅ The doctor disappears from listings.

---

## 11. Reschedule (new)

1. As a patient, on **My appointments**, click **Reschedule** on a pending/confirmed row.
2. Pick a new date → open slots load → pick a slot → **Confirm new slot**.
   ✅ Row updates to the new date/time and returns to **Pending** (doctor must re-confirm).
   ✅ The old slot becomes bookable again; the new one is now taken.
3. Try rescheduling onto a slot you already hold with another doctor.
   ✅ Blocked by the clash guard.
4. Try rescheduling a completed/cancelled/expired appointment.
   ✅ No Reschedule button is offered.

---

## 12. Cash collected — doctor's choice (new)

1. Patient books with **Pay in cash** → shows **Payment pending**.
2. Doctor confirms it, then clicks **Mark completed**.
   ✅ A modal asks whether the cash was collected.
3. Choose **"No — leave payment pending"**.
   ✅ Appointment is **Completed** but payment stays **Payment pending**.
4. Repeat with another and choose **"Yes — mark paid"**.
   ✅ Shows **Paid via Cash**.
5. Complete an **online-paid** appointment.
   ✅ No modal appears (already settled) — it just completes.

---

## 13. Dashboards & lists stay in sync

- Admin / Hospital / Doctor dashboards: the status donut now includes an **Expired** slice,
  and the totals should equal the sum of the slices.
- Doctor and Hospital appointment pages have an **Expired** filter chip.
- Patient list shows Reschedule + Cancel only on live appointments.

---

## 14. Timezone

The server clock is pinned to `Asia/Kolkata` (`healbit.timezone`). Book a slot late in the
evening and confirm "today"/"already passed" behave correctly — a 20:00 slot should still be
bookable at 19:00 IST.

---

## Known/By design

- Appointments created **before** this update have `slot_key = NULL`, so they aren't covered by
  the DB index (the app-level check still protects them). New bookings are fully protected.
- **Notifications** (email/SMS on booking, confirmation, rejection, reminders) are *not*
  implemented — they need an SMTP or SMS provider account and credentials.
- Razorpay is in **test mode**: use **Netbanking → Success** (the UPI QR can't be scanned and
  `4111 1111 1111 1111` is rejected as an international card).
