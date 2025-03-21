from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List

from ..services.data_processor import DataProcessor

router = APIRouter(
    prefix="/students",
    tags=["students"]
)

def get_data_processor():
    return DataProcessor()

@router.get("")
async def get_all_students(
    data_processor: DataProcessor = Depends(get_data_processor)
) -> List[Dict[str, Any]]:
    """Get list of all students with their summary metrics."""
    students = []
    for student_id in data_processor.get_all_students():
        history = data_processor.get_student_history(student_id)
        students.append({
            "id": student_id,
            "total_interactions": history["overall_metrics"]["total_interactions"],
            "total_active_time": round(history["overall_metrics"]["total_active_time"] / 60, 1),  # Convert to minutes
            "avg_response_length": history["overall_metrics"]["avg_response_length"]
        })
    return students

@router.get("/{student_id}")
async def get_student_history(
    student_id: str,
    data_processor: DataProcessor = Depends(get_data_processor)
) -> Dict[str, Any]:
    """Get complete history for a specific student."""
    try:
        return data_processor.get_student_history(student_id)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found"
        )