import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation to receive props
import axios from "axios";
import Dashboard from "./Dashboard";

const EditItem = () => {
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
        name: item.DISHNAME || "",
        type: item.DISHTYPE || "",
        price: item.PRICE || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`http://localhost:5000/updatemenu/${formData.id}`, formData)
            .then(() => {
                alert("Item updated successfully!");
                navigate("/menu"); // Redirect to menu page after update
            })
            .catch(err => console.error("Update error:", err));
    };

    return (
        <>
            <Dashboard />
            <div className="additem">
                <h3>Edit Item</h3>
                <form onSubmit={handleSubmit}>
                    <label>ID:</label>
                    <input type="text" name="id" value={formData.id} onChange={handleChange} disabled />

                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />

                    <label>Type:</label>
                    <input type="text" name="type" value={formData.type} onChange={handleChange} required />

                    <label>Price:</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required />

                    <input type="submit" value="Update Item" />
                </form>
            </div>
        </>
    );
};

export default EditItem;
