from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List

from ..services.data_processor import DataProcessor

router = APIRouter(
    prefix="/students",
    tags=["students"]
)

def get_data_processor():
    return DataProcessor("../../")

@router.get("")
async def get_all_students(
    data_processor: DataProcessor = Depends(get_data_processor)
) -> List[str]:
    """Get list of all student IDs."""
    return data_processor.get_all_students()

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