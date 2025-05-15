import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import "../css/additem.css";
import { useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';

const AddMember = () => {
    useEffect(()=>{
            const staff = localStorage.getItem('staff');
            if (!staff) {
                alert('You must be a staff to enter!');
                setIsAuthorized(false);
                navigate('/');
            } 
        })
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/register", formData);

            if (res.status === 201) {
                alert("Member added successfully!");
                setFormData({ username: '', email: '', password: '' }); // Reset form
                navigate('/members')
            } else {
                alert("Failed to add item.");
            }
        } catch (err) {
            console.error("Error adding item:", err);
            alert("Server error. Try again later.");
        }
    };

    return (
        <>
            <Dashboard />
            <div className='additem'>
                <h3>Add Member Details</h3>
                <form onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input type="text" placeholder='xyz' name="username" value={formData.username} onChange={handleChange} required />

                    <label>Email:</label>
                    <input type="email" placeholder='abc@gmail.com' name="email" value={formData.email} onChange={handleChange} required />

                    <label>Password:</label>
                    <input type="password"  name="password"value={formData.password} onChange={handleChange} required />

                    <input type="submit" value="Add Member" />
                </form>
            </div>
        </>
    );
};

export default AddMember;
