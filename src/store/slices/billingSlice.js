import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const fetchBills = createAsyncThunk(
  'billing/fetchBills',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/bills', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bills')
    }
  }
)

export const createBill = createAsyncThunk(
  'billing/createBill',
  async (billData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bills', billData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create bill')
    }
  }
)

export const processPayment = createAsyncThunk(
  'billing/processPayment',
  async ({ billId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/bills/${billId}/payments`, paymentData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment')
    }
  }
)

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    bills: [],
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
      .addCase(fetchBills.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false
        const data = action.payload
        state.bills = Array.isArray(data) ? data : data?.content || []
        state.totalElements = data?.totalElements
        state.totalPages = data?.totalPages
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.bills.push(action.payload)
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        const index = state.bills.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          state.bills[index] = action.payload
        }
      })
  },
})

export const { clearError } = billingSlice.actions
export default billingSlice.reducer
