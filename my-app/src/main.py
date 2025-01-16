# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict
import json

app = FastAPI()

# Simple data storage (in-memory for learning purposes)
# In a real application, you'd want to use a database
class DataStore:
    def __init__(self):
        # Load initial data from your existing data.js
        self.annotation_points = [
            {
                "Rendering": {
                    "position": [0.8, 1.15, 1.2],
                    "title": "Point A",
                    "description": "Primary monitoring point",
                    "color1": 0xff8888,
                    "color2": 0xff0000,
                    "cameraView": {
                        "position": [2, 2, 0],
                        "lookAt": [0.8, 1.15, 0.3],
                        "zoom": 8
                    }
                },
                "title": "Scanner",
                "gateId": "gate1",
                "content": {
                    "Health": "79%",
                    "ScanningTime": 12,
                    "ProcessingTime": 21
                }
            }
            # Add other points as needed
        ]

    def update_colors(self):
        """Update colors based on health metrics"""
        for point in self.annotation_points:
            health = int(point["content"]["Health"].rstrip('%'))
            
            # Set colors based on health
            if health >= 70:
                point["Rendering"]["color1"] = 0x8CD47E  # Green
                point["Rendering"]["color2"] = 0x68A85E
            elif health >= 50:
                point["Rendering"]["color1"] = 0xFFD066  # Yellow
                point["Rendering"]["color2"] = 0xFFBB22
            else:
                point["Rendering"]["color1"] = 0xFF6961  # Red
                point["Rendering"]["color2"] = 0xFF0000

    def get_cards_data(self):
        """Calculate cards data based on health metrics"""
        red_count = yellow_count = green_count = 0
        
        for point in self.annotation_points:
            health = int(point["content"]["Health"].rstrip('%'))
            if health >= 70:
                green_count += 1
            elif health >= 50:
                yellow_count += 1
            else:
                red_count += 1
                
        return [
            {"title": "Number of Red/month", "content": str(red_count), "colour": "#FF6961"},
            {"title": "Number of Yellow/month", "content": str(yellow_count), "colour": "#FFB54C"},
            {"title": "Number of Green/month", "content": str(green_count), "colour": "#8CD47E"}
        ]

# Initialize data store
data_store = DataStore()

# Pydantic model for content updates
class ContentUpdate(BaseModel):
    Health: str
    ScanningTime: Optional[int]
    ProcessingTime: Optional[int]

# API Routes
@app.get("/api/data")
async def get_all_data():
    """Get both annotation points and cards data"""
    data_store.update_colors()  # Update colors based on current health values
    return {
        "annotation_points": data_store.annotation_points,
        "cards_data": data_store.get_cards_data()
    }

@app.put("/api/points/{gate_id}")
async def update_point(gate_id: str, content: ContentUpdate):
    """Update a point's content"""
    # Find and update the point
    for point in data_store.annotation_points:
        if point["gateId"] == gate_id:
            point["content"].update(content.dict(exclude_unset=True))
            data_store.update_colors()  # Update colors after content change
            return {"message": "Updated successfully"}
            
    return {"message": "Point not found"}