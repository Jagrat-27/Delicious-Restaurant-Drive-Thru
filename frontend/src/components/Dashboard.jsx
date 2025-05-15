import React from 'react';
import "../css/dashboard.css";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
const Dashboard = () => {
  const navigate = useNavigate();

  // Generic function to navigate
  const navigateTo = (path) => {
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem('staff');
    navigate('/');
  };

  // Safely retrieve staff details
  const staff = JSON.parse(localStorage.getItem('staff')) || {};

  return (
    <>
      <div className="dashboard">
        <span className="dashboardName">Delicious's Staff Panel</span>
      </div>
      <div className="leftPart">
        <div className="main">Main</div>
        <div className="others" onClick={() => navigateTo('/dashboard')}>Arrangement</div>
        <div className="others" onClick={() => navigateTo('/tables')}>Table</div>
        <div className="others" onClick={() => navigateTo('/menu')}>Menu</div>
        <div className="others" onClick={() => navigateTo('/members')}>Members</div>
        <div className="others" onClick={() => navigateTo('/staff')}>Staff</div>
        <div className="main">Profile</div>
        <div className="others" onClick={() => navigateTo('/sales')}>Statistics</div>
        <div className="others" onClick={logout}>Logout</div>
        <div className='loggedIn'>
          <p>ID: {staff.ID || "Not available"}</p>
          <p>Name: {staff.NAME || "Not available"}</p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
