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

interface WeeklyStats {
  week: string;
  year: string;
  display_week: string;
  total_interactions: number;
  user_messages: number;
  unique_students: number;
  reading_interactions: number;
  problem_interactions: number;
  avg_message_length: number;
  chapter_breakdown: Record<string, {
    total: number;
    reading: number;
    problem: number;
  }>;
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
  weeklyStats: {
    weeks: WeeklyStats[];
  } | null;
  loading: boolean;
  weeklyLoading: boolean;
  error: string | null;
  weeklyError: string | null;
}

const initialState: StatsState = {
  overallStats: null,
  weeklyStats: null,
  loading: false,
  weeklyLoading: false,
  error: null,
  weeklyError: null,
};

export const fetchOverallStats = createAsyncThunk(
  'stats/fetchOverall',
  async () => {
    const response = await axios.get('http://localhost:8000/api/stats/overview');
    return response.data;
  }
);

export const fetchWeeklyStats = createAsyncThunk(
  'stats/fetchWeekly',
  async () => {
    const response = await axios.get('http://localhost:8000/api/stats/weekly');
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
      })
      .addCase(fetchWeeklyStats.pending, (state) => {
        state.weeklyLoading = true;
        state.weeklyError = null;
      })
      .addCase(fetchWeeklyStats.fulfilled, (state, action: PayloadAction<StatsState['weeklyStats']>) => {
        state.weeklyLoading = false;
        state.weeklyStats = action.payload;
      })
      .addCase(fetchWeeklyStats.rejected, (state, action) => {
        state.weeklyLoading = false;
        state.weeklyError = action.error.message || 'Failed to fetch weekly stats';
      });
  },
});

export default statsSlice.reducer;