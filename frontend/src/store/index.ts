import { configureStore } from '@reduxjs/toolkit';
import statsReducer from './statsSlice';
import studentsReducer from './studentsSlice';

export const store = configureStore({
  reducer: {
    stats: statsReducer,
    students: studentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;