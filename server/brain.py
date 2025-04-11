from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from keras.preprocessing.image import load_img, img_to_array
import numpy as np
import os
import google.generativeai as genai

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
model = load_model('model/model.h5')

# Class labels
class_labels = ['pituitary', 'glioma', 'notumor', 'meningioma']

# Define the uploads folder
UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize Gemini API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'your-api-key-here')
genai.configure(api_key="")

# Initialize Gemini model
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# Helper function to get explanation from Gemini API
def get_explanation(tumor_type):
    if tumor_type == "No Tumor":
        prompt = "Provide a brief, simple explanation about what it means when an MRI brain scan shows no tumor. Make it understandable for a general audience in 2-3 sentences."
    else:
        # Extract the tumor type from the result string
        tumor_name = tumor_type.split(": ")[1]
        prompt = f"Provide a brief, simple explanation about what a {tumor_name} brain tumor is. Include basic information about its characteristics, common symptoms, and general prognosis. Make it understandable for a general audience in 3-4 sentences."
    
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error getting explanation from Gemini: {e}")
        return "Information about this condition is not available at the moment."

# Helper function to predict tumor type
def predict_tumor(image_path):
    IMAGE_SIZE = 128
    img = load_img(image_path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
    img_array = img_to_array(img) / 255.0  # Normalize pixel values
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

    predictions = model.predict(img_array)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    confidence_score = np.max(predictions, axis=1)[0]

    if class_labels[predicted_class_index] == 'notumor':
        result = "No Tumor"
    else:
        result = f"Tumor: {class_labels[predicted_class_index].capitalize()}"
    
    # Get explanation from Gemini API
    explanation = get_explanation(result)
    
    return result, confidence_score, explanation

# Route for the API endpoint
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Check if it's a file upload
        if 'file' in request.files:
            file = request.files['file']
            if file:
                # Save the file
                file_location = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
                file.save(file_location)

                # Predict the tumor
                result, confidence, explanation = predict_tumor(file_location)

                # Return JSON for React frontend
                return jsonify({
                    'result': result,
                    'confidence': f"{confidence*100:.2f}%",
                    'file_path': f'/uploads/{file.filename}',
                    'explanation': explanation
                })
        
        return jsonify({'error': 'No file provided'}), 400

    # For GET requests, just return a simple message
    return jsonify({'message': 'Brain Tumor Detection API is running. POST an image to analyze.'})

# Route to serve uploaded files
@app.route('/uploads/<filename>')
def get_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # Changed port from 5000 to 5002
    app.run(debug=True, port=5002)