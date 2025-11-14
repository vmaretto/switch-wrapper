import { useState } from 'react';
import HeaderSwitch from './HeaderSwitch';
import FooterSwitch from './FooterSwitch';

function DemographicsForm({ onComplete }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    profession: '',
    fruitsVegetables: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleAgeChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 1 && Number(value) <= 120)) {
      setFormData({ ...formData, age: value });
      setErrors({ ...errors, age: false });
    }
  };

  const handleGenderChange = (gender) => {
    setFormData({ ...formData, gender });
    setErrors({ ...errors, gender: false });
  };

  const handleProfessionChange = (e) => {
    setFormData({ ...formData, profession: e.target.value });
    setErrors({ ...errors, profession: false });
  };

  const handleFruitsVegetablesChange = (value) => {
    setFormData({ ...formData, fruitsVegetables: value });
    setErrors({ ...errors, fruitsVegetables: false });
  };

  const validateForm = () => {
    const newErrors = {};
    const ageNum = Number(formData.age);
    if (!formData.age || ageNum < 1 || ageNum > 120) newErrors.age = true;
    if (!formData.gender) newErrors.gender = true;
    if (!formData.profession) newErrors.profession = true;
    if (!formData.fruitsVegetables) newErrors.fruitsVegetables = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    // Genera un session ID se non esiste
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', sessionId);
    }

    try {
      // Salva i dati nel database tramite API
      const response = await fetch('/api/demographics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sessionId
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Salva anche in localStorage come backup
        localStorage.setItem('userDemographics', JSON.stringify(formData));
        localStorage.setItem('demographicsCompleted', 'true');
        onComplete(formData);
      } else {
        throw new Error(data.error || 'Failed to save demographics');
      }
    } catch (error) {
      console.error('Error saving demographics:', error);
      setSubmitError('Failed to save data. Please try again.');

      // Fallback: salva solo in localStorage
      localStorage.setItem('userDemographics', JSON.stringify(formData));
      localStorage.setItem('demographicsCompleted', 'true');

      // Continua comunque dopo 2 secondi
      setTimeout(() => {
        onComplete(formData);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="demographics-container">
      <HeaderSwitch />
      <div className="demographics-content">
        <div className="demographics-card">
          <h1 className="demographics-title">Tell us about you</h1>

        {/* Age Input */}
        <div className="demographics-field">
          <label className="demographics-label">Age</label>
          <input
            type="number"
            className="demographics-input-number"
            value={formData.age}
            onChange={handleAgeChange}
            placeholder="25"
            min="1"
            max="120"
          />
        </div>

        {/* Gender Radio Buttons */}
        <div className="demographics-field">
          <label className="demographics-label">Gender</label>
          <div className="demographics-radio-group">
            <button
              className={`demographics-radio-button ${formData.gender === 'Female' ? 'selected' : ''}`}
              onClick={() => handleGenderChange('Female')}
            >
              <span className={`demographics-radio-circle ${formData.gender === 'Female' ? 'selected' : ''}`}>
                {formData.gender === 'Female' && <span className="demographics-radio-dot"></span>}
              </span>
              <span className="demographics-radio-label">Female</span>
            </button>

            <button
              className={`demographics-radio-button ${formData.gender === 'Male' ? 'selected' : ''}`}
              onClick={() => handleGenderChange('Male')}
            >
              <span className={`demographics-radio-circle ${formData.gender === 'Male' ? 'selected' : ''}`}>
                {formData.gender === 'Male' && <span className="demographics-radio-dot"></span>}
              </span>
              <span className="demographics-radio-label">Male</span>
            </button>

            <button
              className={`demographics-radio-button ${formData.gender === 'Other' ? 'selected' : ''}`}
              onClick={() => handleGenderChange('Other')}
            >
              <span className={`demographics-radio-circle ${formData.gender === 'Other' ? 'selected' : ''}`}>
                {formData.gender === 'Other' && <span className="demographics-radio-dot"></span>}
              </span>
              <span className="demographics-radio-label">Other</span>
            </button>
          </div>
        </div>

        {/* Profession Select */}
        <div className="demographics-field">
          <label className="demographics-label">Main profession or education</label>
          <select
            className="demographics-select"
            value={formData.profession}
            onChange={handleProfessionChange}
          >
            <option value="">Select...</option>
            <option value="Student">Student</option>
            <option value="Employed">Employed</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Retired">Retired</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Fruits and Vegetables Radio Buttons */}
        <div className="demographics-field">
          <label className="demographics-label">Do you regularly consume fruits and vegetables?</label>
          <div className="demographics-radio-group">
            <button
              className={`demographics-radio-button ${formData.fruitsVegetables === 'Yes, every day' ? 'selected' : ''}`}
              onClick={() => handleFruitsVegetablesChange('Yes, every day')}
            >
              <span className={`demographics-radio-circle ${formData.fruitsVegetables === 'Yes, every day' ? 'selected' : ''}`}>
                {formData.fruitsVegetables === 'Yes, every day' && <span className="demographics-radio-dot"></span>}
              </span>
              <span className="demographics-radio-label">Yes, every day</span>
            </button>

            <button
              className={`demographics-radio-button ${formData.fruitsVegetables === 'A few times a week' ? 'selected' : ''}`}
              onClick={() => handleFruitsVegetablesChange('A few times a week')}
            >
              <span className={`demographics-radio-circle ${formData.fruitsVegetables === 'A few times a week' ? 'selected' : ''}`}>
                {formData.fruitsVegetables === 'A few times a week' && <span className="demographics-radio-dot"></span>}
              </span>
              <span className="demographics-radio-label">A few times a week</span>
            </button>

            <button
              className={`demographics-radio-button ${formData.fruitsVegetables === 'Rarely' ? 'selected' : ''}`}
              onClick={() => handleFruitsVegetablesChange('Rarely')}
            >
              <span className={`demographics-radio-circle ${formData.fruitsVegetables === 'Rarely' ? 'selected' : ''}`}>
                {formData.fruitsVegetables === 'Rarely' && <span className="demographics-radio-dot"></span>}
              </span>
              <span className="demographics-radio-label">Rarely</span>
            </button>
          </div>
        </div>

          {/* Error Message */}
          {submitError && (
            <div className="demographics-error-message">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="demographics-submit-button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
      <FooterSwitch />
    </div>
  );
}

export default DemographicsForm;
