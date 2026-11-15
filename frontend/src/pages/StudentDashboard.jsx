import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Error loading complaints');
      setComplaints(data);
    } catch {
      setError('Server connection failed.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pending complaint?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/complaints/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      fetchComplaints();
    } catch {
      alert('Failed to delete complaint.');
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesTitle = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesTitle && matchesStatus && matchesCategory;
  });

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const progressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="container">
      <h2>My Complaints Dashboard</h2>
      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><strong>Total</strong><div>{totalCount}</div></div>
        <div className="stat-card"><strong>Pending</strong><div>{pendingCount}</div></div>
        <div className="stat-card"><strong>In Progress</strong><div>{progressCount}</div></div>
        <div className="stat-card"><strong>Resolved</strong><div>{resolvedCount}</div></div>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Academic">Academic</option>
          <option value="Hostel">Hostel</option>
          <option value="Library">Library</option>
          <option value="Internet">Internet</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5">No complaints found.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.status}</td>
                  <td>
                    <Link to={`/complaints/${c._id}`}>View / Edit</Link>
                    {c.status === 'Pending' && (
                      <>
                        {' | '}
                        <button className="btn-danger" onClick={() => handleDelete(c._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}