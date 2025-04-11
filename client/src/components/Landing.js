import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const ThyroidLanding = () => {
  return (
    <div className="thyroid-landing-container">
      <h1 className="thyroid-landing-title">Thyroid Services</h1>
      <p className="thyroid-landing-description">
        Please select one of the following options to continue
      </p>
      
      <div className="thyroid-options-container">
        <Link to="/thyroid" className="thyroid-option-card">
          <div className="thyroid-option-icon">
            <i className="fas fa-microscope"></i>
          </div>
          <h2 className="thyroid-option-title">Thyroid Detection</h2>
          <p className="thyroid-option-description">
            Use our advanced detection algorithm to analyze thyroid conditions
          </p>
        </Link>
        
        <Link to="/form" className="thyroid-option-card">
          <div className="thyroid-option-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h2 className="thyroid-option-title">Test Form</h2>
          <p className="thyroid-option-description">
            Fill out our comprehensive test form for thyroid evaluation
          </p>
        </Link>
      </div>
    </div>
  );
};

export default ThyroidLanding;