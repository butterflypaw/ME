import React, { useState } from 'react';
import "../styles/Lung.css";

function LungCancerPrediction() {
  const [formData, setFormData] = useState({
    GENDER: 'M',
    AGE: 30,
    SMOKING: 1,
    YELLOW_FINGERS: 1,
    ANXIETY: 1,
    PEER_PRESSURE: 1,
    'CHRONIC DISEASE': 1,
    FATIGUE: 1,
    ALLERGY: 1,
    WHEEZING: 1,
    ALCOHOL: 1,
    COUGHING: 1,
    'SHORTNESS OF BREATH': 1,
    'SWALLOWING DIFFICULTY': 1,
    'CHEST PAIN': 1
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'AGE' ? parseInt(value) : value
    });
  };

  const handleBinaryChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Form-based prediction
      const response = await fetch('http://localhost:5004/predict_form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError('Error making prediction: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Risk level indicators based on probability
  const getRiskLevel = (probability) => {
    if (probability < 0.3) return { level: 'Low', color: 'text-emerald-600' };
    if (probability < 0.6) return { level: 'Moderate', color: 'text-amber-600' };
    return { level: 'High', color: 'text-rose-600' };
  };

  return (
    <div className="lung-container">
      <div className="lung-content">
        <div className="lung-header">
          <h1>Lung Cancer Risk Assessment</h1>
          <p>Complete the form below for a personalized risk evaluation</p>
        </div>
        
        <div className="form-container">
          <div className="form-header">
            <h2>Patient Information & Risk Factors</h2>
            <p>All fields are required for accurate assessment</p>
          </div>
          
          <form onSubmit={handleSubmit} className="assessment-form">
            <div className="form-grid">
              {/* Demographics Section */}
              <div className="section demographics">
                <h3>Demographics</h3>
                <div className="field-grid">
                  <div className="form-field">
                    <label htmlFor="gender">Gender</label>
                    <select
                      name="GENDER"
                      value={formData.GENDER}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      name="AGE"
                      value={formData.AGE}
                      onChange={handleChange}
                      min="1"
                      max="120"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              
              {/* Primary Risk Factors */}
              <div className="section risk-factors">
                <h3>Primary Risk Factors</h3>
                <div className="field-grid">
                  {[
                    { id: 'SMOKING', label: 'Smoking Habit' },
                    { id: 'ALCOHOL', label: 'Alcohol Consumption' },
                    { id: 'YELLOW_FINGERS', label: 'Yellow Fingers' },
                    { id: 'PEER_PRESSURE', label: 'Peer Pressure' }
                  ].map((field) => (
                    <div key={field.id} className="radio-card">
                      <label className="card-label">{field.label}</label>
                      <div className="radio-options">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={field.id}
                            value="1"
                            checked={formData[field.id] === 1}
                            onChange={handleBinaryChange}
                            className="radio-input"
                          />
                          <span>No</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={field.id}
                            value="2"
                            checked={formData[field.id] === 2}
                            onChange={handleBinaryChange}
                            className="radio-input"
                          />
                          <span>Yes</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Symptoms */}
              <div className="section symptoms">
                <h3>Symptoms</h3>
                <div className="symptoms-grid">
                  {[
                    { id: 'ANXIETY', label: 'Anxiety' },
                    { id: 'CHRONIC DISEASE', label: 'Chronic Disease' },
                    { id: 'FATIGUE', label: 'Fatigue' },
                    { id: 'ALLERGY', label: 'Allergy' },
                    { id: 'WHEEZING', label: 'Wheezing' },
                    { id: 'COUGHING', label: 'Coughing' },
                    { id: 'SHORTNESS OF BREATH', label: 'Shortness of Breath' },
                    { id: 'SWALLOWING DIFFICULTY', label: 'Swallowing Difficulty' },
                    { id: 'CHEST PAIN', label: 'Chest Pain' }
                  ].map((field) => (
                    <div key={field.id} className="radio-card">
                      <label className="card-label">{field.label}</label>
                      <div className="radio-options">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={field.id}
                            value="1"
                            checked={formData[field.id] === 1}
                            onChange={handleBinaryChange}
                            className="radio-input"
                          />
                          <span>No</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={field.id}
                            value="2"
                            checked={formData[field.id] === 2}
                            onChange={handleBinaryChange}
                            className="radio-input"
                          />
                          <span>Yes</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="submit-container">
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? (
                  <span className="loading-spinner">
                    <svg className="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Calculate Risk'}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="error-alert" role="alert">
              <div className="error-content">
                <div className="error-icon">
                  <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="error-message">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {prediction && (
          <div className="results-container">
            <div className={`results-header ${prediction.prediction === 'YES' ? 'high-risk' : 'low-risk'}`}>
              <h2 className="results-title">
                {prediction.prediction === 'YES' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="warning-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Risk Detected
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Low Risk Detected
                  </>
                )}
              </h2>
            </div>
            
            <div className="results-content">
              <div className="assessment-results">
                <h3 className="results-heading">Assessment Results</h3>
                <div className="results-details">
                  <div className="result-item">
                    <span className="result-label">Risk Level:</span>
                    <span className={`result-value ${getRiskLevel(prediction.probability).color}`}>
                      {getRiskLevel(prediction.probability).level}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Probability Score:</span>
                    <span className="result-value probability">{(prediction.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className={`progress-bar ${
                        prediction.probability < 0.3 ? 'low-risk-bar' : 
                        prediction.probability < 0.6 ? 'medium-risk-bar' : 'high-risk-bar'
                      }`}
                      style={{ width: `${prediction.probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {prediction.prediction === 'YES' && (
                <div className="warning-alert">
                  <div className="warning-content">
                    <div className="warning-icon">
                      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="warning-message">
                      <p>
                        <strong>Important:</strong> This assessment suggests a higher risk for lung cancer. Please consult with a healthcare professional for a comprehensive evaluation and proper medical advice.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default LungCancerPrediction;