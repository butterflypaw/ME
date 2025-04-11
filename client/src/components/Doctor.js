import React, { useState } from 'react';
import '../styles/Doctor.css';

const Doctor = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Hardcoded hospital data with specialties
  const hospitals = [
    {
      id: 1,
      name: "City Medical Center",
      specialty: ["thyroid", "lung"],
      address: "123 Healthcare Ave, Medical District",
      distance: 1.2,
      rating: 4.5,
      phone: "(555) 123-4567"
    },
    {
      id: 2,
      name: "Neuroscience Institute",
      specialty: ["brain"],
      address: "456 Neurology Blvd, Research Park",
      distance: 2.4,
      rating: 4.8,
      phone: "(555) 987-6543"
    },
    {
      id: 3,
      name: "Pulmonary Care Hospital",
      specialty: ["lung"],
      address: "789 Respiratory Road, Health Zone",
      distance: 0.8,
      rating: 4.3,
      phone: "(555) 234-5678"
    },
    {
      id: 4,
      name: "Thyroid & Endocrine Center",
      specialty: ["thyroid"],
      address: "321 Hormone Highway, Care Complex",
      distance: 3.1,
      rating: 4.6,
      phone: "(555) 876-5432"
    },
    {
      id: 5,
      name: "Comprehensive Care Hospital",
      specialty: ["thyroid", "lung", "brain"],
      address: "555 Wellness Way, Treatment Town",
      distance: 1.9,
      rating: 4.7,
      phone: "(555) 345-6789"
    }
  ];

  // Filter hospitals based on selected specialty
  const filteredHospitals = selectedSpecialty === 'all' 
    ? hospitals 
    : hospitals.filter(hospital => hospital.specialty.includes(selectedSpecialty));

  // Function to render star ratings
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="stars-container">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="star">★</span>
        ))}
        {hasHalfStar && <span className="star">½</span>}
      </div>
    );
  };

  return (
    <div className="hospitals-container">
      <h2 className="hospitals-title">Nearby Specialized Hospitals</h2>
      
      {/* Filter buttons */}
      <div className="filter-buttons">
        <button 
          onClick={() => setSelectedSpecialty('all')}
          className={`filter-button ${selectedSpecialty === 'all' ? 'active' : ''}`}
        >
          All Specialties
        </button>
        <button 
          onClick={() => setSelectedSpecialty('thyroid')}
          className={`filter-button ${selectedSpecialty === 'thyroid' ? 'active' : ''}`}
        >
          Thyroid
        </button>
        <button 
          onClick={() => setSelectedSpecialty('lung')}
          className={`filter-button ${selectedSpecialty === 'lung' ? 'active' : ''}`}
        >
          Lung
        </button>
        <button 
          onClick={() => setSelectedSpecialty('brain')}
          className={`filter-button ${selectedSpecialty === 'brain' ? 'active' : ''}`}
        >
          Brain
        </button>
      </div>
      
      {/* Hospital cards */}
      <div className="hospital-cards">
        {filteredHospitals.map(hospital => (
          <div key={hospital.id} className="hospital-card">
            <div className="hospital-header">
              <h3 className="hospital-name">{hospital.name}</h3>
              <span className="distance-badge">{hospital.distance} miles away</span>
            </div>
            
            <div className="specialty-tags">
              {hospital.specialty.map((spec) => (
                <span key={spec} className="specialty-tag">
                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                </span>
              ))}
            </div>
            
            <p className="hospital-address">{hospital.address}</p>
            
            <div className="hospital-footer">
              <div className="rating-container">
                {renderStars(hospital.rating)}
                <span className="rating-number">{hospital.rating}</span>
              </div>
              <a href={`tel:${hospital.phone}`} className="phone-link">{hospital.phone}</a>
            </div>
          </div>
        ))}
      </div>
      
      {filteredHospitals.length === 0 && (
        <div className="no-results">
          No hospitals found for the selected specialty in your area.
        </div>
      )}
    </div>
  );
};

export default Doctor;