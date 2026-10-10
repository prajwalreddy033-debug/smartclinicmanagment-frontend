# SmartClinic - Frontend Application

Modern responsive single-page web application for the **Smart Clinic Management System**, built with **React**, **Vite**, and **Tailwind CSS**.

---

## Features
- **Role-Based Portals**:
  - **Clinic Admin**: Manage clinic profile, doctors, patients, appointments, billing analytics.
  - **Doctor**: View daily appointments, record consultations, issue prescriptions.
  - **Receptionist**: Patient check-in, appointment booking, payment collection.
  - **Patient**: Self-service portal for appointments, prescriptions, and medical history.
- **Appointment Booking**: Real-time slot selection and appointment tracking.
- **Prescription Viewer & Download**: View medicine dosage and download digital PDF prescriptions.
- **Billing & Invoices**: Track paid and pending bills.
- **Backend API Proxy**: Pre-configured Vite reverse proxy forwarding requests to the Spring Boot backend (`http://localhost:8070`).

---

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the backend API URL:
```env
VITE_API_URL=http://localhost:8070/api/v1
```

### 2. Install & Run
```bash
npm install
npm run dev
```

- **Frontend Application**: `http://localhost:5050`
- **Build for Production**:
```bash
npm run build
```

---

## Repository Structure
```text
frontend/
├── src/
│   ├── components/       # Reusable components & protected routes
│   ├── pages/            # Role-specific dashboard & workflow pages
│   ├── store/            # Redux store & API integration slices
│   └── utils/            # Helper constants and formatters
├── public/               # Static assets
├── index.html            # Main HTML template
├── vite.config.js        # Vite configuration & backend proxy
└── package.json          # Dependencies & scripts
```
