import logging
import os
from fastapi import FastAPI
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sentiment Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("Loading sentiment analysis model...")
sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
logger.info("Model loaded successfully.")

class SentimentRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze_sentiment(request: SentimentRequest):
    text_input = request.text[:1500]
    
    try:
        result = sentiment_pipeline(text_input)[0]
        label = result['label']
        score = result['score']
        
        mapped_label = label.capitalize()
        
        return {
            "sentiment": mapped_label,
            "confidence": score,
            "success": True
        }
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# Mount Frontend Static Files if they exist
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{catchall:path}")
    def serve_react_app(catchall: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces runs on port 7860
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
