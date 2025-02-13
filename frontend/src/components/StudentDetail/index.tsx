import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
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
} from 'recharts';
import { AppDispatch, RootState } from '../../store';
import { fetchStudentHistory } from '../../store/studentsSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { studentHistory, loading, error } = useSelector((state: RootState) => state.students);
  const [tabValue, setTabValue] = React.useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentHistory(id));
    }
  }, [dispatch, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  if (!studentHistory) {
    return <Typography>No data available for this student</Typography>;
  }

  const chapterData = Object.entries(studentHistory.chapters).map(([chapter, data]) => ({
    name: chapter,
    reading: data.Reading?.total_messages || 0,
    problem: data.Problem?.total_messages || 0,
    readingTime: Math.round((data.Reading?.total_active_time || 0) / 60),
    problemTime: Math.round((data.Problem?.total_active_time || 0) / 60),
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Student Details: {id}
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Total Interactions</Typography>
                <Typography variant="h4">
                  {studentHistory.overall_metrics.total_interactions}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Total Active Time</Typography>
                <Typography variant="h4">
                  {Math.round(studentHistory.overall_metrics.total_active_time / 60)} min
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Avg Response Length</Typography>
                <Typography variant="h4">
                  {Math.round(studentHistory.overall_metrics.avg_response_length)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Detailed Analysis */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="student analysis tabs">
              <Tab label="Interaction Patterns" />
              <Tab label="Time Analysis" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chapterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reading"
                    name="Reading Interactions"
                    stroke="#8884d8"
                  />
                  <Line
                    type="monotone"
                    dataKey="problem"
                    name="Problem Interactions"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chapterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="readingTime"
                    name="Reading Time (min)"
                    stroke="#8884d8"
                  />
                  <Line
                    type="monotone"
                    dataKey="problemTime"
                    name="Problem Time (min)"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDetail;