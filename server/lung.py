from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from flask_cors import CORS
import pandas as pd
from scipy import stats
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define the neural network architecture used during training
class ANNnet(nn.Module):
    def __init__(self, input_features=15):  # Adjust input features based on your model
        super().__init__()

        self.input = nn.Linear(input_features, 256)

        self.fc1 = nn.Linear(256, 256)
        self.bn1 = nn.BatchNorm1d(256)

        self.fc2 = nn.Linear(256, 256)
        self.bn2 = nn.BatchNorm1d(256)

        self.fc3 = nn.Linear(256, 256)
        self.bn3 = nn.BatchNorm1d(256)

        self.fc4 = nn.Linear(256, 256)
        self.bn4 = nn.BatchNorm1d(256)

        self.fc5 = nn.Linear(256, 256)
        self.bn5 = nn.BatchNorm1d(256)

        self.output = nn.Linear(256, 1)

    def forward(self, x):
        x = F.relu(self.input(x))
        x = F.dropout(x, .5)

        x = self.fc1(x)
        x = self.bn1(x)
        x = F.relu(x)
        x = F.dropout(x, .5)

        x = self.fc2(x)
        x = self.bn2(x)
        x = F.relu(x)
        x = F.dropout(x, .5)

        x = self.fc3(x)
        x = self.bn3(x)
        x = F.relu(x)
        x = F.dropout(x, .5)

        x = self.fc4(x)
        x = self.bn4(x)
        x = F.relu(x)
        x = F.dropout(x, .5)

        x = self.fc5(x)
        x = self.bn5(x)
        x = F.relu(x)
        x = F.dropout(x, .5)

        return self.output(x)

# Helper functions from your training code
def groupAge(AGE):
    if AGE < 10:
        return 0
    elif AGE < 20:
        return 1
    elif AGE < 30:
        return 2
    elif AGE < 40:
        return 3
    elif AGE < 50:
        return 4
    elif AGE < 60:
        return 5
    elif AGE < 70:
        return 6
    elif AGE < 80:
        return 7
    else:
        return 8

def preprocess_input(data):
    """
    Preprocess the input data similar to training process
    """
    # Convert gender from string to binary (M=1, F=0)
    if 'GENDER' in data:
        data['GENDER'] = 1 if data['GENDER'].upper() == 'M' else 0
    
    # Convert boolean fields to 1/2 format
    binary_fields = ['SMOKING', 'YELLOW_FINGERS', 'ANXIETY', 'PEER_PRESSURE', 
                    'CHRONIC DISEASE', 'FATIGUE', 'ALLERGY', 'WHEEZING', 
                    'ALCOHOL', 'COUGHING', 'SHORTNESS OF BREATH', 
                    'SWALLOWING DIFFICULTY', 'CHEST PAIN']
    
    for field in binary_fields:
        if field in data:
            # Convert from any format to 1/2 (1=No, 2=Yes)
            value = data[field]
            if isinstance(value, str):
                data[field] = 2 if value.upper() in ['YES', 'Y', 'TRUE', '1', '2'] else 1
            else:
                data[field] = 2 if value else 1
    
    # Process age
    if 'AGE' in data:
        data['age_group'] = groupAge(data['AGE'])
        del data['AGE']
    
    # Convert to dataframe for easier processing
    df = pd.DataFrame([data])
    
    # Z-score normalization (matching training pipeline)
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    df[numeric_cols] = df[numeric_cols].apply(stats.zscore)
    
    # Convert to tensor
    features = torch.tensor(df.values, dtype=torch.float32)
    return features

# Load the model
form_model = None

def load_model():
    global form_model
    try:
        # Load form-based model
        form_model = ANNnet()
        form_model_path = "trained_model.pth"
        if os.path.exists(form_model_path):
            form_model.load_state_dict(torch.load(form_model_path, map_location=torch.device('cpu')))
            form_model.eval()
            print("Form model loaded successfully!")
        else:
            print(f"Warning: Form model file {form_model_path} does not exist")
        
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

@app.route('/predict_form', methods=['POST'])
def predict():
    # Check if model is loaded
    global form_model
    if form_model is None:
        if not load_model():
            return jsonify({'error': 'Model could not be loaded'}), 500
    
    try:
        # Get data from request
        data = request.json
        
        # Validate that we have the required fields
        required_fields = ['GENDER', 'AGE', 'SMOKING', 'YELLOW_FINGERS', 'ANXIETY', 
                          'PEER_PRESSURE', 'CHRONIC DISEASE', 'FATIGUE', 'ALLERGY', 
                          'WHEEZING', 'ALCOHOL', 'COUGHING', 'SHORTNESS OF BREATH', 
                          'SWALLOWING DIFFICULTY', 'CHEST PAIN']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Preprocess the input
        input_tensor = preprocess_input(data)
        
        # Make prediction
        with torch.no_grad():
            output = form_model(input_tensor)
            probability = torch.sigmoid(output).item()
            
            # Check for NaN and handle it
            if np.isnan(probability):
                probability = 0.5  # Default to 50% if we get NaN
                
            prediction = "YES" if probability > 0.5 else "NO"
        
        # Return the result
        return jsonify({
            'prediction': prediction,
            'probability': float(probability),  # Ensure it's a Python float
            'message': f"Lung cancer prediction: {prediction} (probability: {probability:.2f})"
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    # Load models at startup
    load_model()
    app.run(debug=True, host='0.0.0.0', port=5004)