# Required installations:
# pip install pyautogui keyboard pandas pyserial
import serial
import os
import time
import sqlite3
import pyautogui
import pandas as pd
from datetime import datetime
import signal
import keyboard 

# Set up the serial connection (adjust COM port and baud rate as per your setup)
com3_port = "COM3"  # Replace with your Arduino's port
baud_rate_com3 = 9600  # Match this with your Arduino's baud rate

# Get the current timestamp for the filename
timestamp_str = time.strftime("%Y-%m-%d_%H-%M-%S")

# Get the Desktop path dynamically
desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
os.chdir(desktop_path)
db_name = f"sensor_data_{timestamp_str}.db"
db_path = os.path.join(desktop_path, db_name)  # Get absolute path
print(f"Database is saved at: {db_path}")

# Create a connection to SQLite database
conn = sqlite3.connect(db_name)
cursor = conn.cursor()

# Create table if it doesn’t exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS SensorReadings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    sensor1 REAL,
    sensor2 REAL,
    sensor3 REAL,
    sensor4 REAL
)
""")
conn.commit()

print(f"Data will be stored in: {db_name}")

# Initialize an empty DataFrame
df = pd.DataFrame(columns=["Timestamp", "Sensor1", "Sensor2", "Sensor3", "Sensor4"])
data_count = 0  # Counter for saving every 300 entries
start_time = time.time()  # Timer for auto-refresh
delete_start_time = time.time()

# Status Flags
paused = False
critical_stop = False  # If a critical stop occurs, prevent auto-resume
exit_script = False    # Flag to indicate when to exit the script

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
keyboard.add_hotkey('ctrl+e', exit_handler)

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

try:
    while not exit_script:
        # Open serial connection (Reopen if resuming after shutdown)
        if not critical_stop:
            ser3 = serial.Serial(com3_port, baud_rate_com3, timeout=1)
            print(f"Connected to {com3_port} for sensor data")
        
        print("▶ Press Ctrl+C to pause")

        while not exit_script:
            # Skip data collection if paused
            if paused:
                time.sleep(0.5)
                continue

            # Read data from COM3 (sensor input)
            line_com3 = ser3.readline().decode('utf-8').strip()

            if line_com3:
                current_time = time.strftime("%H:%M:%S")

                # Split sensor values into separate columns
                sensor_values = line_com3.split(',')

                # Ensure correct number of columns (prevent index errors)
                while len(sensor_values) < 4:
                    sensor_values.append("0")  # Fill missing values with 0

                # Convert sensor values to float for comparison
                sensor_values_float = [float(x) if x.replace('.', '', 1).isdigit() else 0.0 for x in sensor_values]

                # Check if any COM3 sensor value ≥ 2.0
                if any(value >= 2.0 for value in sensor_values_float):
                    warning_message = f"⚠️ WARNING: Sensor value {sensor_values_float} exceeded 2.0!\nTimestamp: {current_time}\nChoose an option:"
                    user_choice = pyautogui.confirm(text=warning_message, title="Critical Sensor Alert", buttons=["Resume", "Exit"])

                    if user_choice == "Exit":
                        print("Terminating data collection...")
                        exit_script = True
                        break
                    else:
                        print("Resuming data collection...")

                # Create a new DataFrame row
                new_row = pd.DataFrame([{
                    "Timestamp": current_time,
                    "Sensor1": sensor_values_float[0],
                    "Sensor2": sensor_values_float[1],
                    "Sensor3": sensor_values_float[2],
                    "Sensor4": sensor_values_float[3]
                }])

                # Append new row to DataFrame
                df = pd.concat([df, new_row], ignore_index=True)
                data_count += 1  # Increment data counter

                # Insert data into SQL database
                cursor.execute("""
                    INSERT INTO SensorReadings (timestamp, sensor1, sensor2, sensor3, sensor4)
                    VALUES (?, ?, ?, ?, ?)
                """, (current_time, sensor_values_float[0], sensor_values_float[1], 
                      sensor_values_float[2], sensor_values_float[3]))
                conn.commit()

                # Print data readings
                print(f"[{current_time}] COM3: {sensor_values_float}")

                # Save to CSV every 300 entries
                if data_count >= 300:
                    today_date = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")  # Get current date
                    csv_filename = os.path.join(desktop_path, f"sensordata_{today_date}.csv")
                    
                    # Save to CSV
                    df.to_csv(csv_filename, index=False)
                    print(f"✅ Saved last 300 readings to {csv_filename}")

                    # Reset DataFrame and counter
                    df = pd.DataFrame(columns=["Timestamp", "Sensor1", "Sensor2", "Sensor3", "Sensor4"])
                    data_count = 0

                # Auto-refresh data view every 5 minutes
                if time.time() - start_time >= 300:  # 300 seconds = 5 minutes
                    print("\n⏳ Refreshing view (last 300 values)...")

                    # Retrieve last 300 readings
                    df_latest = pd.read_sql_query("SELECT * FROM SensorReadings ORDER BY timestamp DESC LIMIT 300", conn)
                    
                    # Display the DataFrame (replace with a GUI if needed)
                    print(df_latest)

                    # Reset the timer
                    start_time = time.time()

                # Check if 5 minutes have passed for deletion
                if time.time() - delete_start_time >= 300:
                    delete_oldest_entries()
                    delete_start_time = time.time()    

            # Delay between readings
            time.sleep(1)

except KeyboardInterrupt:
    print("\n🚨 Data collection stopped by user.")

except Exception as e:
    print(f"Error: {e}")

finally:
    if 'ser3' in locals() and ser3.is_open:
        ser3.close()
    conn.close()
    print("Serial connections and database closed. Data monitoring stopped.")
