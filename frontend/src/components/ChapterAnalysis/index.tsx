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
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AppDispatch, RootState } from '../../store';
import { fetchOverallStats } from '../../store/statsSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChapterAnalysis: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { overallStats, loading, error } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchOverallStats());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
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
    readingTime: Math.round(data.reading_metrics.total_active_time / 60),
    problemTime: Math.round(data.problem_metrics.total_active_time / 60),
    totalStudents: data.total_students,
  }));

  const activityDistribution = [
    {
      name: 'Reading',
      value: overallStats.activity_distributions.Reading.total_students,
    },
    {
      name: 'Problem',
      value: overallStats.activity_distributions.Problem.total_students,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Chapter Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Interaction Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Interactions by Chapter
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chapterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reading" name="Reading" fill="#8884d8" />
                <Bar dataKey="problem" name="Problem Solving" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Activity Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activity Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Detailed Metrics Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Chapter Metrics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Chapter</TableCell>
                    <TableCell align="right">Total Students</TableCell>
                    <TableCell align="right">Reading Messages</TableCell>
                    <TableCell align="right">Problem Messages</TableCell>
                    <TableCell align="right">Reading Time (min)</TableCell>
                    <TableCell align="right">Problem Time (min)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chapterData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.totalStudents}</TableCell>
                      <TableCell align="right">{row.reading}</TableCell>
                      <TableCell align="right">{row.problem}</TableCell>
                      <TableCell align="right">{row.readingTime}</TableCell>
                      <TableCell align="right">{row.problemTime}</TableCell>
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

export default ChapterAnalysis;