import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import "../css/additem.css";
import { Navigate, useNavigate } from 'react-router-dom';

const AddItem = () => {
    useEffect(()=>{
        const staff = localStorage.getItem('staff');
        if (!staff) {
            alert('You must be a staff to enter!');
            setIsAuthorized(false);
            navigate('/');
        } 
    })
    const navigate=useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        price: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/addmenu", formData);

            if (res.status === 201) {
                alert("Item added successfully!");
                setFormData({ name: '', type: '', price: '' }); // Reset form
                navigate('/menu')
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
                <h3>Add Item</h3>
                <form onSubmit={handleSubmit}>

                    <label>Name:</label>
                    <input type="text" placeholder='Paneer' name='name' value={formData.name} onChange={handleChange} required />

                    <label>Type:</label>
                    <input type="text" placeholder='Punjabi' name='type' value={formData.type} onChange={handleChange} required />

                    <label>Price:</label>
                    <input type="number" placeholder='142' name='price' value={formData.price} onChange={handleChange} required />

                    <input type="submit" value="Add Item" />
                </form>
            </div>
        </>
    );
};

export default AddItem;
