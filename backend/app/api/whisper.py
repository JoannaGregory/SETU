import os
import subprocess
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

# Path to the Whisper binary (you can replace with the actual path after downloading)
WHISPER_BIN = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../whisper/whisper.exe"))

@router.post("/whisper")
async def whisper_transcribe(file: UploadFile = File(...), language: str = Form(...)):
    """Accept an audio file (webm) and return a transcription.
    The `language` field should be either "en" or "ta" – we map to Whisper language codes.
    """
    if not os.path.exists(WHISPER_BIN):
        raise HTTPException(status_code=500, detail="Whisper binary not found on server.")

    # Save uploaded file to a temporary location
    temp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../tmp"))
    os.makedirs(temp_dir, exist_ok=True)
    tmp_path = os.path.join(temp_dir, f"{uuid.uuid4()}.webm")
    try:
        with open(tmp_path, "wb") as out:
            content = await file.read()
            out.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")

    # Map language codes: Whisper expects ISO‑639‑2 ("eng", "tam")
    lang_map = {"en": "eng", "ta": "tam"}
    whisper_lang = lang_map.get(language.lower(), "eng")

    # Output transcript file path
    output_txt = tmp_path + ".txt"
    cmd = [WHISPER_BIN, "-m", "models/ggml-tiny.bin", "-f", tmp_path, "-l", whisper_lang, "-otxt", "-of", output_txt]

    try:
        subprocess.run(cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Whisper transcription failed: {e.stderr.decode('utf-8')}")

    try:
        with open(output_txt, "r", encoding="utf-8") as f:
            transcript = f.read().strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read Whisper output: {e}")
    finally:
        for p in (tmp_path, output_txt):
            try:
                os.remove(p)
            except OSError:
                pass

    return JSONResponse(content={"transcript": transcript})
