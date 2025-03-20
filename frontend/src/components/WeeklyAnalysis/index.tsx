import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
} from 'recharts';
import { AppDispatch, RootState } from '../../store';
import { fetchWeeklyStats } from '../../store/statsSlice';

const WeeklyAnalysis: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { weeklyStats, weeklyLoading, weeklyError } = useSelector((state: RootState) => state.stats);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchWeeklyStats());
  }, [dispatch]);

  if (weeklyLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (weeklyError) {
    return <Typography color="error">{weeklyError}</Typography>;
  }

  if (!weeklyStats || weeklyStats.weeks.length === 0) {
    return <Typography>No weekly data available</Typography>;
  }

  // Sort weeks chronologically
  const sortedWeeks = [...weeklyStats.weeks].sort((a, b) => {
    if (a.year !== b.year) {
      return parseInt(a.year) - parseInt(b.year);
    }
    return a.week.localeCompare(b.week);
  });

  // Prepare data for the trend chart
  const trendData = sortedWeeks.map((week) => ({
    name: week.display_week,
    total: week.total_interactions,
    reading: week.reading_interactions,
    problem: week.problem_interactions,
    students: week.unique_students,
    avgLength: week.avg_message_length,
  }));

  // Calculate chapters present in the data for the stacked chart
  const allChapters = new Set<string>();
  sortedWeeks.forEach(week => {
    Object.keys(week.chapter_breakdown).forEach(chapter => {
      allChapters.add(chapter);
    });
  });
  
  // Prepare data for stacked bar chart showing chapters
  const chapterBreakdownData = sortedWeeks.map((week) => {
    const data: any = {
      name: week.display_week,
    };
    
    // Add data for each chapter (defaulting to 0 if not present)
    allChapters.forEach(chapter => {
      data[chapter] = week.chapter_breakdown[chapter]?.total || 0;
    });
    
    return data;
  });

  // Choose colors for each chapter
  const chapterColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042',
    '#d84315',
    '#4caf50',
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Weekly Interaction Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Weekly Trend Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Interaction Trends
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="reading" name="Reading Interactions" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="problem" name="Problem Interactions" fill="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="students" name="Unique Students" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Chapter Breakdown by Week */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chapter Interactions by Week
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chapterBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Array.from(allChapters).map((chapter, index) => (
                  <Bar 
                    key={chapter}
                    dataKey={chapter} 
                    name={`${chapter} Interactions`} 
                    stackId="a" 
                    fill={chapterColors[index % chapterColors.length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Message Length & Activity Type Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Student Engagement Metrics
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgLength" name="Avg Message Length" stroke="#8884d8" />
                <Line type="monotone" dataKey="students" name="Active Students" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Detailed Weekly Data Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Weekly Data
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Week</TableCell>
                    <TableCell align="right">Total Interactions</TableCell>
                    <TableCell align="right">Reading</TableCell>
                    <TableCell align="right">Problem Solving</TableCell>
                    <TableCell align="right">Unique Students</TableCell>
                    <TableCell align="right">Avg Message Length</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedWeeks.map((week) => (
                    <TableRow key={week.display_week}>
                      <TableCell component="th" scope="row">
                        {week.display_week}
                      </TableCell>
                      <TableCell align="right">{week.total_interactions}</TableCell>
                      <TableCell align="right">{week.reading_interactions}</TableCell>
                      <TableCell align="right">{week.problem_interactions}</TableCell>
                      <TableCell align="right">{week.unique_students}</TableCell>
                      <TableCell align="right">{week.avg_message_length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WeeklyAnalysis;