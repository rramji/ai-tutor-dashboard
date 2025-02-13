from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import stats, students

app = FastAPI(
    title="AI Tutor Dashboard API",
    description="API for analyzing student interactions with AI tutor",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
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