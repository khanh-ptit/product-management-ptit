# Product Management System

### Landing page for users

![LandingPage](./demo/landingPage.png)

### Dashboard page

![DashboardPage](./demo/dashboardPage.png)

### Product page

![ProductPage](./demo/productPage.png)

### Order page with print feature

![OrderPage](./demo/orderPage.png)

### Profile

![ProfilePage](./demo/profilePage.png)

### Account Access Control Page

![RolePage](./demo/userAccessControlPage.png)

### Error 403

![RolePage](./demo/403Error.png)

## Overview

Product Management System is a web application designed to help businesses efficiently manage their products, orders, and user roles. It includes an intuitive dashboard for administrators, role-based access control, and a seamless user experience for managing sales and transactions.

## Technologies

- **Frontend:** Bootstrap, PugJS
- **Backend:** ExpressJS (JavaScript)
- **Database:** MongoDB
- **Cloud Storage:** Cloudinary
- **Data Visualization:** Interactive charts for sales and order tracking

## Features

### User Authentication & Access Control

- Secure user registration and login
- Password recovery using OTP (via SMS & email)
- Role-based access control to differentiate between admin and staff users

### Dashboard & Data Visualization

- Interactive charts for tracking sales, orders, and key business metrics
- Real-time updates for better business insights

### Product & Order Management

- CRUD operations for products
- Order tracking system with real-time updates
- Invoice generation & printing
- Debt tracking for better financial management

### Additional Features

- Cloud storage integration with Cloudinary for image handling
- Secure authentication with JWT
- Optimized UI for better user experience

## Setup and Installation

### Prerequisites

- Node.js and npm
- MongoDB (local or cloud-based)
- Cloudinary account for image storage

### Environment Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/khanh-ptit/product-management-ptit.git
   ```
2. Navigate to the project folder:
   ```bash
   cd product-management-ptit
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and configure the following variables:
   - MongoDB connection string
   - Cloudinary API credentials
   - JWT secret key
   - Email/SMS API credentials for OTP verification

### Running Locally

```bash
# Start the development server
npm start
```

### Deployment

The project is deployed on Vercel, accessible at:

🔗 **Live Demo:** [Product Management System](https://product-management-ptit.vercel.app)

## API Documentation

API endpoints are documented within the project repository and can be tested using tools like Postman or Insomnia.

📌 **GitHub Repository:**

- [Product Management System](https://github.com/khanh-ptit/product-management-ptit)
