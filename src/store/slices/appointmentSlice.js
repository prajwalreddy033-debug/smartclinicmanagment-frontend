import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments')
    }
  }
)

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment')
    }
  }
)

export const rescheduleAppointment = createAsyncThunk(
  'appointments/rescheduleAppointment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${id}/reschedule`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reschedule appointment')
    }
  }
)

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${id}/status?status=CANCELLED`, null, {
        params: { cancellationReason: reason },
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment')
    }
  }
)

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false
        const data = action.payload
        state.appointments = Array.isArray(data) ? data : data?.content || []
        state.totalElements = data?.totalElements
        state.totalPages = data?.totalPages
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload)
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
      })
  },
})

export const { clearError } = appointmentSlice.actions
export default appointmentSlice.reducer
