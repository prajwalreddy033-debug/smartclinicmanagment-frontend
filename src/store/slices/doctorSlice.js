import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctors', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors')
    }
  }
)

export const createDoctor = createAsyncThunk(
  'doctors/createDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/doctors', doctorData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create doctor')
    }
  }
)

const doctorSlice = createSlice({
  name: 'doctors',
  initialState: {
    doctors: [],
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
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false
        state.doctors = action.payload
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createDoctor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.loading = false
        state.doctors.push(action.payload)
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = doctorSlice.actions
export default doctorSlice.reducer
