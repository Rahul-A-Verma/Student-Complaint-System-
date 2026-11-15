import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const loadData = async () => {
    const [cRes, uRes] = await Promise.all([
      fetch(`${API_URL}/api/complaints`, { headers }),
      fetch(`${API_URL}/api/users`, { headers })
    ]);
    if (cRes.ok) setComplaints(await cRes.json());
    if (uRes.ok) setUsers(await uRes.json());
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/api/complaints/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status })
    });
    loadData();
  };

  const deleteComplaint = async (id) => {
    await fetch(`${API_URL}/api/complaints/${id}`, { method: 'DELETE', headers });
    loadData();
  };

  const updateRole = async (id, role) => {
    await fetch(`${API_URL}/api/users/${id}/role`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ role })
    });
    loadData();
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.student?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card"><strong>Total</strong><div>{complaints.length}</div></div>
        <div className="stat-card"><strong>Pending</strong><div>{complaints.filter(c => c.status === 'Pending').length}</div></div>
        <div className="stat-card"><strong>In Progress</strong><div>{complaints.filter(c => c.status === 'In Progress').length}</div></div>
        <div className="stat-card"><strong>Resolved</strong><div>{complaints.filter(c => c.status === 'Resolved').length}</div></div>
      </div>

      <div className="controls">
        <input placeholder="Search title or student..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <th>Student</th>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id}>
                <td>{c.student?.name}</td>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <select value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
                <td>
                  <Link to={`/complaints/${c._id}`}>Details</Link>{' | '}
                  <button className="btn-danger" onClick={() => deleteComplaint(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Users</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {u._id === currentUser?.id ? u.role : (
                    <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}>
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}