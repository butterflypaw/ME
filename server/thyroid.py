from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
import json
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from sklearn.ensemble import RandomForestClassifier  # Added this import

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
model_path = 'model.pkl'
with open(model_path, 'rb') as f:
    model = pickle.load(f)

# Configure Gemini AI
# You'll need to set your API key - for production, use environment variables
# os.environ["GOOGLE_API_KEY"] = "your-api-key"  
genai.configure(api_key="")

# Configure the model
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 0,
    "max_output_tokens": 2048,
}

safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}

def get_explanation(thyroid_class, patient_data):
    """Generate an explanation of the thyroid condition using Gemini."""
    model = genai.GenerativeModel(model_name="gemini-1.5-flash",
                                 generation_config=generation_config,
                                 safety_settings=safety_settings)
    
    # Create a prompt with the thyroid class and relevant patient data
    prompt = f"""
    As a medical expert, provide a clear, easy-to-understand explanation of the thyroid condition: {thyroid_class}.
    
    Include the following in your response:
    1. A brief explanation of what this condition means in simple terms
    2. Common symptoms a person might experience
    3. Potential causes of this condition
    4. How this might affect daily life
    
    Format your response with HTML paragraph tags for better readability.
    Keep your explanation under 300 words and make it understandable to someone without medical background.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating explanation: {e}")
        return "<p>Unable to generate explanation at this time. Please consult with your healthcare provider for information about your condition.</p>"

def get_diet_recommendations(thyroid_class):
    """Generate dietary recommendations for the thyroid condition using Gemini."""
    model = genai.GenerativeModel(model_name="gemini-1.5-flash",
                                 generation_config=generation_config,
                                 safety_settings=safety_settings)
    
    prompt = f"""
    As a nutritionist specializing in thyroid health, provide dietary recommendations for someone with {thyroid_class}.
    
    Return your response in JSON format with the following structure:
    {{
        "include": [
            {{"name": "Food name", "reason": "Brief reason why this food is beneficial"}}
        ],
        "avoid": [
            {{"name": "Food name", "reason": "Brief reason why this food should be avoided"}}
        ]
    }}
    
    Include exactly 5 foods to include and 5 foods to avoid, with a brief explanation for each.
    Ensure your recommendations are evidence-based and specifically tailored for {thyroid_class}.
    """
    
    try:
        response = model.generate_content(prompt)
        # Parse the JSON response
        # Clean the response to handle potential formatting issues
        cleaned_response = response.text.strip()
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
            
        return json.loads(cleaned_response)
    except Exception as e:
        print(f"Error generating diet recommendations: {e}")
        # Return fallback recommendations if there's an error
        return {
            "include": [
                {"name": "Seafood", "reason": "Rich in iodine and selenium"},
                {"name": "Fruits and vegetables", "reason": "Provide essential vitamins and antioxidants"},
                {"name": "Lean proteins", "reason": "Support thyroid hormone production"},
                {"name": "Whole grains", "reason": "Provide fiber and nutrients"},
                {"name": "Nuts and seeds", "reason": "Contain healthy fats and minerals"}
            ],
            "avoid": [
                {"name": "Processed foods", "reason": "May contain additives that interfere with thyroid function"},
                {"name": "Excessive soy products", "reason": "May affect thyroid hormone absorption"},
                {"name": "High-sugar foods", "reason": "Can contribute to inflammation"},
                {"name": "Alcohol", "reason": "Can affect thyroid function"},
                {"name": "Caffeine", "reason": "May interfere with medication absorption"}
            ]
        }

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get the data from the POST request
        data = request.get_json()
        
        # Convert string values to appropriate types, handling empty strings
        def convert_value(value):
            if value == '' or value is None:
                return np.nan
            try:
                return float(value)
            except:
                return np.nan
        
        # Convert to DataFrame with proper handling of empty strings
        input_data = pd.DataFrame({
            'age': [convert_value(data.get('age'))],
            'sex': [convert_value(data.get('sex'))],
            'TSH': [convert_value(data.get('TSH'))],
            'T3': [convert_value(data.get('T3'))],
            'TT4': [convert_value(data.get('TT4'))],
            'on_thyroxine': [convert_value(data.get('on_thyroxine'))],
            'query_on_thyroxine': [convert_value(data.get('query_on_thyroxine'))],
            'on_antithyroid_medication': [convert_value(data.get('on_antithyroid_medication'))],
            'sick': [convert_value(data.get('sick'))],
            'pregnant': [convert_value(data.get('pregnant'))],
            'thyroid_surgery': [convert_value(data.get('thyroid_surgery'))],
            'I131_treatment': [convert_value(data.get('I131_treatment'))],
            'query_hypothyroid': [convert_value(data.get('query_hypothyroid'))],
            'query_hyperthyroid': [convert_value(data.get('query_hyperthyroid'))],
            'tumor': [convert_value(data.get('tumor'))],
            'psych': [convert_value(data.get('psych'))]
        })
        
        # Print the input data for debugging
        print("Input data:", input_data)
        
        # Make prediction
        prediction = model.predict(input_data)
        thyroid_class = prediction[0]
        
        # Get explanation and diet recommendations
        explanation = get_explanation(thyroid_class, input_data)
        diet_recommendations = get_diet_recommendations(thyroid_class)
        
        # Return the prediction along with explanations and recommendations
        return jsonify({
            'prediction': thyroid_class,
            'explanation': explanation,
            'dietRecommendations': diet_recommendations,
            'success': True
        })
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

class ThyroidAssessmentModel:
    def __init__(self):
        # Initialize a simple Random Forest Classifier
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # For demonstration, we'll "train" it with some basic rules
        # Symptoms are: fatigue, weight_change, cold_sensitivity, hair_loss, 
        # dry_skin, mood_changes, neck_swelling, heart_rate_changes
        
        # Generate synthetic training data based on medical heuristics
        # This is oversimplified and for demonstration only
        np.random.seed(42)
        X_train = np.random.rand(1000, 8)  # 8 features
        
        # Simplified rule: 
        # - If 4+ symptoms have severity > 0.6, likely needs testing
        # - If neck_swelling or multiple symptoms are severe, likely needs testing
        y_train = np.zeros(1000)
        for i in range(1000):
            severe_symptoms = sum(X_train[i] > 0.6)
            neck_swelling = X_train[i, 6] > 0.7
            
            if severe_symptoms >= 4 or neck_swelling or sum(X_train[i] > 0.8) >= 2:
                y_train[i] = 1
                
        self.model.fit(X_train, y_train)
    
    def predict(self, symptoms):
        # Convert symptoms dict to array in the correct order
        features = np.array([[
            symptoms.get('fatigue', 0),
            symptoms.get('weight_change', 0),
            symptoms.get('cold_sensitivity', 0),
            symptoms.get('hair_loss', 0),
            symptoms.get('dry_skin', 0),
            symptoms.get('mood_changes', 0),
            symptoms.get('neck_swelling', 0),
            symptoms.get('heart_rate_changes', 0)
        ]])
        
        # Get prediction and probability
        prediction = self.model.predict(features)[0]
        proba = self.model.predict_proba(features)[0]
        
        return {
            'needs_testing': bool(prediction),
            'confidence': float(proba[int(prediction)])
        }

# Initialize the model
thyroid_model = ThyroidAssessmentModel()

# Add this route to your Flask application
@app.route('/api/assess', methods=['POST'])
def assess_symptoms():
    # Optional: Add authentication check here if needed
    # token = request.headers.get('x-auth-token')
    # if not verify_token(token):
    #     return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        # Get symptom data from request
        symptom_data = request.json
        
        # Extract just the symptom keys we need
        symptoms = {
            'fatigue': symptom_data.get('fatigue', 0),
            'weight_change': symptom_data.get('weight_change', 0),
            'cold_sensitivity': symptom_data.get('cold_sensitivity', 0),
            'hair_loss': symptom_data.get('hair_loss', 0),
            'dry_skin': symptom_data.get('dry_skin', 0),
            'mood_changes': symptom_data.get('mood_changes', 0),
            'neck_swelling': symptom_data.get('neck_swelling', 0),
            'heart_rate_changes': symptom_data.get('heart_rate_changes', 0)
        }
        
        # Make prediction using the model
        result = thyroid_model.predict(symptoms)
        
        # Add recommendations based on the prediction
        recommendation = ""
        if result['needs_testing']:
            recommendation = "Based on your symptoms, we recommend consulting with a healthcare provider about thyroid testing."
        else:
            recommendation = "Your symptoms don't strongly indicate a need for thyroid testing, but monitor your condition and consult a healthcare provider if symptoms worsen."
            
        result['recommendation'] = recommendation
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003)