import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [complaint, setComplaint] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Unable to load complaint.');

      setComplaint(data);
      setTitle(data.title);
      setCategory(data.category);
      setDescription(data.description);
    } catch (err) {
      setError('Server connection failed.');
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!title.trim() || !description.trim()) {
      return setError('Title and description are required.');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, category, description })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);

      setIsEditing(false);
      setMessage('Complaint updated successfully.');
      fetchDetails();
    } catch (err) {
      setError('Failed to update complaint.');
    }
  };

  const handleAdminStatus = async (newStatus) => {
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setMessage('Status updated.');
      fetchDetails();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!complaint) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h2>Complaint Details</h2>
      {message && <div className="success">{message}</div>}

      {!isEditing ? (
        <div>
          <p><strong>Title:</strong> {complaint.title}</p>
          <p><strong>Category:</strong> {complaint.category}</p>
          <p><strong>Status:</strong> {complaint.status}</p>
          <p><strong>Date Submitted:</strong> {new Date(complaint.createdAt).toLocaleString()}</p>
          {user.role === 'admin' && (
            <p>
              <strong>Student Info:</strong> {complaint.student?.name} ({complaint.student?.email})
            </p>
          )}
          <p><strong>Description:</strong></p>
          <p>{complaint.description}</p>

          {user.role === 'student' && complaint.status === 'Pending' && (
            <button onClick={() => setIsEditing(true)}>Edit Complaint</button>
          )}

          {user.role === 'admin' && (
            <div style={{ maxWidth: '250px', marginTop: '15px' }}>
              <label>Update Status</label>
              <select
                value={complaint.status}
                onChange={(e) => handleAdminStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          )}

          <div style={{ marginTop: '15px' }}>
            <button onClick={() => navigate(user.role === 'admin' ? '/admin' : '/student')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="form-box">
          <h3>Edit Complaint</h3>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

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

          <button type="submit">Save Changes</button>{' '}
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}