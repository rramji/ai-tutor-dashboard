import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface ChapterMetrics {
  total_students: number;
  reading_metrics: {
    total_messages: number;
    avg_response_length: number;
    total_active_time: number;
  };
  problem_metrics: {
    total_messages: number;
    avg_response_length: number;
    total_active_time: number;
  };
}

interface StatsState {
  overallStats: {
    total_unique_students: number;
    total_interactions: number;
    avg_active_time: number;
    avg_response_length: number;
    chapter_comparisons: Record<string, ChapterMetrics>;
    activity_distributions: {
      Reading: { total_students: number; avg_messages: number };
      Problem: { total_students: number; avg_messages: number };
    };
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  overallStats: null,
  loading: false,
  error: null,
};

export const fetchOverallStats = createAsyncThunk(
  'stats/fetchOverall',
  async () => {
    const response = await axios.get('http://localhost:8000/api/stats/overview');
    return response.data;
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverallStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverallStats.fulfilled, (state, action: PayloadAction<StatsState['overallStats']>) => {
        state.loading = false;
        state.overallStats = action.payload;
      })
      .addCase(fetchOverallStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      });
  },
});

export default statsSlice.reducer;