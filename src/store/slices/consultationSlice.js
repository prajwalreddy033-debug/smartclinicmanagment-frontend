import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const fetchConsultations = createAsyncThunk(
  'consultations/fetchConsultations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/consultations', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consultations')
    }
  }
)

export const createConsultation = createAsyncThunk(
  'consultations/createConsultation',
  async (consultationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/consultations', consultationData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create consultation')
    }
  }
)

const consultationSlice = createSlice({
  name: 'consultations',
  initialState: {
    consultations: [],
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
      .addCase(fetchConsultations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConsultations.fulfilled, (state, action) => {
        state.loading = false
        const data = action.payload
        state.consultations = Array.isArray(data) ? data : data?.content || []
        state.totalElements = data?.totalElements
        state.totalPages = data?.totalPages
      })
      .addCase(fetchConsultations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createConsultation.fulfilled, (state, action) => {
        state.consultations.push(action.payload)
      })
  },
})

export const { clearError } = consultationSlice.actions
export default consultationSlice.reducer
