import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Dashboard from "./Dashboard";

const EditTable = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Optional chaining to avoid undefined errors
    const item = location.state;

    const [formData, setFormData] = useState({
        id: "",
        availability: "",
    });

    useEffect(() => {
        const staff = localStorage.getItem("staff");
        if (!staff) {
            alert("You must be a staff to enter!");
            navigate("/");
            return;
        }

        // If table data is missing, redirect back to table list
        if (!item?.ID || !item?.AVAILABILITY) {
            alert("No table selected for editing.");
            navigate("/tables");
            return;
        }

        // Set form data with values passed from location state
        setFormData({
            id: item.ID,
            availability: item.AVAILABILITY,
        });
    }, [item, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5000/updatetable/${formData.id}`, {
                availability: formData.availability,
            });

            if (res.status === 200) {
                alert("Table updated successfully!");
                // Slight delay for alert before navigation
                setTimeout(() => navigate("/tables"), 100);
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update table");
        }
    };

    return (
        <>
            <Dashboard />
            <div className="additem">
                <h3>Edit Table</h3>
                <form onSubmit={handleSubmit}>
                    <label>ID:</label>
                    <input type="text" name="id" value={formData.id} disabled />

                    <label>Availability:</label>
                    <select name="availability" value={formData.availability} onChange={handleChange} required>
                        <option value="">-- Select Availability --</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>

                    <input type="submit" value="Update Table" />
                </form>
            </div>
        </>
    );
};

export default EditTable;
