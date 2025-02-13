# AI Tutor Dashboard

An interactive dashboard for visualizing student interaction and engagement data with an AI tutor. This application provides insights into student behavior, engagement patterns, and AI tutor performance across different chapters and activities.

## Features

- Overall statistics and engagement metrics
- Per-chapter analysis of student interactions
- Individual student performance tracking
- Comparison between reading and problem-solving activities
- Interactive visualizations and data tables
- Real-time data processing and analysis

## Project Structure

```
ai-tutor-dashboard/
├── backend/
│   ├── app/
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # Business logic and data processing
│   │   └── main.py        # FastAPI application entry point
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API client services
│   │   ├── store/         # Redux store and slices
│   │   └── utils/         # Utility functions
│   ├── package.json       # Frontend dependencies
│   └── tsconfig.json      # TypeScript configuration
└── package.json           # Root package.json for running both services
```

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-tutor-dashboard
```

2. Install dependencies:
```bash
# Install all dependencies (backend and frontend)
npm run install:all
```

3. Start the development servers:
```bash
# Start both backend and frontend servers
npm start

# Or start them separately:
npm run start:backend
npm run start:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Available Scripts

- `npm run install:all` - Install all dependencies for both backend and frontend
- `npm run start` - Start both backend and frontend servers
- `npm run start:backend` - Start only the backend server
- `npm run start:frontend` - Start only the frontend server

## API Endpoints

### Statistics
- `GET /api/stats/overview` - Get overall statistics
- `GET /api/stats/chapter/{chapter_id}` - Get statistics for a specific chapter
- `GET /api/stats/activity-comparison` - Get comparison between reading and problem-solving activities

### Students
- `GET /api/students` - Get list of all students
- `GET /api/students/{student_id}` - Get complete history for a specific student

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- Pandas - Data manipulation and analysis
- NumPy - Numerical computing tools

### Frontend
- React - UI library
- TypeScript - Type-safe JavaScript
- Material-UI - Component library
- Redux Toolkit - State management
- Recharts - Charting library

## Data Structure

The dashboard processes anonymized student interaction data stored in JSON files with the following structure:

```json
{
  "student_id": "anonymized_id",
  "interactions": [
    {
      "role": "user",
      "content": "message content",
      "timestamp": "ISO timestamp"
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.