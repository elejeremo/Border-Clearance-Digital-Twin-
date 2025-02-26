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

# FastAPI setup
app = FastAPI()

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

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to a client: {e}")


manager = ConnectionManager()

# Set up the serial connection (adjust COM port and baud rate as per your setup)
com3_port = "COM7"  # Replace with your Arduino's port
baud_rate_com3 = 9600  # Match this with your Arduino's baud rate

# Get the current timestamp for the filename
timestamp_str = time.strftime("%Y-%m-%d_%H-%M-%S")

# Get the Desktop path dynamically
desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
os.chdir(desktop_path)
db_name = "sensor_data.db"
db_path = os.path.join(desktop_path, db_name)  # Get absolute path
print(f"Database is saved at: {db_path}")

# Create a connection to SQLite database
conn = sqlite3.connect(db_name)
cursor = conn.cursor()

# Create table if it doesn't exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS SensorReadings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    sensor1 REAL,
    sensor2 REAL,
    sensor3 REAL,
    sensor4 REAL,
    sensorX1 REAL,
    sensorX2 REAL,
    sensorX3 REAL
)
""")
conn.commit()

print(f"Data will be stored in: {db_name}")

# Initialize an empty DataFrame
df = pd.DataFrame(
    columns=[
        "Timestamp",
        "Sensor1",
        "Sensor2",
        "Sensor3",
        "Sensor4",
        "SensorX1",
        "SensorX2",
        "SensorX3",
    ]
)
data_count = 0  # Counter for saving every 300 entries
start_time = time.time()  # Timer for auto-refresh
delete_start_time = time.time()

# Status Flags
paused = False
critical_stop = False  # If a critical stop occurs, prevent auto-resume
exit_script = False  # Flag to indicate when to exit the script
prev_sensorX1 = None


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


def delete_oldest_entries():
    try:
        cursor.execute("""
            DELETE FROM SensorReadings
            WHERE id IN (
                SELECT id FROM SensorReadings
                ORDER BY timestamp ASC
                LIMIT 300
            )
        """)
        conn.commit()
        print("🗑️ Deleted the oldest 300 entries from the database.")
    except Exception as e:
        print(f"Error during deletion: {e}")


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
@app.get("/latest-readings")
async def get_latest_readings():
    cursor.execute("SELECT * FROM SensorReadings ORDER BY timestamp DESC LIMIT 300")
    columns = [description[0] for description in cursor.description]
    rows = cursor.fetchall()

    result = []
    for row in rows:
        result.append(dict(zip(columns, row)))

    return result


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
        df

    try:
        # Open serial connection
        if not critical_stop:
            ser3 = serial.Serial(com3_port, baud_rate_com3, timeout=1)
            print(f"Connected to {com3_port} for sensor data")

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
                                f"⚠️ WARNING: SensorX1 value change {diff_sensorX1} "
                                f"exceeded 50.0!\nTimestamp: {current_time}\nChoose an option:"
                            )
                            threshold_exceeded = True

                    # Update previous SensorX1 value
                    prev_sensorX1 = sensor_values_float[4]

                    # If any threshold is exceeded, prompt the user
                    if threshold_exceeded:
                        user_choice = pyautogui.confirm(
                            text=warning_message,
                            title="Critical Sensor Alert",
                            buttons=["Resume", "Exit"],
                        )
                        if user_choice == "Exit":
                            print("Terminating data collection...")
                            exit_script = True
                            break
                        else:
                            print("Resuming data collection...")

                    # Create a sensor data dictionary
                    sensor_data = {
                        "timestamp": current_time,
                        "sensor1": sensor_values_float[0],
                        "sensor2": sensor_values_float[1],
                        "sensor3": sensor_values_float[2],
                        "sensor4": sensor_values_float[3],
                        "sensorX1": sensor_values_float[4],
                        "sensorX2": sensor_values_float[5],
                        "sensorX3": sensor_values_float[6],
                    }

                    # Create a new DataFrame row
                    new_row = pd.DataFrame(
                        [
                            {
                                "Timestamp": current_time,
                                "Sensor1": sensor_values_float[0],
                                "Sensor2": sensor_values_float[1],
                                "Sensor3": sensor_values_float[2],
                                "Sensor4": sensor_values_float[3],
                                "SensorX1": sensor_values_float[4],
                                "SensorX2": sensor_values_float[5],
                                "SensorX3": sensor_values_float[6],
                            }
                        ]
                    )

                    # Append new row to DataFrame
                    df = pd.concat([df, new_row], ignore_index=True)
                    data_count += 1  # Increment data counter

                    # Insert data into SQL database
                    cursor.execute(
                        """
                        INSERT INTO SensorReadings (timestamp, sensor1, sensor2, sensor3, sensor4, sensorX1, sensorX2, sensorX3)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                        (
                            current_time,
                            sensor_values_float[0],
                            sensor_values_float[1],
                            sensor_values_float[2],
                            sensor_values_float[3],
                            sensor_values_float[4],
                            sensor_values_float[5],
                            sensor_values_float[6],
                        ),
                    )
                    conn.commit()

                    # Print data readings
                    print(f"[{current_time}] SensorValues: {sensor_values_float}")

                    # Broadcast sensor data via WebSocket
                    await manager.broadcast(json.dumps(sensor_data))

                    # Save to CSV every 300 entries
                    if data_count >= 300:
                        today_date = datetime.now().strftime(
                            "%Y-%m-%d_%H-%M-%S"
                        )  # Get current date
                        csv_filename = os.path.join(
                            desktop_path, f"sensordata_{today_date}.csv"
                        )

                        # Save to CSV
                        df.to_csv(csv_filename, index=False)
                        print(f"✅ Saved last 300 readings to {csv_filename}")

                        # Reset DataFrame and counter
                        df = pd.DataFrame(
                            columns=[
                                "Timestamp",
                                "Sensor1",
                                "Sensor2",
                                "Sensor3",
                                "Sensor4",
                                "SensorX1",
                                "SensorX2",
                                "SensorX3",
                            ]
                        )
                        data_count = 0

                    # Auto-refresh data view every 5 minutes
                    if time.time() - start_time >= 300:  # 300 seconds = 5 minutes
                        print("\n⏳ Refreshing view (last 300 values)...")

                        # Retrieve last 300 readings
                        cursor.execute(
                            "SELECT * FROM SensorReadings ORDER BY timestamp DESC LIMIT 300"
                        )
                        columns = [description[0] for description in cursor.description]
                        rows = cursor.fetchall()

                        result = []
                        for row in rows:
                            result.append(dict(zip(columns, row)))

                        print(f"Latest readings: {len(result)} entries")

                        # Reset the timer
                        start_time = time.time()

                    # Check if 5 minutes have passed for deletion
                    if time.time() - delete_start_time >= 300:
                        delete_oldest_entries()
                        delete_start_time = time.time()

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


# Run the FastAPI app
if __name__ == "__main__":
    try:
        uvicorn.run(app, host="localhost", port=8000)
    except KeyboardInterrupt:
        print("\n🚨 Server stopped by user.")
    except Exception as e:
        print(f"Error starting server: {e}")
    finally:
        if "conn" in globals():
            conn.close()
        print("Data monitoring stopped.")
