from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List
import uvicorn
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import numpy as np

# pip install fastapi uvicorn websockets pyautogui keyboard pandas pyserial
#
import serial
import os
import time
import sqlite3
import pyautogui
import pandas as pd
from datetime import datetime
import signal
import keyboard
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List

# MongoDB connection settings
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "Digitaltwin"
GATE_COLLECTION = "gates"
ANNOTATION_COLLECTION = "annotations"


def get_health_colors(health_value: str):
    """
    Convert health percentage to color values.
    Returns (color1, color2) tuple with hex color values.
    """
    try:
        # Remove the % sign and convert to float
        health = float(health_value.rstrip("%"))

        if health >= 80:
            # Green gradient
            return (0xCDD839, 0xA2AD14)
        elif health >= 60:
            # Yellow gradient
            return (0xFFD066, 0xFFBB22)
        else:
            # Red gradient
            return (0xFF8888, 0xFF0000)

    except (ValueError, TypeError):
        # Default colors if health value is invalid
        return "error"


app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# Add CORS middleware to allow your React app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(
        self, message: str
    ):  # broadcasts to the client connections (shows up on the react client side)
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to a client: {e}")


manager = ConnectionManager()

# Set up the serial connection (adjust COM port and baud rate as per your setup)
com_port = "COM7"  # Replace with your Arduino's port
baud_rate_com = 9600  # Match this with your Arduino's baud rate

# # Port to Mega for controlling of motor
# drive_port = "COM9"
# drive_baud_rate = 115200

# # Open serial connection for motor control
# drive_ser = serial.Serial(drive_port, drive_baud_rate, timeout=1)

# Get the current timestamp for the filename
timestamp_str = time.strftime("%Y-%m-%d_%H-%M-%S")

# Get the Desktop path dynamically
# desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
# os.chdir(desktop_path)
# db_name = "sensor_data.db"
# db_path = os.path.join(desktop_path, db_name)  # Get absolute path
# print(f"Database is saved at: {db_path}")

# Create a connection to SQLite database
# conn = sqlite3.connect(db_name)
# cursor = conn.cursor()

# # Create table if it doesn't exist
# cursor.execute("""
# CREATE TABLE IF NOT EXISTS SensorReadings (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     timestamp TEXT,
#     sensor1 REAL,
#     sensor2 REAL,
#     sensor3 REAL,
#     sensor4 REAL,
#     sensorX1 REAL,
#     sensorX2 REAL,
#     sensorX3 REAL
# )
# """)
# conn.commit()

# print(f"Data will be stored in: {db_name}")

# # Initialize an empty DataFrame
df = pd.DataFrame(
    columns=[
        "Timestamp",
        "Sensor1",
        "Sensor2",
        "Sensor3",
        "Sensor4",
        "Force",
        #        "SensorX2",
        #        "SensorX3",
    ]
)
alert_count = 0  # alert for current in height adaptive camera
force_alert_count = 0  # alert tracking force from accelerometer
data_count = 0  # Counter for saving every 300 entries
start_time = time.time()  # Timer for auto-refresh
delete_start_time = time.time()


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


# Status Flags
paused = False
critical_stop = False  # If a critical stop occurs, prevent auto-resume
exit_script = False  # Flag to indicate when to exit the script
prev_sensorX1 = 0
diff_sensorX1 = 0


def signal_handler(sig, frame):
    global paused
    if paused:
        print("▶ Resuming data collection... Press Ctrl+C to pause")
        paused = False
    else:
        print("⏸ Data collection PAUSED. Press Ctrl+C to resume or Ctrl+E to exit.")
        paused = True


# Register the signal handler for SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, signal_handler)


def exit_handler():
    global exit_script
    print("\n🚪 Exit command received. Terminating data collection...")
    exit_script = True


# Register the exit handler for 'Ctrl+E'
keyboard.add_hotkey("ctrl+e", exit_handler)


# def delete_oldest_entries():
#     try:
#         cursor.execute("""
#             DELETE FROM SensorReadings
#             WHERE id IN (
#                 SELECT id FROM SensorReadings
#                 ORDER BY timestamp ASC
#                 LIMIT 300
#             )
#         """)
#         conn.commit()
#         print("🗑️ Deleted the oldest 300 entries from the database.")
#     except Exception as e:
#         print(f"Error during deletion: {e}")


# WebSocket endpoint for clients to connect
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep the connection alive, data will be broadcast from the sensor reading loop
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# API endpoint to get the latest 300 readings
# @app.get("/latest-readings")
# async def get_latest_readings():
#     cursor.execute("SELECT * FROM SensorReadings ORDER BY timestamp DESC LIMIT 300")
#     columns = [description[0] for description in cursor.description]
#     rows = cursor.fetchall()

#     result = []
#     for row in rows:
#         result.append(dict(zip(columns, row)))

#     return result


