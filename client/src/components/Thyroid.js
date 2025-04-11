import React, { useState } from 'react';

const ThyroidApp = () => {
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    TSH: '',
    T3: '',
    TT4: '',
    on_thyroxine: '',
    query_on_thyroxine: '',
    on_antithyroid_medication: '',
    sick: '',
    pregnant: '',
    thyroid_surgery: '',
    I131_treatment: '',
    query_hypothyroid: '',
    query_hyperthyroid: '',
    tumor: '',
    psych: ''
  });
  
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [dietRecommendations, setDietRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Keep the value as a string in the state
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    setExplanation(null);
    setDietRecommendations(null);
    
    try {
      const response = await fetch('http://localhost:5003/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPrediction(data.prediction);
        setExplanation(data.explanation);
        setDietRecommendations(data.dietRecommendations);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const cardStyle = {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    margin: '20px 0',
    padding: '20px',
    backgroundColor: 'white'
  };
  
  const headerStyle = {
    marginBottom: '20px'
  };
  
  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  };
  
  const descStyle = {
    color: '#666',
    marginBottom: '16px'
  };
  
  const formGroupStyle = {
    marginBottom: '16px'
  };
  
  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    fontSize: '14px'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px'
  };
  
  const buttonStyle = {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '16px'
  };
  
  const errorStyle = {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '16px',
    border: '1px solid #F5B8B8'
  };
  
  const resultStyle = {
    backgroundColor: '#EFF6FF',
    padding: '16px',
    borderRadius: '4px',
    marginTop: '16px',
    border: '1px solid #BFDBFE'
  };
  
  const resultTitleStyle = {
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1E40AF'
  };

  const sectionStyle = {
    marginTop: '16px',
    padding: '16px',
    borderLeft: '4px solid #3B82F6',
    backgroundColor: '#F9FAFB'
  };

  const foodListStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '12px'
  };

  const foodCardStyle = {
    padding: '12px',
    backgroundColor: '#F0FFF4',
    borderRadius: '4px',
    border: '1px solid #C6F6D5'
  };

  const avoidCardStyle = {
    padding: '12px',
    backgroundColor: '#FFF5F5',
    borderRadius: '4px',
    border: '1px solid #FED7D7'
  };
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Thyroid Classification Predictor</h2>
          <p style={descStyle}>
            Enter patient information to predict thyroid classification and get personalized recommendations
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={gridContainerStyle}>
            {/* Required fields */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Sex (0=F, 1=M)</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="">Select</option>
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>TSH Level</label>
              <input
                type="number"
                step="0.01"
                name="TSH"
                value={formData.TSH}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>T3 Level</label>
              <input
                type="number"
                step="0.01"
                name="T3"
                value={formData.T3}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>TT4 Level</label>
              <input
                type="number"
                step="0.01"
                name="TT4"
                value={formData.TT4}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            
            {/* Optional fields */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>On Thyroxine (0=No, 1=Yes)</label>
              <select
                name="on_thyroxine"
                value={formData.on_thyroxine}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Query On Thyroxine (0=No, 1=Yes)</label>
              <select
                name="query_on_thyroxine"
                value={formData.query_on_thyroxine}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>On Antithyroid Medication (0=No, 1=Yes)</label>
              <select
                name="on_antithyroid_medication"
                value={formData.on_antithyroid_medication}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Sick (0=No, 1=Yes)</label>
              <select
                name="sick"
                value={formData.sick}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Pregnant (0=No, 1=Yes)</label>
              <select
                name="pregnant"
                value={formData.pregnant}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Thyroid Surgery (0=No, 1=Yes)</label>
              <select
                name="thyroid_surgery"
                value={formData.thyroid_surgery}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>I131 Treatment (0=No, 1=Yes)</label>
              <select
                name="I131_treatment"
                value={formData.I131_treatment}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Query Hypothyroid (0=No, 1=Yes)</label>
              <select
                name="query_hypothyroid"
                value={formData.query_hypothyroid}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Query Hyperthyroid (0=No, 1=Yes)</label>
              <select
                name="query_hyperthyroid"
                value={formData.query_hyperthyroid}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Tumor (0=No, 1=Yes)</label>
              <select
                name="tumor"
                value={formData.tumor}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Psych (0=No, 1=Yes)</label>
              <select
                name="psych"
                value={formData.psych}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Unknown</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Predict'}
          </button>
        </form>
        
        {error && (
          <div style={errorStyle}>
            <p>{error}</p>
          </div>
        )}
        
        {prediction && (
          <div style={resultStyle}>
            <h3 style={resultTitleStyle}>Prediction Result</h3>
            <p>The predicted thyroid class is: <strong>{prediction}</strong></p>
            
            {explanation && (
              <div style={sectionStyle}>
                <h4 style={{...resultTitleStyle, color: '#2C5282'}}>Understanding Your Result</h4>
                <div dangerouslySetInnerHTML={{ __html: explanation }} />
              </div>
            )}
            
            {dietRecommendations && (
              <div style={sectionStyle}>
                <h4 style={{...resultTitleStyle, color: '#2C5282'}}>Dietary Recommendations</h4>
                <div>
                  <h5 style={{fontWeight: '600', marginTop: '12px', marginBottom: '8px'}}>Foods to Include:</h5>
                  <div style={foodListStyle}>
                    {dietRecommendations.include.map((food, index) => (
                      <div key={`include-${index}`} style={foodCardStyle}>
                        <div style={{fontWeight: '500'}}>{food.name}</div>
                        {food.reason && <div style={{fontSize: '14px', color: '#4B5563'}}>{food.reason}</div>}
                      </div>
                    ))}
                  </div>
                  
                  <h5 style={{fontWeight: '600', marginTop: '16px', marginBottom: '8px'}}>Foods to Avoid:</h5>
                  <div style={foodListStyle}>
                    {dietRecommendations.avoid.map((food, index) => (
                      <div key={`avoid-${index}`} style={avoidCardStyle}>
                        <div style={{fontWeight: '500'}}>{food.name}</div>
                        {food.reason && <div style={{fontSize: '14px', color: '#4B5563'}}>{food.reason}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThyroidApp;