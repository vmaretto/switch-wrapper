import { useState } from 'react';

function DemographicsForm({ onComplete }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    profession: '',
    fruitsVegetables: ''
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.age || formData.age < 1) newErrors.age = true;
    if (!formData.gender) newErrors.gender = true;
    if (!formData.profession) newErrors.profession = true;
    if (!formData.fruitsVegetables) newErrors.fruitsVegetables = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Salva i dati in localStorage
      localStorage.setItem('userDemographics', JSON.stringify(formData));
      localStorage.setItem('demographicsCompleted', 'true');
      onComplete(formData);
    }
  };

  return (
    <div className="demographics-container">
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

        {/* Submit Button */}
        <button className="demographics-submit-button" onClick={handleSubmit}>
          Next
        </button>
      </div>
    </div>
  );
}

export default DemographicsForm;
