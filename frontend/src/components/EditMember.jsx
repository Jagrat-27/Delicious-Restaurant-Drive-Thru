import React, { useState } from "react";
import {  useLocation,useNavigate } from "react-router-dom"; // Import useLocation to receive props
import axios from "axios";
import Dashboard from "./Dashboard";
import { useEffect } from "react";
const EditMember = () => {
    useEffect(()=>{
            const staff = localStorage.getItem('staff');
            if (!staff) {
                alert('You must be a staff to enter!');
                setIsAuthorized(false);
                navigate('/');
            } 
        })
    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state || {}; // Get item from navigation state

    const [formData, setFormData] = useState({
        id: item.ID || "",
        name: item.NAME || "",
        email: item.EMAIL || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`http://localhost:5000/updatemember/${formData.id}`, formData)
            .then(() => {
                alert("Member updated successfully!");
                setFormData({id:"",name:"",email:""});
                navigate("/members"); // Redirect to menu page after update

            })
            .catch(err => console.error("Update error:", err));
    };

    return (
        <>
            <Dashboard />
            <div className="additem">
                <h3>Edit Member</h3>
                <form onSubmit={handleSubmit}>
                    <label>ID:</label>
                    <input type="text" name="id" value={formData.id} onChange={handleChange} disabled />

                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />

                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />

                    <input type="submit" value="Update Member" />
                </form>
            </div>
        </>
    );
};

export default EditMember;
