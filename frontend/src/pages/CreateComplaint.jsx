import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      return setError('Title and description cannot be empty.');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category })
      });

      const data = await res.json();
      if (!res.ok) {
        return setError(data.message || 'Failed to submit complaint.');
      }

      navigate('/student');
    } catch {
      setError('Server connection error.');
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Submit New Complaint</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Academic">Academic</option>
            <option value="Hostel">Hostel</option>
            <option value="Library">Library</option>
            <option value="Internet">Internet</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Other">Other</option>
          </select>

          <label>Description</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button type="submit">Submit Complaint</button>
        </form>
      </div>
    </div>
  );
}