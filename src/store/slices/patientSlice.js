import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients')
    }
  }
)

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create patient')
    }
  }
)

const patientSlice = createSlice({
  name: 'patients',
  initialState: {
    patients: [],
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
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false
        const data = action.payload
        state.patients = Array.isArray(data) ? data : data?.content || []
        state.totalElements = data?.totalElements
        state.totalPages = data?.totalPages
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload)
      })
  },
})

export const { clearError } = patientSlice.actions
export default patientSlice.reducer
