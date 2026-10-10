import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import appointmentReducer from './slices/appointmentSlice'
import patientReducer from './slices/patientSlice'
import doctorReducer from './slices/doctorSlice'
import consultationReducer from './slices/consultationSlice'
import prescriptionReducer from './slices/prescriptionSlice'
import billingReducer from './slices/billingSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    patients: patientReducer,
    doctors: doctorReducer,
    consultations: consultationReducer,
    prescriptions: prescriptionReducer,
    billing: billingReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
