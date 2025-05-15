import React from 'react'
import Dashboard from './Dashboard'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
const Tables = () => {
    const [tables, setTables] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        
                const staff = localStorage.getItem('staff');
                if (!staff) {
                    alert('You must be a staff to enter!');
                    setIsAuthorized(false);
                    navigate('/');
                } 
            else{
        axios.get("http://localhost:5000/tables")
            .then(res => {
                setTables(res.data);
            })
            .catch(err => {
                console.error("Error fetching menu:", err);
            });
        }
    }, []);

    

    const handleEdit = (item) => {
        setSelectedItem(item); // Set the selected item
        navigate("/edit-table", { state: item }); // Navigate to EditItem page with item data
    };


    return <>
        <Dashboard></Dashboard>
        <div className="Table">
            <h3>Table Status</h3>
            <div className="menuTable">
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Availability</th>
                            <th>Booking Date</th>
                            <th>Booking Time</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ID}</td>
                                <td>{item.TABLENAME}</td>
                                <td>{item.AVAILABILITY}</td>
                                <td>{item.BOOKING_DATE}</td>
                                <td>{item.BOOKING_TIME}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>
}

export default Tables