# async def control_motor(command):
#     if drive_ser.is_open:
#         drive_ser.write(command.encode())
#         print(f"Command '{command}' sent to motor.")


# Function to read sensor data and broadcast via WebSocket
async def read_sensor_data():
    global \
        paused, \
        critical_stop, \
        exit_script, \
        prev_sensorX1, \
        data_count, \
        start_time, \
        delete_start_time, \
        df, \
        force_alert_count, \
        alert_count

    try:
        # Open serial connection
        if not critical_stop:
            ser3 = serial.Serial(com_port, baud_rate_com, timeout=1)
            print(f"Connected to {com_port} for sensor data")

        print("▶ Press Ctrl+C to pause")

        while not exit_script:
            # Skip data collection if paused
            if paused:
                await asyncio.sleep(0.5)
                continue

            # Read data from COM3 (sensor input)
            if ser3.in_waiting > 0:
                line_com3 = ser3.readline().decode("utf-8").strip()

                if line_com3:
                    current_time = time.strftime("%H:%M:%S")

                    # Split sensor values into separate columns
                    sensor_values = line_com3.split(",")

                    # Ensure correct number of columns (prevent index errors)
                    while len(sensor_values) < 7:
                        sensor_values.append("0")  # Fill missing values with 0

                    # Convert sensor values to float for comparison
                    sensor_values_float = [
                        float(x) if x.replace(".", "", 1).isdigit() else 0.0
                        for x in sensor_values
                    ]

                    # Check if any of the first four sensor values exceed 5
                    threshold_exceeded = False
                    for i in range(4):
                        if sensor_values_float[i] > 5:
                            warning_message = (
                                f"⚠️ WARNING: Sensor{i + 1} value {sensor_values_float[i]} "
                                f"exceeded 5.0!\nTimestamp: {current_time}\nChoose an option:"
                            )
                            threshold_exceeded = True
                            break  # Exit loop if any sensor exceeds the threshold

                    # Check if the difference in SensorX1 exceeds 50
                    if not threshold_exceeded and prev_sensorX1 is not None:
                        diff_sensorX1 = abs(sensor_values_float[4] - prev_sensorX1)
                        if diff_sensorX1 > 50:
                            warning_message = (
                                f"⚠️ WARNING: Force value change {diff_sensorX1} "
                                f"exceeded 50.0!\nTimestamp: {current_time}\nChoose an option:"
                            )
                            threshold_exceeded = True

                    # Update previous SensorX1 value
                    prev_sensorX1 = sensor_values_float[4]

                    # # If any threshold is exceeded, prompt the user
                    # if threshold_exceeded:
                    #     user_choice = pyautogui.confirm(
                    #         text=warning_message,
                    #         title="Critical Sensor Alert",
                    #         buttons=["Resume", "Exit"],
                    #     )
                    #     if user_choice == "Exit":
                    #         print("Terminating data collection...")
                    #         exit_script = True
                    #         break
                    #     else:
                    #         print("Resuming data collection...")

                    # Create a new DataFrame row
                    new_row = pd.DataFrame(
                        [
                            {
                                "Timestamp": current_time,
                                "Sensor1": sensor_values_float[0],
                                "Sensor2": sensor_values_float[1],
                                "Sensor3": sensor_values_float[2],
                                "Sensor4": sensor_values_float[3],
                                "Force": diff_sensorX1,
                                # "SensorX2": sensor_values_float[5],
                                # "SensorX3": sensor_values_float[6],
                            }
                        ]
                    )

                    # Append new row to DataFrame
                    df = pd.concat([df, new_row], ignore_index=True)
                    data_count += 1  # Increment data counter
                    avg_value = (
                        new_row[["Sensor1", "Sensor2", "Sensor3", "Sensor4"]]
                        .replace(0, np.nan)
                        .mean(axis=1)
                        .round(2)
                        .iloc[0]
                    )
                    threshold = calculate_alert_threshold(df)

                    if avg_value > threshold:
                        alert_count += 1

                    # Alert classification
                    if alert_count > 50:
                        alert_value, alert_status = 20, "Red"
                    elif 20 <= alert_count <= 50:
                        alert_value, alert_status = 10, "Yellow"
                    else:
                        alert_value, alert_status = 5, "Green"

                    if new_row["Force"].iloc[0] == 1.0:
                        force_alert_count += 1

                    # Alert classification for force
                    if force_alert_count > 10:
                        force_alert_value, force_alert_status = 10, "Red"
                    elif 5 <= force_alert_count <= 10:
                        force_alert_value, force_alert_status = 5, "Yellow"
                    else:
                        force_alert_value, force_alert_status = 2, "Green"

                    # Health Status Calculation
                    health_status_value = 100 - alert_value - force_alert_value
                    if health_status_value >= 80:
                        health_status = "Green"
                    elif 50 <= health_status_value < 80:
                        health_status = "Yellow"
                    else:
                        health_status = "Red"

                    # output_data = {
                    #     "average_value": avg_value,
                    #     "alert_count": alert_count,
                    #     "alert_status": alert_status,
                    #     "health_status_value": health_status_value,
                    #     "health_status": health_status,
                    # }

                    # Create a sensor data dictionary
                    sensor_data = {
                        "timestamp": current_time,
                        "sensor1": sensor_values_float[0],
                        "sensor2": sensor_values_float[1],
                        "sensor3": sensor_values_float[2],
                        "sensor4": sensor_values_float[3],
                        "Force": diff_sensorX1,
                        "average_value": avg_value,
                        "alert_count": alert_count,
                        "alert_status": alert_status,
                        "force_alert_value": force_alert_value,
                        "force_alert_count": force_alert_count,
                        "force_alert_status": force_alert_status,
                        "health_status_value": health_status_value,
                        "health_status": health_status,
                        #                        "sensorX2": sensor_values_float[5],
                        #                        "sensorX3": sensor_values_float[6],
                    }
                    # # Insert data into SQL database
                    # cursor.execute(
                    #     """
                    #     INSERT INTO SensorReadings (timestamp, sensor1, sensor2, sensor3, sensor4, sensorX1, sensorX2, sensorX3)
                    #     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    # """,
                    #     (
                    #         current_time,
                    #         sensor_values_float[0],
                    #         sensor_values_float[1],
                    #         sensor_values_float[2],
                    #         sensor_values_float[3],
                    #         sensor_values_float[4],
                    #         sensor_values_float[5],
                    #         sensor_values_float[6],
                    #     ),
                    # )
                    # conn.commit()

                    # Print data readings
                    print(
                        f"[{current_time}] SensorValues: {sensor_values_float[0], sensor_values_float[1], sensor_values_float[2], sensor_values_float[3], diff_sensorX1}"
                    )

                    # Broadcast sensor data via WebSocket
                    await manager.broadcast(json.dumps(sensor_data))

                    # Save to CSV every 300 entries
                    # if data_count >= 300:
                    #     today_date = datetime.now().strftime(
                    #         "%Y-%m-%d_%H-%M-%S"
                    #     )  # Get current date
                    #     # csv_filename = os.path.join(
                    #     #     desktop_path, f"sensordata_{today_date}.csv"
                    #     # )

                    #     # # Save to CSV
                    #     # df.to_csv(csv_filename, index=False)
                    #     # print(f"✅ Saved last 300 readings to {csv_filename}")

                    #     # Reset DataFrame and counter
                    #     df = pd.DataFrame(
                    #         columns=[
                    #             "Timestamp",
                    #             "Sensor1",
                    #             "Sensor2",
                    #             "Sensor3",
                    #             "Sensor4",
                    #             "Force",
                    #             # "SensorX2",
                    #             # "SensorX3",
                    #         ]
                    #     )
                    #     data_count = 0

                    # # Auto-refresh data view every 5 minutes
                    # if time.time() - start_time >= 300:  # 300 seconds = 5 minutes
                    #     print("\n⏳ Refreshing view (last 300 values)...")

                    #     # Retrieve last 300 readings
                    #     # cursor.execute(
                    #     #     "SELECT * FROM SensorReadings ORDER BY timestamp DESC LIMIT 300"
                    #     # )
                    #     # columns = [description[0] for description in cursor.description]
                    #     # rows = cursor.fetchall()

                    #     result = []
                    #     for row in rows:
                    #         result.append(dict(zip(columns, row)))

                    #     print(f"Latest readings: {len(result)} entries")

                    #     # Reset the timer
                    #     start_time = time.time()

                    # # Check if 5 minutes have passed for deletion
                    # if time.time() - delete_start_time >= 300:
                    #     delete_oldest_entries()
                    #     delete_start_time = time.time()

            # Delay between readings
            await asyncio.sleep(0.1)  # Use shorter sleep for more responsive WebSocket

    except Exception as e:
        print(f"Error in sensor reading: {e}")
    finally:
        if "ser3" in locals() and ser3.is_open:
            ser3.close()
        print("Serial connection closed.")


# Startup event
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(read_sensor_data())


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
            color1, color2 = get_health_colors(data["content"]["Health"])
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


# GET gate data
# @app.get("/api/gatedata")
# async def get_all_data():
#     try:
#         # Validate data using the Point model instead of Gates
#         validated_points = [GatePoint(**point) for point in gate_points]
#         return {"gate_points": gate_points}
#     except Exception as e:
#         return {"error": str(e)}


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
        color1, color2 = get_health_colors(update_request.health)
        point_to_update["Rendering"]["color1"] = color1
        point_to_update["Rendering"]["color2"] = color2

        return {
            "message": "Annotation updated successfully",
            "updated_point": point_to_update,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        app, host="localhost", port=8000
    )  # uvivotn runs server on the port 8000
