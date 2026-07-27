# Heal-Bit

A full-stack healthcare web application built using **Spring Boot**, **React**, and **MySQL**.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/KartikBawake/Heal-bit.git
cd Heal-bit
```

### 2. Configure MySQL

Open:

```text
backend/src/main/resources/application.properties
```

Update your MySQL credentials:

```properties
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 3. Admin Credentials(Auto-Generated)

* **Email:** `admin@healbit.com`
* **Password:** `Admin@123`

### 4. Run the Backend

Open a terminal and run:

```bash
cd backend
./mvnw clean spring-boot:run
```

### 5. Run the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

### 6. Open the Application

Visit the URL shown in the terminal (usually):

```text
http://localhost:5173
```

