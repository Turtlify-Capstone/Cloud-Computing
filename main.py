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
    img = image.load_img(io.BytesIO(image_bytes), target_size=(224,224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x /= 255.0
    return x

# Function to make a prediction
def predict(x):
    prediction = model.predict(x)
    # Assuming the model directly returns the string label
    predicted_label = prediction[0]
    return predicted_label

# Function to get class name from prediction
#def getClass(id):
    #classes = ["Kura-kura Rote", "Tuntong Laut","Kura-kura moncong babi",  "Tidak Dilindungi"]
    #return classes[id] if 0 <= id < len(classes) else ""

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
            turtle_label = predict(tensor)  # Directly gets the turtle label as a string
            turtle_data = get_turtle_data(turtle_label)
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
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
