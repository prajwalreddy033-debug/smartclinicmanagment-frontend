import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import DoctorLogin from './pages/DoctorLogin'
import PatientLogin from './pages/PatientLogin'
import Register from './pages/Register'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Consultations from './pages/Consultations'
import Prescriptions from './pages/Prescriptions'
import Billing from './pages/Billing'
import BookAppointment from './pages/BookAppointment'
import MedicalHistory from './pages/MedicalHistory'
import AddDoctor from './pages/AddDoctor'
import DatabaseView from './pages/DatabaseView'
import ProtectedRoute from './components/ProtectedRoute'
import { ROLES } from './utils/constants'

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const homePath = user?.role === ROLES.PATIENT ? '/book' : '/dashboard'

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={homePath} />} />
      <Route path="/login/admin" element={!isAuthenticated ? <AdminLogin /> : <Navigate to={homePath} />} />
      <Route path="/login/doctor" element={!isAuthenticated ? <DoctorLogin /> : <Navigate to={homePath} />} />
      <Route path="/login/patient" element={!isAuthenticated ? <PatientLogin /> : <Navigate to={homePath} />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={homePath} />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={homePath} />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="patients" element={<ProtectedRoute roles={[ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST]}><Patients /></ProtectedRoute>} />
        <Route path="consultations" element={<ProtectedRoute roles={[ROLES.DOCTOR, ROLES.PATIENT, ROLES.CLINIC_ADMIN]}><Consultations /></ProtectedRoute>} />
        <Route path="prescriptions" element={<ProtectedRoute roles={[ROLES.DOCTOR, ROLES.PATIENT, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST]}><Prescriptions /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute roles={[ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT]}><Billing /></ProtectedRoute>} />
        <Route path="medical-history" element={<ProtectedRoute roles={[ROLES.DOCTOR, ROLES.PATIENT, ROLES.CLINIC_ADMIN]}><MedicalHistory /></ProtectedRoute>} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="add-doctor" element={<ProtectedRoute roles={[ROLES.CLINIC_ADMIN]}><AddDoctor /></ProtectedRoute>} />
        <Route path="database" element={<ProtectedRoute roles={[ROLES.CLINIC_ADMIN]}><DatabaseView /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? homePath : '/login'} />} />
    </Routes>
  )
}

export default App
