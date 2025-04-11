import React, { useState } from 'react';
import "../styles/TestForm.css";

const SYMPTOM_QUESTIONS = [
  {
    id: 'fatigue',
    question: 'How would you rate your level of fatigue or tiredness?',
    info: 'Thyroid issues can cause persistent fatigue that does not improve with rest.'
  },
  {
    id: 'weight_change',
    question: 'Have you experienced unexplained weight changes?',
    info: 'Hypothyroidism can cause weight gain, while hyperthyroidism may cause weight loss.'
  },
  {
    id: 'cold_sensitivity',
    question: 'How sensitive are you to cold temperatures?',
    info: 'Increased sensitivity to cold is common with hypothyroidism.'
  },
  {
    id: 'hair_loss',
    question: 'Have you noticed increased hair loss or thinning?',
    info: 'Thyroid disorders can affect hair follicles, leading to hair loss.'
  },
  {
    id: 'dry_skin',
    question: 'How dry or rough is your skin?',
    info: 'Dry, rough skin can be a symptom of hypothyroidism.'
  },
  {
    id: 'mood_changes',
    question: 'Have you experienced mood changes like depression or anxiety?',
    info: 'Thyroid hormones affect brain function and can influence mood.'
  },
  {
    id: 'neck_swelling',
    question: 'Have you noticed any swelling in your neck area?',
    info: 'An enlarged thyroid gland (goiter) may indicate thyroid issues.'
  },
  {
    id: 'heart_rate_changes',
    question: 'Have you experienced changes in your heart rate (too fast or slow)?',
    info: 'Hyperthyroidism can cause rapid heartbeat, while hypothyroidism may slow it down.'
  }
];

