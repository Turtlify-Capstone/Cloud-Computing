import os
import io
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing import image
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import h5py
import mysql.connector
from mysql.connector import Error

# Load TensorFlow model from URL
url = "https://storage.googleapis.com/turtlifystorage/model_4_kelas.h5"
response = requests.get(url)
model_content = response.content
with h5py.File(io.BytesIO(model_content), "r") as f:
    model = keras.models.load_model(f)

# Function to transform image for prediction
def transform_image(image_bytes):
    img = image.load_img(io.BytesIO(image_bytes), target_size=(400,400))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x /= 255.0
    return x

# Function to make a prediction
def predict(x):
    predictions = model.predict(x)
    predictions = tf.nn.softmax(predictions)
    pred0 = predictions[0]
    label0 = np.argmax(pred0)
    return label0

# Function to get class name from prediction
def getClass(id):
    classes = ["Tuntong Laut", "Tidak Dilindungi", "Kura-kura Rote", "Kura-kura moncong babi", ""]
    return classes[id] if 0 <= id < len(classes) else ""

# Function to create database connection
def create_db_connection():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            database='penyu',
            password='Hertzman01'
        )
        return conn
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

# Function to get plant data from database
def get_turtle_data(nama_lokal):
    conn = create_db_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM DeskripsiPenyu WHERE nama_lokal = %s", (nama_lokal,))
            row = cursor.fetchone()
            return row
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
            return jsonify({"error": "no file"})
        try: 
            image_bytes = file.read()
            tensor = transform_image(image_bytes)
            prediction = predict(tensor)
            turtle_id = getClass(prediction)
            turtle_data = get_turtle_data(turtle_id)
            if turtle_data:
                return jsonify({
                    'response': 200,
                    'status': 'success',
                    'data': turtle_data
                })
            else:
                return jsonify({'response': 404, 'status': 'error', 'message': 'Turtle not found'})
        except Exception as e:
            return jsonify({"error": str(e)})
    return "HELLO WORLD"

if __name__ == "__main__":
    app.run(debug=True)
