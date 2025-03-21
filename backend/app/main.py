import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from .routers import stats, students

app = FastAPI(
    title="AI Tutor Dashboard API",
    description="API for analyzing student interactions with AI tutor",
    version="1.0.0"
)

# Get environment-specific CORS settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
if ENVIRONMENT == "production":
    # In production, only allow requests from the Netlify frontend
    ALLOWED_ORIGINS = [
        "https://ai-tutor-dashboard-demo.netlify.app",
        "https://www.ai-tutor-dashboard-demo.netlify.app"
    ]
else:
    # In development, allow all origins
    ALLOWED_ORIGINS = ["*"]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stats.router, prefix="/api")
app.include_router(students.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "AI Tutor Dashboard API",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)