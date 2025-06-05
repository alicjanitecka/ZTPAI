# Petzone

## Table of Contents

- [Project Description](#project-description)
- [Architecture Diagram](#architecture-diagram)
- [Technologies](#technologies)
- [Installation and Setup](#installation-and-setup)
- [Database Structure (ERD)](#database-structure-erd)
- [Authors](#authors)

---

## Project Description

**Petzone** is a modern web platform connecting pet owners with trusted petsitters.  
Key features:
- User registration and authentication (owners, petsitters, admin)
- User profile and pets management
- Petsitter search by filters and availability
- Booking and managing visits
- Petsitter availability management
- Admin panel 

---

## Architecture Diagram

```
┌─────────────┐           HTTPS/REST API           ┌────────────────────────────┐
│  Frontend   │  <----------------------------->   │         Backend            │
│ (React/Vite)│                                    │ (Django + Django REST API) │
│             │                                    |                            |
└─────────────┘                                    └────────────────────────────┘
                                                         │
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   Postgres DB   │
                                                │   (database)    │
                                                │                 │
                                                └─────────────────┘
           
```

---

## Technologies


- **Backend**
  
Django & Django REST Framework – Secure, scalable, and efficient backend framework for building robust RESTful APIs. DRF provides built-in support for authentication, permissions, and serialization, speeding up API development and ensuring best practices.

- **Database**
  
PostgreSQL – A powerful, open-source relational database system, well-suited for complex queries, data integrity, and high reliability in production environments.

- **Frontend**
  
React.js (18+) – Modern, component-based JavaScript library for building interactive and responsive user interfaces. React enables rapid UI development and efficient updates.

- **Authentication**
  
JWT (JSON Web Tokens) – Enables secure, stateless authentication and authorization for both frontend and backend, ensuring user sessions are protected and scalable.

- **Containerization & DevOps**
  
Docker & Docker Compose – Provide consistent, reproducible development and deployment environments. Docker simplifies dependency management and scaling, while Docker Compose orchestrates multi-container setups for local and production use.

- **Database Management**
  
PgAdmin – A user-friendly web interface for managing PostgreSQL databases, making database administration and inspection straightforward for developers.

---

## Installation and Setup

### Requirements

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Quick Start

1. **Clone the repository**

git clone https://github.com/alicjanitecka/ZTPAI.git
cd petzone

2. **Configure environment variables**

Create a `.env` file in the root directory with at least:

POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
PGADMIN_EMAIL
PGADMIN_PASSWORD
SECRET_KEY
DEBUG

3. **Build and run the app**
   docker-compose up --build

4. **Access the services:**
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **PgAdmin:** [http://localhost:5050](http://localhost:5050)

5. **Create a superuser (admin)**
   docker-compose exec backend python manage.py createsuperuser

---

## Database Structure (ERD)

Below is a simplified entity-relationship diagram:

![Architecture Diagram](petsitters.pgerd.png)

## Authors

- Alicja Nitecka
