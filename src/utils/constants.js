export const ROLES = {
  CLINIC_ADMIN: 'CLINIC_ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  PATIENT: 'PATIENT'
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED'
};

export const FOLLOWUP_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED'
};

export const DEMO_CREDENTIALS = [
  {
    role: 'CLINIC_ADMIN',
    label: 'Clinic Admin',
    name: 'Eleanor Vance',
    email: 'admin.metro@smartclinic.com',
    password: 'Admin@123',
    clinic: 'Metro Health Clinic',
    badge: 'Executive',
    color: 'sky',
    description: 'System config, staffing, revenue & clinic operations'
  },
  {
    role: 'DOCTOR',
    label: 'Cardiologist',
    name: 'Dr. Robert Smith, MD',
    email: 'dr.smith@smartclinic.com',
    password: 'Admin@123',
    clinic: 'Metro Health Clinic',
    badge: 'Cardiology',
    color: 'emerald',
    description: 'Consultations, vitals diagnostics & e-prescriptions'
  },
  {
    role: 'DOCTOR',
    label: 'Pediatrician',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'dr.sarah@smartclinic.com',
    password: 'Admin@123',
    clinic: 'Metro Health Clinic',
    badge: 'Pediatrics',
    color: 'teal',
    description: 'Pediatric encounters, immunization & prescriptions'
  },
  {
    role: 'PATIENT',
    label: 'Patient',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    password: 'Admin@123',
    clinic: 'Metro Health Clinic',
    badge: 'Patient Portal',
    color: 'purple',
    description: 'Appointments, prescriptions, PDF download & bills'
  },
  {
    role: 'RECEPTIONIST',
    label: 'Receptionist',
    name: 'Emma Watson',
    email: 'reception@smartclinic.com',
    password: 'Admin@123',
    clinic: 'Metro Health Clinic',
    badge: 'Front Desk',
    color: 'amber',
    description: 'Patient check-in, bookings & point-of-sale billing'
  }
];
