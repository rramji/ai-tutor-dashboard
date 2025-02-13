import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import { fetchOverallStats } from '../../store/statsSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { overallStats, loading, error } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchOverallStats());
  }, [dispatch]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!overallStats) {
    return <Typography>No data available</Typography>;
  }

  const chapterData = Object.entries(overallStats.chapter_comparisons).map(([chapter, data]) => ({
    name: chapter,
    reading: data.reading_metrics.total_messages,
    problem: data.problem_metrics.total_messages,
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Statistics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Statistics
            </Typography>
            <Typography>
              Total Students: {overallStats.total_unique_students}
            </Typography>
            <Typography>
              Total Interactions: {overallStats.total_interactions}
            </Typography>
            <Typography>
              Average Active Time: {Math.round(overallStats.avg_active_time / 60)} minutes
            </Typography>
          </Paper>
        </Grid>

        {/* Activity Distribution */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chapter Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chapterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reading" name="Reading Interactions" fill="#8884d8" />
                <Bar dataKey="problem" name="Problem Interactions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Activity Distribution Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activity Distribution
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Reading Activities</Typography>
                <Typography>
                  Total Students: {overallStats.activity_distributions.Reading.total_students}
                </Typography>
                <Typography>
                  Average Messages: {Math.round(overallStats.activity_distributions.Reading.avg_messages)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Problem-Solving Activities</Typography>
                <Typography>
                  Total Students: {overallStats.activity_distributions.Problem.total_students}
                </Typography>
                <Typography>
                  Average Messages: {Math.round(overallStats.activity_distributions.Problem.avg_messages)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;