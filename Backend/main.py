import asyncio
import json
import os
import signal
import time
from typing import Dict, Any, List

import keyboard
import numpy as np
import pandas as pd
import serial
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

# Configuration Constants
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "Digitaltwin"
GATE_COLLECTION = "gates"
ANNOTATION_COLLECTION = "annotations"
COM_PORT = "COM7"
BAUD_RATE = 9600

# Global state dictionary to be used across functions
global_state = {
    "df": pd.DataFrame(
        columns=["Timestamp", "Sensor1", "Sensor2", "Sensor3", "Sensor4"]
    ),
    "alert_count": 0,
    "data_count": 0,
    "start_time": time.time(),
    "delete_start_time": time.time(),
    "paused": False,
    "critical_stop": False,
    "exit_script": False,
}


# Rest of the functions remain the same as in the previous refactoring
def get_initial_health_colors(health_value: str):
    try:
        health = float(health_value.rstrip("%"))

        if health >= 80:
            return (0xE0E0E0, 0xF0F0F0)
        elif health >= 60:
            return (0xE0E0E0, 0xF0F0F0)
        else:
            return (0xE0E0E0, 0xF0F0F0)

    except (ValueError, TypeError):
        return "error"


def calculate_alert_threshold(df):
    mean_value = (
        df[["Sensor1", "Sensor2", "Sensor3", "Sensor4"]]
        .replace(0, np.nan)
        .mean()
        .mean()
    )
    std_dev = (
        df[["Sensor1", "Sensor2", "Sensor3", "Sensor4"]].replace(0, np.nan).std().mean()
    )
    return mean_value + 1.05 * std_dev


def classify_alerts(alert_count):
    if alert_count > 50:
        return 30, "Red", (0xFF8888, 0xFF0000)
    elif 20 <= alert_count <= 50:
        return 20, "Yellow", (0xFFD066, 0xFFBB22)
    else:
        return 10, "Green", (0xCDD839, 0xA2AD14)


def determine_health_status(health_status_value):
    if health_status_value >= 80:
        return "Green", (0xCDD839, 0xA2AD14)
    elif 50 <= health_status_value < 80:
        return "Yellow", (0xFFD066, 0xFFBB22)
    else:
        return "Red", (0xFF8888, 0xFF0000)


def parse_sensor_values(line_com3):
    sensor_values = line_com3.split(",")

    while len(sensor_values) < 7:
        sensor_values.append("0")

    return [float(x) if x.replace(".", "", 1).isdigit() else 0.0 for x in sensor_values]


def create_sensor_data_dict(current_time, sensor_values_float, df, alert_count):
    avg_value = (
        pd.DataFrame(
            [sensor_values_float[:4]],
            columns=["Sensor1", "Sensor2", "Sensor3", "Sensor4"],
        )
        .replace(0, np.nan)
        .mean(axis=1)
        .round(2)
        .iloc[0]
    )

    threshold = calculate_alert_threshold(df)
    is_critical_alert = avg_value > 1.1

    alert_value, alert_status, scanner_colors = classify_alerts(alert_count)

    health_status_value = 100 - alert_value
    health_status, gate_colors = determine_health_status(health_status_value)

    return {
        "timestamp": current_time,
        "sensor1": sensor_values_float[0],
        "sensor2": sensor_values_float[1],
        "sensor3": sensor_values_float[2],
        "sensor4": sensor_values_float[3],
        "average_value": avg_value,
        "alert_count": alert_count,
        "alert_status": alert_status,
        "health_status_value": health_status_value,
        "health_status": health_status,
        "updated_annotation_colour": scanner_colors,
        "updated_gate_colour": gate_colors,
        "is_critical_alert": bool(is_critical_alert),
    }


# Create the FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to a client: {e}")


manager = ConnectionManager()


# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def read_sensor_data(globals_dict, ser3, manager):
    try:
        while not globals_dict["exit_script"]:
            if globals_dict["paused"]:
                await asyncio.sleep(0.5)
                continue

            if ser3.in_waiting > 0:
                line_com3 = ser3.readline().decode("utf-8").strip()

                if line_com3:
                    current_time = time.strftime("%H:%M:%S")
                    sensor_values_float = parse_sensor_values(line_com3)

                    # Create new DataFrame row
                    new_row = pd.DataFrame(
                        [
                            {
                                "Timestamp": current_time,
                                "Sensor1": sensor_values_float[0],
                                "Sensor2": sensor_values_float[1],
                                "Sensor3": sensor_values_float[2],
                                "Sensor4": sensor_values_float[3],
                            }
                        ]
                    )

                    # Update global DataFrame
                    globals_dict["df"] = pd.concat(
                        [globals_dict["df"], new_row], ignore_index=True
                    )
                    globals_dict["data_count"] += 1

                    # Increment alert count if threshold exceeded
                    if new_row[["Sensor1", "Sensor2", "Sensor3", "Sensor4"]].replace(
                        0, np.nan
                    ).mean(axis=1).iloc[0] > calculate_alert_threshold(
                        globals_dict["df"]
                    ):
                        globals_dict["alert_count"] += 1

                    # Create sensor data dictionary
                    sensor_data = create_sensor_data_dict(
                        current_time,
                        sensor_values_float,
                        globals_dict["df"],
                        globals_dict["alert_count"],
                    )

                    # Print and broadcast data
                    print(f"[{current_time}] SensorValues: {sensor_values_float[:4]}")
                    await manager.broadcast(json.dumps(sensor_data))

            await asyncio.sleep(0.01)

    except Exception as e:
        print(f"Error in sensor reading: {e}")
    finally:
        if ser3.is_open:
            ser3.close()
        print("Serial connection closed.")


