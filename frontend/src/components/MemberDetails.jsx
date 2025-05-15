import React from 'react'
import Dashboard from './Dashboard'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
const MemberDetails = () => {
    const [members, setMembers] = useState([]);
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
        axios.get("http://localhost:5000/members")
            .then(res => {
                setMembers(res.data);
            })
            .catch(err => {
                console.error("Error fetching menu:", err);
            });
        }
    }, []);

    function addmember(){
        navigate('/addmember');
    }

    const handleEdit = (item) => {
        setSelectedItem(item); // Set the selected item
        navigate("/editmember", { state: item }); // Navigate to EditItem page with item data
    };

    const handleDelete = (item) => {
        if (window.confirm(`Are you sure you want to delete ${item.NAME}?`)) {
            axios.delete(`http://localhost:5000/deletemember/${item.ID}`)
                .then(() => {
                    alert("Item deleted successfully!");
                    setMembers(members.filter(menuItem => menuItem.ID !== item.ID)); // Update state after deletion
                    navigate('/members')
                })
                .catch(err => console.error("Delete error:", err));
        }
    };

  return <>
    <Dashboard></Dashboard>
      <div className="Table">
          <h3>Member Details</h3>
          <button onClick={addmember} >+Add Item</button>
          <div className="menuTable">
              <table>
                  <thead>
                      <tr>
                          <th>Id</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Edit</th>
                          <th>Delete</th>
                      </tr>
                  </thead>
                  <tbody>
                      {members.map((item, index) => (
                          <tr key={index}>
                              <td>{item.ID}</td>
                              <td>{item.NAME}</td>
                              <td>{item.EMAIL}</td>
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
