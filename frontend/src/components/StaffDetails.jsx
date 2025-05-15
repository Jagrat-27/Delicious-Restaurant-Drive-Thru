import React from 'react'
import Dashboard from './Dashboard'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
const MemberDetails = () => {
    const [staffMembers, setStaffMembers] = useState([]);
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

                
        axios.get("http://localhost:5000/staff")
            .then(res => {
                setStaffMembers(res.data);
            })
            .catch(err => {
                console.error("Error fetching menu:", err);
            });
        }
    }, []);

    function addstaff() {
        navigate('/addstaff');
    }

    const handleEdit = (item) => {
        setSelectedItem(item); // Set the selected item
        navigate("/editstaff", { state: item }); // Navigate to EditItem page with item data
    };

    const handleDelete = (item) => {
        if (window.confirm(`Are you sure you want to delete ${item.NAME}?`)) {
            axios.delete(`http://localhost:5000/deletestaff/${item.ID}`)
                .then(() => {
                    alert("Item deleted successfully!");
                    setStaffMembers(staffMembers.filter(menuItem => menuItem.ID !== item.ID)); // Update state after deletion
                    navigate('/staff')
                })
                .catch(err => console.error("Delete error:", err));
        }
    };

    return <>
        <Dashboard></Dashboard>
        <div className="Table">
            <h3>Staff Details</h3>
            <button onClick={addstaff} >+Add Item</button>
            <div className="menuTable">
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Position</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffMembers.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ID}</td>
                                <td>{item.NAME}</td>
                                <td>{item.EMAIL}</td>
                                <td>{item.POSITION}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleDelete(item)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>
}

export default MemberDetails
