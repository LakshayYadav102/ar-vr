from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import requests
import io
import json
import os
from dotenv import load_dotenv

# --- LOAD ENV ---
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise ValueError("❌ Missing OPENROUTER_API_KEY in .env file!")

# --- YOLO MODEL ---
model = YOLO("yolov8s.pt")

# --- FASTAPI APP ---
app = FastAPI()

# --- ✅ CORS FIXED FOR NETLIFY + LOCAL ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://earnest-chebakia-cd10ff.netlify.app",  # your Netlify domain
        "http://localhost:3000",                        # for local testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class ObjectRequest(BaseModel):
    object_name: str


# 🎯 Object detection route
@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    try:
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

    except Exception as e:
        return {"error": f"Detection failed: {str(e)}"}


# 🌱 Eco info route
@app.post("/eco-info")
def get_eco_info(req: ObjectRequest):
    object_name = req.object_name

    prompt = f"""
    Provide structured eco-friendly info about "{object_name}".
    Return only valid JSON with keys:
    recyclable, carbon, alternative, summary, videos, links.
    Example:
    {{
      "recyclable": "Yes",
      "carbon": "Moderate impact",
      "alternative": "Glass or metal version",
      "summary": "Plastic bottles are recyclable but contribute to pollution.",
      "videos": ["https://youtube.com/..."],
      "links": ["https://www.earth.org/..."]
    }}
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://earnest-chebakia-cd10ff.netlify.app",
        "User-Agent": "GreenVerse-ARVRHub/1.0",
    }

    data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )

        if response.status_code != 200:
            return {
                "recyclable": "Unknown",
                "carbon": "Unknown",
                "alternative": "Unknown",
                "summary": f"OpenRouter error {response.status_code}: {response.text}",
                "videos": [f"https://www.youtube.com/results?search_query={object_name}+recycling"],
                "links": []
            }

        content = response.json()["choices"][0]["message"]["content"]
        content_clean = content.strip().replace("```json", "").replace("```", "")

        parsed = json.loads(content_clean)

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
            "summary": f"Backend error: {str(e)}",
            "videos": [f"https://www.youtube.com/results?search_query={object_name}+recycling"],
            "links": []
        }


# ✅ Run Server (local only)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
