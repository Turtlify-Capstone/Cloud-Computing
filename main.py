import os
import io
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import h5py
import mysql.connector
from mysql.connector import Error

# Load TensorFlow model from URL
model = keras.models.load_model("model_6_class.h5")

# Function to transform image for prediction
def transform_image(image_bytes):
    img = image.load_img(io.BytesIO(image_bytes), target_size=(224,224))
    x = np.array(img)
    x = preprocess_input(x)
    x = np.expand_dims(x, axis=0)
    return x

# Function to make a prediction
def predict(x):
    predictions = model.predict(x)
    #predictions = tf.nn.softmax(predictions)
    #pred0 = predictions[0]
    label0 = np.argmax(predictions, axis=1)
    return label0

# Function to get class name from prediction
def getClass(id):
    classes = ["Bulus Cina", "Common Snapping Turtle", "Kura-kura Brazil", "Kura-kura moncong babi", "Kura-kura Rote", "Tuntong Laut"]
    return classes[id] if 0 <= id < len(classes) else ""

# Function to create database connection
def create_db_connection():
    host = os.getenv("DB_HOST")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME")
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            database=database,
            password=password
        )
        return conn
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

# Function to get turtle data from database
def get_turtle_data(nama_lokal):
    conn = create_db_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM DeskripsiPenyu WHERE nama_lokal = %s", (nama_lokal,))
            row = cursor.fetchone()
            if row:
                column_names = [desc[0] for desc in cursor.description]
                turtle_info = dict(zip(column_names, row))
                return turtle_info
            else:
                return None
        except Error as e:
            print(f"Error: {e}")
        finally:
            cursor.close()
            conn.close()
    return None

# Flask app setup
app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET", "POST"])
def main():
    if request.method == "POST":
        file = request.files.get('file')
        if file is None or file.filename == "":
            return jsonify({"error": "No file uploaded"})

        try:
            image_bytes = file.read()
            tensor = transform_image(image_bytes)
            prediction = predict(tensor)

            if isinstance(prediction, np.int64):
                prediction = int(prediction)

            # Get the class name from the prediction
            class_name = getClass(prediction)

            # Optional: Get additional turtle data from the database
            turtle_data = get_turtle_data(class_name)
            turtle_info = turtle_data if turtle_data else "No additional data found"

            # Return the prediction, raw label number, and any additional data
            return jsonify({
                'response': 200,
                'status': 'success',
                'prediction': class_name,
                'raw_label': prediction,  # Raw label number
                'additional_data': turtle_info
            })

        except Exception as e:
            return jsonify({"error": str(e)})

    return "Hello World!"

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