# Startup event to begin sensor data reading
@app.on_event("startup")
async def startup_event():
    # Setup signal handling and serial connection
    ser3 = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
    print(f"Connected to {COM_PORT} for sensor data")

    # Signal handler setup
    def signal_handler(sig, frame):
        global_state["paused"] = not global_state["paused"]
        status = "PAUSED" if global_state["paused"] else "RESUMED"
        print(f"▶ Data collection {status}. Press Ctrl+C to toggle.")

    def exit_handler():
        global_state["exit_script"] = True
        print("\n🚪 Exit command received. Terminating data collection...")

    signal.signal(signal.SIGINT, signal_handler)
    keyboard.add_hotkey("ctrl+e", exit_handler)

    # Create task for reading sensor data
    asyncio.create_task(read_sensor_data(global_state, ser3, manager))


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    global exit_script
    exit_script = True
    if "conn" in globals():
        conn.close()
    print("Database connection closed.")


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


class AnnotationPoint(
    BaseModel
):  # Changed from Gate to Point to match your data structure
    Rendering: Rendering  # Capital R to match your data
    title: str
    gateId: str
    content: Dict[str, Any]

    def __init__(self, **data):  # proccess the colour of the points
        if "content" in data and "Health" in data["content"]:
            color1, color2 = get_initial_health_colors(data["content"]["Health"])
            if "Rendering" not in data:
                data["Rendering"] = {}
            data["Rendering"]["color1"] = color1
            data["Rendering"]["color2"] = color2
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


test_data = [
    {"title": "Number of Red/month", "content": 12, "colour": "#FF6961"},
    {"title": "Number of Yellow/month", "content": 3, "colour": "#FFB54C"},
    {"title": "Number of Green/month", "content": 6, "colour": "#8CD47E"},
]


@app.get("/api/annotationdata")
async def get_annotation_data():
    try:
        # Fetch data from MongoDB
        annotation_points_data = (
            await app.mongodb[ANNOTATION_COLLECTION].find().to_list(1000)
        )

        # Convert ObjectId to string and validate through Pydantic model
        validated_points = [
            AnnotationPoint(**{**point, "_id": str(point["_id"])})
            for point in annotation_points_data
        ]

        return {"annotation_points": [point.model_dump() for point in validated_points]}
    except Exception as e:
        print(f"Error in annotation data: {str(e)}")
        return {"error": str(e)}


@app.on_event("startup")
async def startup_db_client():
    try:
        print("Attempting to connect to MongoDB...")
        app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
        app.mongodb = app.mongodb_client[DB_NAME]

        # Test the connection
        await app.mongodb.command("ping")
        print("Successfully connected to MongoDB!")

        # Check collection count
        count = await app.mongodb[GATE_COLLECTION].count_documents({})
        print(f"Current number of documents in {GATE_COLLECTION}: {count}")

        if count == 0:
            print("Collection empty, initializing with default data...")
            await app.mongodb[GATE_COLLECTION].insert_many(gate_points)
            print("Default data inserted successfully!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()


@app.get("/api/gatedata")
async def get_all_data():
    try:
        # Fetch data from MongoDB

        print("Attempting to fetch gate data from MongoDB...")
        gate_points_data = await app.mongodb[GATE_COLLECTION].find().to_list(1000)
        print(f"Retrieved {len(gate_points_data)} documents from MongoDB")
        # Convert ObjectId to string for JSON serialization
        for point in gate_points_data:
            point["_id"] = str(point["_id"])
        return {"gate_points": gate_points_data}
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
    update_request: UpdateHealthRequest,  # Request body with updated health data
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
        color1, color2 = get_initial_health_colors(update_request.health)
        point_to_update["Rendering"]["color1"] = color1
        point_to_update["Rendering"]["color2"] = color2

        return {
            "message": "Annotation updated successfully",
            "updated_point": point_to_update,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# This allows the script to be run directly or via Uvicorn
if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
