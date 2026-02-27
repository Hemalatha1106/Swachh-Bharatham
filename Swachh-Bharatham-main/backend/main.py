from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from PIL import Image
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Swachh Bharatham AI Backend",
    description="FastAPI backend for waste classification using TrashNet",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Waste categories
WASTE_CATEGORIES = {
    0: {"name": "Organic", "confidence_boost": 1.0},
    1: {"name": "Plastic", "confidence_boost": 0.95},
    2: {"name": "Metal", "confidence_boost": 0.98},
    3: {"name": "Glass", "confidence_boost": 0.92},
    4: {"name": "Paper", "confidence_boost": 0.90},
    5: {"name": "Electronics", "confidence_boost": 0.88},
    6: {"name": "Hazardous", "confidence_boost": 0.85},
}

class ClassificationResponse(BaseModel):
    waste_type: str
    category_id: int
    confidence: float
    recommendations: list[str]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Swachh Bharatham AI Backend"}

@app.post("/classify", response_model=ClassificationResponse)
async def classify_waste(file: UploadFile = File(...)):
    """
    Classify waste from an uploaded image using TrashNet model.
    
    Expected: JPEG/PNG image file
    Returns: Waste classification with confidence score
    """
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Validate image
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image to 224x224 (standard for TrashNet)
        image = image.resize((224, 224))
        
        # Convert to numpy array and normalize
        image_array = np.array(image).astype(np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
        
        # For demonstration, we'll simulate the model prediction
        # In production, load actual ONNX model
        prediction = simulate_trashnet_prediction(image_array)
        
        category_id = int(prediction['category'])
        confidence = float(prediction['confidence'])
        
        category = WASTE_CATEGORIES.get(category_id, WASTE_CATEGORIES[0])
        
        # Generate recommendations
        recommendations = generate_recommendations(category['name'])
        
        return ClassificationResponse(
            waste_type=category['name'],
            category_id=category_id,
            confidence=confidence,
            recommendations=recommendations
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to classify image: {str(e)}"
        )

@app.post("/batch-classify")
async def batch_classify(files: list[UploadFile] = File(...)):
    """
    Classify multiple images in a batch.
    
    Returns: List of classifications
    """
    results = []
    
    for file in files:
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            image = image.resize((224, 224))
            image_array = np.array(image).astype(np.float32) / 255.0
            image_array = np.expand_dims(image_array, axis=0)
            
            prediction = simulate_trashnet_prediction(image_array)
            category_id = int(prediction['category'])
            confidence = float(prediction['confidence'])
            
            category = WASTE_CATEGORIES.get(category_id, WASTE_CATEGORIES[0])
            
            results.append({
                "filename": file.filename,
                "waste_type": category['name'],
                "category_id": category_id,
                "confidence": confidence,
            })
        
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"results": results}

def simulate_trashnet_prediction(image_array: np.ndarray) -> dict:
    """
    Simulate TrashNet model prediction.
    In production, replace with actual ONNX model inference.
    """
    # Generate random predictions for demo
    # In production, use actual model: session.run(None, {"input": image_array})
    
    import random
    
    category = random.randint(0, 6)
    base_confidence = random.uniform(0.70, 0.99)
    confidence_boost = WASTE_CATEGORIES[category]["confidence_boost"]
    confidence = min(base_confidence * confidence_boost, 1.0)
    
    return {
        "category": category,
        "confidence": confidence
    }

def generate_recommendations(waste_type: str) -> list[str]:
    """Generate handling recommendations based on waste type."""
    recommendations_map = {
        "Organic": [
            "Segregate from other waste",
            "Can be composted",
            "Use for biogas production",
            "Proper storage to avoid decomposition"
        ],
        "Plastic": [
            "Separate from wet waste",
            "Check for recyclability code",
            "Clean before disposal",
            "Can be repurposed or recycled"
        ],
        "Metal": [
            "Remove any plastic/paper attached",
            "Check for sharp edges",
            "High recycling value",
            "Separate ferrous and non-ferrous"
        ],
        "Glass": [
            "Handle carefully to avoid breakage",
            "Separate clear and colored glass",
            "Use gloves when handling",
            "High recyclability potential"
        ],
        "Paper": [
            "Keep dry to maintain recyclability",
            "Remove plastic/plastic coating",
            "Can be composted if not treated",
            "Remove wet portions"
        ],
        "Electronics": [
            "Handle as hazardous waste",
            "Do not throw in regular bins",
            "Contains valuable metals",
            "Requires specialized recycling"
        ],
        "Hazardous": [
            "Use proper containment",
            "Wear protective equipment",
            "Contact local authorities",
            "Never mix with regular waste"
        ]
    }
    
    return recommendations_map.get(waste_type, ["Consult local waste management guidelines"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
