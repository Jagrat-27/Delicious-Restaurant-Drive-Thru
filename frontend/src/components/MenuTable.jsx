import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import "../css/menutable.css"
import { useNavigate } from 'react-router-dom';
import EditItem from './EditItem';
const MenuTable = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deletedItem, setDeletedItem] = useState(null); // Store the item being edited
    const navigate = useNavigate();

    useEffect(() => {
        
                const staff = localStorage.getItem('staff');
                if (!staff) {
                    alert('You must be a staff to enter!');
                    setIsAuthorized(false);
                    navigate('/');
                } 
            else{

           
        axios.get("http://localhost:5000/menu")
            .then(res => {
                setMenuItems(res.data);
            })
            .catch(err => {
                console.error("Error fetching menu:", err);
            });
        }
    }, []);

    function addItem(){
        navigate('/addItem');
    }

    const handleEdit = (item) => {
        setSelectedItem(item); // Set the selected item
        navigate("/edititem", { state: item }); // Navigate to EditItem page with item data
    };

    const handleDelete = (item) => {
        if (window.confirm(`Are you sure you want to delete ${item.DISHNAME}?`)) {
            axios.delete(`http://localhost:5000/deletemenu/${item.ID}`)
                .then(() => {
                    alert("Item deleted successfully!");
                    setMenuItems(menuItems.filter(menuItem => menuItem.ID !== item.ID)); // Update state after deletion
                })
                .catch(err => console.error("Delete error:", err));
        }
    };



    return <>
        <div>
            <Dashboard></Dashboard>
            <div className="Table">
                <h3>Menu Items</h3>
                <button onClick={addItem}>+Add Item</button>
                <div className="menuTable">
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Price(Rs)</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.ID}</td>
                                    <td>{item.DISHNAME}</td>
                                    <td>{item.PRICE}</td>
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
        </div>
    </>
};

export default MenuTable;

