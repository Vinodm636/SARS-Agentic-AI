from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any

try:
    from ..services.transcription_service import TranscriptionService
except ImportError:  # pragma: no cover - supports running the backend directly
    from services.transcription_service import TranscriptionService

router = APIRouter()
transcription_service = TranscriptionService()

@router.post("/upload")
async def transcribe_audio(
    audio: UploadFile = File(..., description="Emergency call audio file (MP3, WAV, etc.)")
) -> Dict[str, Any]:
    """
    Upload and transcribe emergency call audio file
    
    - Accepts MP3, WAV, M4A, and other audio formats
    - Transcribes audio to text using OpenAI Whisper
    - Extracts patient information using GPT
    - Returns structured emergency data
    """
    
    # Validate file type
    allowed_types = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/m4a", "audio/x-m4a", "audio/webm", "audio/ogg"]
    allowed_extensions = [".mp3", ".mpeg", ".wav", ".m4a", ".ogg", ".flac", ".webm"]
    
    file_extension = audio.filename.lower().split('.')[-1]
    if not (audio.content_type in allowed_types or f".{file_extension}" in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (max 25MB)
    file_bytes = await audio.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    
    if file_size_mb > 25:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 25MB limit"
        )
    
    try:
        # Process audio file
        result = await transcription_service.process_audio_file(file_bytes, audio.filename)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Transcription failed: {result.get('error', 'Unknown error')}"
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Audio transcribed successfully",
                "data": {
                    "transcription": result.get("transcription", ""),
                    "extracted_data": result.get("extracted_data", {}),
                    "audio_duration": result.get("audio_duration", 0),
                    "filename": audio.filename
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/extract")
async def extract_from_text(request: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract patient information from already transcribed text
    
    Request body:
    {
        "text": "transcribed emergency call text"
    }
    """
    
    text = request.get("text", "").strip()
    
    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text field is required and cannot be empty"
        )
    
    try:
        extracted_data = await transcription_service.extract_patient_info(text)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Information extracted successfully",
                "data": extracted_data
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Extraction failed: {str(e)}"
        )
