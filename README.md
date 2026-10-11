# Gourmet Haven

Gourmet Haven is a full-stack restaurant ordering and management platform. Customers can browse a plant-based menu, place orders, reserve tables, track order status, and leave reviews. Restaurant staff can manage menu items, reservations, kitchen orders, and sales analytics.

## Important Payment Note

This project does **not** include an online payment gateway. No Stripe, PayPal, Razorpay, or card-processing integration is implemented.

Orders use in-person settlement, such as cash or payment at the restaurant counter. Payment gateway integration can be added later as a separate feature.

## Features

### Customer

- Browse and search the menu
- Filter menu items by category
- View dish details and reviews
- Add items to a cart
- Place orders for in-person settlement
- Track order progress
- View receipts
- Reserve a table
- View and cancel eligible reservations
- Submit dish reviews after signing in

### Admin and Staff

- Admin authentication with role-based access
- Sales and order analytics
- Menu item creation, editing, availability, and deletion
- Reservation management and walk-in bookings
- Kitchen Display System for active orders
- Order status workflow management
- Customer order and reservation visibility for staff

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Axios
- Recharts
- Lucide React

### Backend

- Java 21
- Spring Boot 3.3
- Spring Web
- Spring Data JPA
- Spring Security
- JWT authentication
- Springdoc OpenAPI

### Database
- PostgreSQL 

## Project Structure

```text
frontend/   React and TypeScript client
backend/    Spring Boot REST API and database migrations
```

## Requirements

- Java 21 or newer
- Node.js and npm
- Maven Wrapper included with the backend
- PostgreSQL if using a production database

## Run Locally

### Start the backend

From the project root:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### Start the frontend

Open another terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The frontend expects the backend API at:

```text
http://localhost:8080/api
```

## Local Development Accounts

These accounts are seeded for local development only:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@gourmet.com` | `admin123` |
| Customer | `customer@gourmet.com` | `customer123` |

Change these credentials and configure secure secrets before deploying the application publicly.

## Useful Commands

### Frontend build

```powershell
cd frontend
npm run build
```

### Frontend lint

```powershell
cd frontend
npm run lint
```

### Backend tests

```powershell
cd backend
.\mvnw.cmd test
```

### API documentation

When the backend is running, Swagger UI is available at:

```text
http://localhost:8080/swagger-ui.html
```

## Current Limitations

- No online payment gateway is included.
- Payment is settled in person at the restaurant.
- The default local database is in-memory H2 and resets when the backend stops.
- Production deployment requires secure JWT secrets, database credentials, and seeded account changes.

## Project Status

This is a portfolio-ready full-stack restaurant management project. It demonstrates customer ordering, reservations, authentication, kitchen workflows, admin operations, reporting, and responsive UI design.
