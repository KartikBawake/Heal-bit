# Heal-Bit

A full-stack healthcare web application built using **Spring Boot**, **React**, and **MySQL**.

## Run with Docker

The fastest way to run the full application is with Docker. This starts the frontend, backend, and MySQL database together.

### Requirements

Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Start the application

```bash
git clone https://github.com/KartikBawake/Heal-bit.git
cd Heal-bit
docker compose up --build
```

Open the application at:

```text
http://localhost:5173
```

### Stop the application

Press `Ctrl + C` in the terminal, then run:

```bash
docker compose down
```

The MySQL data is stored in a Docker volume and remains available the next time you run `docker compose up`. Do not run `docker compose down -v` unless you want to delete the saved database data.

## Run locally without Docker

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

