import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import axios from 'axios';
import "../css/menu.css";
import { useNavigate } from 'react-router-dom';

const Main = () => {
    const [tables, setTables] = useState([]);
    const [isAuthorized, setIsAuthorized] = useState(true); // Track authorization status
    const navigate = useNavigate();

    useEffect(() => {
        const staff = localStorage.getItem('staff');
        if (!staff) {
            alert('You must be a staff to enter!');
            setIsAuthorized(false);
            navigate('/');
        } else {
            axios.get("http://localhost:5000/tables")
                .then((res) => {
                    setTables(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching tables:", err);
                });
        }
    }, [navigate]);

    const tableitem = (tableId) => {
        console.log("Table ID:", tableId);
        navigate('/tableItem', { state: { tableId: tableId } });
    };

    // If unauthorized, prevent rendering
    if (!isAuthorized) return null;

    return (
        <div className="mainPart">
            <Dashboard />
            <div className="rightPart">
                {/* First 5 tables */}
                <div className="tables table1">
                    {tables.slice(0, 5).map((table) => (
                        <div
                            key={table.ID}
                            className={`table table${table.ID} ${table.AVAILABILITY === "Yes" ? "available" : "reserved"}`}
                            onClick={() => tableitem(table.ID)}
                        >
                            Table: {table.ID}
                        </div>
                    ))}
                </div>

                {/* Next 5 tables */}
                <div className="tables table2">
                    {tables.slice(5, 10).map((table) => (
                        <div
                            key={table.ID}
                            className={`table table${table.ID} ${table.AVAILABILITY === "Yes" ? "available" : "reserved"}`}
                            onClick={() => tableitem(table.ID)}
                        >
                            Table: {table.ID}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="tables">
                    <div className="available legend">Available</div>
                    <div className="reserved legend">Reserved</div>
                </div>
            </div>
        </div>
    );
};

export default Main;
