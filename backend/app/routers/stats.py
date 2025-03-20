from fastapi import APIRouter, Depends
from typing import Dict, Any

from ..services.data_processor import DataProcessor

router = APIRouter(
    prefix="/stats",
    tags=["statistics"]
)

def get_data_processor():
    # In production, you might want to use dependency injection
    # and environment variables for the data directory
    return DataProcessor("../../")

@router.get("/overview")
async def get_overview_stats(
    data_processor: DataProcessor = Depends(get_data_processor)
) -> Dict[str, Any]:
    """Get overall statistics across all chapters and activities."""
    return data_processor.get_overall_statistics()

@router.get("/chapter/{chapter_id}")
async def get_chapter_stats(
    chapter_id: str,
    data_processor: DataProcessor = Depends(get_data_processor)
) -> Dict[str, Any]:
    """Get statistics for a specific chapter."""
    return data_processor.get_chapter_summary(chapter_id)

@router.get("/activity-comparison")
async def get_activity_comparison(
    data_processor: DataProcessor = Depends(get_data_processor)
) -> Dict[str, Any]:
    """Get comparison between reading and problem-solving activities."""
    stats = data_processor.get_overall_statistics()
    return {
        'activity_distributions': stats['activity_distributions'],
        'chapter_comparisons': stats['chapter_comparisons']
    }

@router.get("/weekly")
async def get_weekly_stats(
    data_processor: DataProcessor = Depends(get_data_processor)
) -> Dict[str, Any]:
    """Get activity statistics grouped by week."""
    return data_processor.get_weekly_statistics()