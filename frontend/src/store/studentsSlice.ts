import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface StudentMetrics {
  total_messages: number;
  user_messages: number;
  avg_response_length: number;
  total_active_time: number;
}

interface StudentHistory {
  chapters: {
    [chapter: string]: {
      Reading?: StudentMetrics;
      Problem?: StudentMetrics;
    };
  };
  overall_metrics: {
    total_interactions: number;
    total_active_time: number;
    avg_response_length: number;
  };
}

interface StudentSummary {
  id: string;
  total_interactions: number;
  total_active_time: number;
  avg_response_length: number;
}

interface StudentsState {
  list: StudentSummary[];
  selectedStudent: string | null;
  studentHistory: StudentHistory | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  list: [],
  selectedStudent: null,
  studentHistory: null,
  loading: false,
  error: null,
};

export const fetchStudentsList = createAsyncThunk(
  'students/fetchList',
  async () => {
    const response = await axios.get<StudentSummary[]>('http://localhost:8000/api/students');
    return response.data;
  }
);

export const fetchStudentHistory = createAsyncThunk(
  'students/fetchHistory',
  async (studentId: string) => {
    const response = await axios.get(`http://localhost:8000/api/students/${studentId}`);
    return response.data;
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setSelectedStudent: (state, action: PayloadAction<string | null>) => {
      state.selectedStudent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsList.fulfilled, (state, action: PayloadAction<StudentSummary[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchStudentsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch students list';
      })
      .addCase(fetchStudentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentHistory.fulfilled, (state, action: PayloadAction<StudentHistory>) => {
        state.loading = false;
        state.studentHistory = action.payload;
      })
      .addCase(fetchStudentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch student history';
      });
  },
});

export const { setSelectedStudent } = studentsSlice.actions;
export default studentsSlice.reducer;