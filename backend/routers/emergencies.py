from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter()

# Mock emergencies data
mock_emergencies = []

@router.get("/")
async def get_all_emergencies() -> List[Dict[str, Any]]:
    """Get all active emergencies"""
    return mock_emergencies

@router.post("/")
async def create_emergency(emergency_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new emergency"""
    new_emergency = {
        "id": f"EMG-{len(mock_emergencies) + 1:03d}",
        **emergency_data,
        "status": "new"
    }
    mock_emergencies.append(new_emergency)
    
    return {
        "success": True,
        "message": "Emergency created successfully",
        "emergency": new_emergency
    }

@router.get("/{emergency_id}")
async def get_emergency(emergency_id: str) -> Dict[str, Any]:
    """Get specific emergency details"""
    emergency = next((emg for emg in mock_emergencies if emg["id"] == emergency_id), None)
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency

@router.put("/{emergency_id}")
async def update_emergency(emergency_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update emergency information"""
    return {
        "success": True,
        "message": f"Emergency {emergency_id} updated",
        "emergency_id": emergency_id
    }

@router.delete("/{emergency_id}")
async def delete_emergency(emergency_id: str) -> Dict[str, Any]:
    """Delete/close an emergency"""
    global mock_emergencies
    mock_emergencies = [emg for emg in mock_emergencies if emg["id"] != emergency_id]
    
    return {
        "success": True,
        "message": f"Emergency {emergency_id} closed"
    }
