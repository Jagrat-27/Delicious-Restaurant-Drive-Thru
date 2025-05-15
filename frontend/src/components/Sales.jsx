import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "../css/menutable.css";
const Sales = () => {
    const [saleItems, setSaleItems] = useState([]);

    useEffect(() => {
        
                const staff = localStorage.getItem('staff');
                if (!staff) {
                    alert('You must be a staff to enter!');
                    setIsAuthorized(false);
                    navigate('/');
                } 
           else{

           
        fetchSaleItems();
           }
    }, []);

    const fetchSaleItems = async () => {
        try {
            const res = await axios.get("http://localhost:5000/sales");
            setSaleItems(res.data);
        } catch (err) {
            console.error("Error fetching sales:", err);
        }
    };

    // Generate random colors for Pie Chart
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF5678"];

    return (
        <>
            <Dashboard />
            <div className="card1 Table table3">
                <div>
                    <h3>Total Sales</h3>
                    <div className="menuTable">
                        <table>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Price(Rs)</th>
                                    <th>Count</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saleItems.map((item) => (
                                    <tr key={item.ID}>
                                        <td>{item.ID}</td>
                                        <td>{item.DISHNAME}</td>
                                        <td>{item.PRICE}</td>
                                        <td>{item.TOTAL_COUNT}</td>
                                        <td>{item.PRICE * item.TOTAL_COUNT}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td></td>
                                    <td colSpan={5}>Total Amount: {
                                        saleItems.reduce((total, item) => total + item.PRICE * item.TOTAL_COUNT, 0)
                                    }</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                

                {/* Sales Bar Chart */}
                <div className="chart">
                    <h3>Sales Overview (Bar Chart)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={saleItems} margin={{ bottom: 50 }}>
                            <XAxis
                                dataKey="DISHNAME"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                                angle={-45}
                                textAnchor="end"
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="TOTAL_COUNT" name="Total Items Sold">
                                {saleItems.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </>
    );
};

export default Sales;
