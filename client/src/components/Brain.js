import React, { useState, useRef } from 'react';
import '../styles/Brain.css';

const BrainTumorDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setErrorMessage('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setErrorMessage('');
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setErrorMessage('');
      setResult(null);
    } else {
      setErrorMessage('Please drop an image file');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select an image to analyze');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5002/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      setResult({
        diagnosis: data.result,
        confidence: data.confidence,
        explanation: data.explanation
      });
    } catch (error) {
      setErrorMessage('Error analyzing image. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
    setResult(null);
    setErrorMessage('');
    fileInputRef.current.value = '';
  };

  return (
    <div className="container">
      <div className="content-wrapper">
        <div className="header">
          <h1>Brain Tumor Detection</h1>
          <p>Upload an MRI scan image to detect brain tumors</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div 
                className={`drop-zone ${preview ? 'has-preview' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden-input"
                  onChange={handleFileChange}
                />
                
                {!preview ? (
                  <div className="upload-placeholder">
                    <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="upload-text">Drag & Drop your MRI scan here<br />or click to browse</p>
                    <p className="upload-format">Supported formats: JPEG, PNG</p>
                  </div>
                ) : (
                  <div className="preview-container">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="preview-image" 
                    />
                    <div className="preview-actions">
                      <button 
                        type="button" 
                        className="change-button"
                        onClick={handleUploadClick}
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}

              <div className="submit-container">
                <button
                  type="submit"
                  disabled={!selectedFile || isLoading}
                  className="submit-button"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
              </div>
            </form>

            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Analyzing image...</p>
              </div>
            )}

            {result && (
              <div className={`result-container ${result.diagnosis === 'No Tumor' ? 'no-tumor' : 'tumor-detected'}`}>
                <h3 className="result-heading">
                  {result.diagnosis === 'No Tumor' ? 'No Tumor Detected' : `${result.diagnosis} Detected`}
                </h3>
                <p className="confidence-level">
                  <span className="confidence-label">Confidence:</span> 
                  <span className="confidence-value">{result.confidence}</span>
                </p>
                <h4 className="explanation-heading">Explanation:</h4>
                <p className="explanation-text">{result.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainTumorDetection;