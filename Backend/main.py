from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel,Field, validator
from typing import Dict, Any, List
import uvicorn

def get_health_colors(health_value: str):
    """
    Convert health percentage to color values.
    Returns (color1, color2) tuple with hex color values.
    """
    try:
        # Remove the % sign and convert to float
        health = float(health_value.rstrip('%'))
        
        if health >= 80:
            # Green gradient
            return (0xCDD839, 0xA2AD14)
        elif health >= 60:
            # Yellow gradient
            return (0xFFD066, 0xFFBB22)
        else:
            # Red gradient
            return (0xff8888, 0xff0000)

    except (ValueError, TypeError):
        # Default colors if health value is invalid
        return "error"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CameraView(BaseModel):
    position: List[float]
    lookAt: List[float]
    zoom: int

class Rendering(BaseModel):
    position: List[float]
    title: str
    description: str
    color1: int = Field(default=0x888888)  # Default gray color
    color2: int = Field(default=0x444444)
    cameraView: CameraView

class AnnotationPoint(BaseModel):  # Changed from Gate to Point to match your data structure
    Rendering: Rendering  # Capital R to match your data
    title: str
    gateId: str
    content: Dict[str, Any]

    def __init__(self, **data):
        if 'content' in data and 'Health' in data['content']:
            color1, color2 = get_health_colors(data['content']['Health'])
            if 'Rendering' not in data:
                data['Rendering'] = {}
            data['Rendering']['color1'] = color1
            data['Rendering']['color2'] = color2
        super().__init__(**data)


class GatePoint(BaseModel):  # Changed from Gate to Point to match your data structure
    gatePosition: List[float]
    gateTitle: str
    color1: int
    color2: int
    cameraView: CameraView

class UpdateHealthRequest(BaseModel):
    health: str  # Expecting the health in the format "50%", "80%", etc.


class CardPoint(BaseModel):
    title: str
    content: int
    colour: str

# Sample data
annotation_points = [
    {
        "Rendering": {
            "position": [0.8, 1.15, 1.2],
            "title": "Point_A",
            "description": "Primary monitoring point",
            "cameraView": {
                "position": [2, 2, 0],
                "lookAt": [0.8, 1.15, 0.3],
                "zoom": 8
            }
        },
        "title": "Scanner",
        "gateId": "gate1",
        "content": {
            "Health": "20%",
            "ScanningTime": 12,
            "ProcessingTime": 21
        }
    },
    {
        "Rendering": {
            "position": [-0.5, 0.7, -1.2],
            "title": "Point_B",
            "description": "Secondary checkpoint with environmental sensors",
            "cameraView": {
                "position": [0.4, 1.2, 0],
                "lookAt": [-0.3, 0.7, -1.2],
                "zoom": 9
            }
        },
        "title": "Rear Gate 1",
        "gateId": "gate1",
        "content": {
            "Health": "90%",
            "OpeningTime": 10
        }
    },
    {
        "Rendering": {
            "position": [0.5, 0.7, -1.2],
            "title": "Point_C",
            "description": "Secondary checkpoint with environmental sensors",
            "cameraView": {
                "position": [0.2, 1.2, 0],
                "lookAt": [0.7, 0.7, -1.2],
                "zoom": 8
            }
        },
        "title": "Rear Gate 2",
        "gateId": "gate1",
        "content": {
            "Health": "69%",
            "OpeningTime": 10
        }
    },
    {
        "Rendering": {
            "position": [-2.2, 1.15, 1.2],
            "widgetposition": [0.8, 1.15, 1.2],
            "title": "Point_D",
            "description": "Primary monitoring point with real-time data collection",
            "cameraView": {
                "position": [0, 2, 0],
                "lookAt": [-2.2, 1.15, 0.3],
                "zoom": 8
            }
        },
        "title": "Scanner",
        "gateId": "gate2",
        "content": {
            "Health": "35%",
            "ScanningTime": 34,
            "ProcessingTime": 21,
            "softwareload":300
        }
    },
    {
        "Rendering": {
            "position": [-1, 0.7, 1.2],
            "widgetposition": [0.8, 1.15, 1.2],
            "title": "Point_E",
            "description": "Primary monitoring point with real-time data collection",
            "cameraView": {
                "position": [-0.8, 2, 5],
                "lookAt": [-0.8, 0.7, 1.2],
                "zoom": 10
            }
        },
        "title": "Front Gate 2",
        "gateId": "gate2",
        "content": {
            "Health": "45%",
            "ScanningTime": 70,
            "ProcessingTime": 21
        }
    }
]


gate_points = [
    {
        "gatePosition": [0.2, 0.5, 3],
        "gateTitle": "gate1",
        "color1": 0xff8888,
        "color2": 0xff0000,
        "cameraView": {
          "position": [3, 3, 5],
          "lookAt": [0, 0, 0],
          "zoom": 3
        }
      },

    {
    "gatePosition": [-1.5, 0.5, 3],
    "gateTitle": "gate2",
    "color1": 0xff8888,
    "color2": 0xff0000,
    "cameraView": {
      "position": [1.5, 3, 5],
      "lookAt": [-1.5, 0, 0],
      "zoom": 3
    }
  },
  {
    "gatePosition": [-3, 0.5, 3],
    "gateTitle": "gate3",
    "color1": 0xFFD066,
    "color2": 0xFFBB22,
    "cameraView": {
      "position": [0, 3, 5],
      "lookAt": [-3, 0, 0],
      "zoom": 3
    }
  },
  {
    "gatePosition": [1.5, 0.5, 3],
    "gateTitle": "gate4",
    "color1": 0xFFD066,
    "color2": 0xFFBB22,
    "cameraView": {
      "position": [4.5, 3, 5],
      "lookAt": [1.5, 0, 0],
      "zoom": 3
    }
  },
  {
    "gatePosition": [3, 0.5, 3],
    "gateTitle": "gate5",
    "color1": 0xCDD839,
    "color2": 0xA2AD14,
    "cameraView": {
      "position": [6, 3, 5],
      "lookAt": [3, 0, 0],
      "zoom": 3
    }
  }
]

test_data = [
        { 
            "title": "Number of Red/month", 
            "content": 12, 
            "colour": "#FF6961" 
        },
        { 
            "title": "Number of Yellow/month", 
            "content": 3,
            "colour": "#FFB54C" 
        },
        { 
            "title": "Number of Green/month",
            "content": 6,
            "colour": "#8CD47E" 
        }
    ]



@app.get("/api/annotationdata")
async def get_annotation_data():  # Changed function name to be unique
    try:
        validated_points = [AnnotationPoint(**point) for point in annotation_points]
        return {"annotation_points": [point.model_dump() for point in validated_points]}  # Changed key to match frontend
    except Exception as e:
        print(f"Error in annotation data: {str(e)}")  # Added debug print
        return {"error": str(e)}


#GET gate data
@app.get("/api/gatedata")
async def get_all_data():
    try:
        # Validate data using the Point model instead of Gates
        validated_points = [GatePoint(**point) for point in gate_points]
        return {"gate_points": gate_points}
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/countdata")
async def get_count_data():
    
    
    try:
        validated_points = [CardPoint(**point).dict() for point in test_data]
        print("Validated points:", validated_points)  # Debug print
        return {"CountData": validated_points}
    except Exception as e:
        print(f"Error type: {type(e)}")  # Debug print
        print(f"Error message: {str(e)}")  # Debug print
        return {"error": str(e)}
        

@app.put("/api/update_annotation/{point_title}")
async def update_annotation(
    point_title: str,  # Unique gate ID
    update_request: UpdateHealthRequest  # Request body with updated health data
):
    try:
        # Find the point in annotation_points by gate_id
        point_to_update = None
        for point in annotation_points:
            if point["Rendering"]["title"] == point_title:
                point_to_update = point
                break

        if not point_to_update:
            raise HTTPException(status_code=404, detail="Gate point not found")

        # Update the Health value in content
        point_to_update["content"]["Health"] = update_request.health

        # Recalculate the color based on the new health value
        color1, color2 = get_health_colors(update_request.health)
        point_to_update["Rendering"]["color1"] = color1
        point_to_update["Rendering"]["color2"] = color2

        return {"message": "Annotation updated successfully", "updated_point": point_to_update}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) #uvivotn runs server on the port 8000