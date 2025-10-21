from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import requests
import io
import json

# --- CONFIG ---
OPENROUTER_API_KEY = "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"
model = YOLO("yolov8s.pt")


# --- FASTAPI APP ---
app = FastAPI()

# ✅ Allowed origins (React frontend)
origins = [
    "http://localhost:3000",  # frontend React dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # or ["*"] during dev if issues persist
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class ObjectRequest(BaseModel):
    object_name: str

# --- ROUTES ---

# 🎯 Object detection route
@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    results = model(img)
    detected_objects = []

    for r in results:
        for box, cls, conf in zip(r.boxes.xyxy, r.boxes.cls, r.boxes.conf):
            detected_objects.append({
                "class": model.names[int(cls)],
                "confidence": float(conf),
                "bbox": [float(x) for x in box]
            })

    return {"predictions": detected_objects}


# 🌱 Eco info route
@app.post("/eco-info")
def get_eco_info(req: ObjectRequest):
    object_name = req.object_name
    prompt = f"""
    Provide structured eco-friendly info about "{object_name}".
    Return only strict JSON with keys:
    recyclable, carbon, alternative, summary, videos, links.
    - recyclable: string ("Yes"/"No"/"Partially")
    - carbon: string description of footprint
    - alternative: string eco-friendly replacement
    - summary: short summary text
    - videos: array of valid YouTube URLs
    - links: array of valid website URLs
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "google/gemma-3-27b-it:free",
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions",
                                 headers=headers, json=data, timeout=30)
    except Exception as e:
        return {
            "recyclable": "Unknown",
            "carbon": "Unknown",
            "alternative": "Unknown",
            "summary": f"API request failed: {str(e)}",
            "videos": [f"https://www.youtube.com/results?search_query={object_name}+recycling+eco-friendly"],
            "links": []
        }

    if response.status_code != 200:
        return {
            "recyclable": "Unknown",
            "carbon": "Unknown",
            "alternative": "Unknown",
            "summary": f"OpenRouter error: {response.status_code}",
            "videos": [f"https://www.youtube.com/results?search_query={object_name}+recycling+eco-friendly"],
            "links": []
        }

    try:
        content = response.json()["choices"][0]["message"]["content"]

        # Ensure content is valid JSON (sometimes LLM returns text with ```json)
        content_clean = content.strip().replace("```json", "").replace("```", "")
        parsed = json.loads(content_clean)

        # 🔒 Guarantee keys exist
        return {
            "recyclable": parsed.get("recyclable", "Unknown"),
            "carbon": parsed.get("carbon", "Unknown"),
            "alternative": parsed.get("alternative", "Unknown"),
            "summary": parsed.get("summary", "No data available"),
            "videos": parsed.get("videos", []),
            "links": parsed.get("links", [])
        }

    except Exception as e:
        return {
            "recyclable": "Unknown",
            "carbon": "Unknown",
            "alternative": "Unknown",
            "summary": f"Parsing error: {str(e)}",
            "videos": [f"https://www.youtube.com/results?search_query={object_name}+recycling+eco-friendly"],
            "links": []
        }