function Thyroid() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fatigue: 0,
    weight_change: 0,
    cold_sensitivity: 0,
    hair_loss: 0,
    dry_skin: 0,
    mood_changes: 0,
    neck_swelling: 0,
    heart_rate_changes: 0
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({
    age: '',
    gender: '',
    familyHistory: 'no'
  });

  const handleSymptomChange = (symptomId, value) => {
    setFormData(prev => ({
      ...prev,
      [symptomId]: parseFloat(value)
    }));
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5003/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') // Use your app's authentication
        },
        body: JSON.stringify({ 
          ...formData, 
          personalInfo 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResults(null);
    setCurrentStep(0);
    setFormData({
      fatigue: 0,
      weight_change: 0,
      cold_sensitivity: 0,
      hair_loss: 0,
      dry_skin: 0,
      mood_changes: 0,
      neck_swelling: 0,
      heart_rate_changes: 0
    });
    setPersonalInfo({
      age: '',
      gender: '',
      familyHistory: 'no'
    });
  };

  const nextStep = () => {
    if (currentStep < SYMPTOM_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper function to convert slider value to text
  const getSymptomSeverityText = (value) => {
    const numValue = parseFloat(value);
    if (numValue <= 0.2) return "None or minimal";
    if (numValue <= 0.4) return "Mild";
    if (numValue <= 0.6) return "Moderate";
    if (numValue <= 0.8) return "Significant";
    return "Severe";
  };

  // Results display component
  const Results = () => {
    const { needs_testing, confidence, recommendation } = results;
    
    return (
      <div className="results-container">
        <div className={`results-card ${needs_testing ? 'recommend-test' : 'no-test'}`}>
          <div className="results-header">
            <h2>Assessment Results</h2>
            <div className="result-indicator">
              {needs_testing ? (
                <span className="test-recommended">Testing Recommended</span>
              ) : (
                <span className="test-not-needed">Testing May Not Be Needed</span>
              )}
            </div>
          </div>
          
          <div className="results-body">
            <p className="recommendation">{recommendation}</p>
            
            <div className="confidence-meter">
              <p>Confidence in this assessment:</p>
              <div className="meter-container">
                <div 
                  className="meter-fill" 
                  style={{ width: `${confidence * 100}%` }}
                ></div>
              </div>
              <span className="confidence-value">{Math.round(confidence * 100)}%</span>
            </div>
            
            <div className="next-steps">
              <h3>Next Steps</h3>
              <ul>
                {needs_testing ? (
                  <>
                    <li>Schedule an appointment with your healthcare provider</li>
                    <li>Request a thyroid function test (TSH, T3, T4)</li>
                    <li>Bring a list of your symptoms to discuss</li>
                  </>
                ) : (
                  <>
                    <li>Monitor your symptoms over time</li>
                    <li>Consider lifestyle changes that may help with your symptoms</li>
                    <li>If symptoms persist or worsen, consult a healthcare provider</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          <div className="disclaimer">
            <p><strong>Important:</strong> This assessment is not a medical diagnosis. Always consult with a healthcare professional regarding health concerns.</p>
          </div>
          
          <button onClick={resetForm} className="reset-button">
            Start New Assessment
          </button>
        </div>
      </div>
    );
  };

  // If results are available, show them
  if (results) {
    return <Results />;
  }

  // Initial personal information step
  if (currentStep === 0) {
    return (
      <div className="thyroid-container">
        <div className="thyroid-header">
          <h1>Thyroid Assessment Tool</h1>
          <p>Evaluate your symptoms to determine if thyroid testing may be beneficial</p>
        </div>
        
        <div className="form-container">
          <form className="assessment-form">
            <h2>Personal Information</h2>
            <p>This information helps provide a more accurate assessment.</p>
            
            <div className="form-group">
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={personalInfo.age}
                onChange={handlePersonalInfoChange}
                min="1"
                max="120"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gender">Gender:</label>
              <select
                id="gender"
                name="gender"
                value={personalInfo.gender}
                onChange={handlePersonalInfoChange}
                required
              >
                <option value="">Select an option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="familyHistory">Family history of thyroid disorders:</label>
              <select
                id="familyHistory"
                name="familyHistory"
                value={personalInfo.familyHistory}
                onChange={handlePersonalInfoChange}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="unknown">I don't know</option>
              </select>
            </div>
            
            <div className="button-group">
              <button type="button" onClick={nextStep} className="next-button">
                Next
              </button>
            </div>
          </form>
        </div>
        
        <div className="thyroid-footer">
          <p>Disclaimer: This tool is for informational purposes only and does not replace professional medical advice.</p>
        </div>
      </div>
    );
  }

  // Symptom questions (steps 1 through 8)
  if (currentStep <= SYMPTOM_QUESTIONS.length) {
    const questionIndex = currentStep - 1;
    const question = SYMPTOM_QUESTIONS[questionIndex];
    
    return (
      <div className="thyroid-container">
        <div className="thyroid-header">
          <h1>Thyroid Assessment Tool</h1>
        </div>
        
        <div className="form-container">
          <form className="assessment-form">
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(currentStep / (SYMPTOM_QUESTIONS.length + 1)) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">Question {currentStep} of {SYMPTOM_QUESTIONS.length}</span>
            
            <div className="question-container">
              <h3>{question.question}</h3>
              <p className="info-text">{question.info}</p>
              
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData[question.id]}
                  onChange={(e) => handleSymptomChange(question.id, e.target.value)}
                  className="symptom-slider"
                />
                <div className="slider-labels">
                  <span>None</span>
                  <span>Mild</span>
                  <span>Severe</span>
                </div>
                <div className="slider-value">
                  {getSymptomSeverityText(formData[question.id])}
                </div>
              </div>
            </div>
            
            <div className="button-group">
              <button type="button" onClick={prevStep} className="prev-button">
                Previous
              </button>
              {currentStep < SYMPTOM_QUESTIONS.length ? (
                <button type="button" onClick={nextStep} className="next-button">
                  Next
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Get Assessment'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Thyroid;