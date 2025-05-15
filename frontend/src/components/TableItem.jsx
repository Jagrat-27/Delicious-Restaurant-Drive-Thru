import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useLocation, useNavigate } from 'react-router-dom'; // ✅ added navigate
import "../css/menutable.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const TableItem = () => {
    const location = useLocation();
    const navigate = useNavigate(); // ✅ needed for redirect
    const tableId = location.state?.tableId;

    const [menuItems, setMenuItems] = useState([]);
    const [cardItems, setCardItems] = useState([]);

    useEffect(() => {
        const staff = localStorage.getItem('staff');
        if (!staff) {
            alert('You must be a staff to enter!');
            navigate('/');
            return;
        }

        if (!tableId) {
            console.warn("tableId is undefined, skipping API calls.");
            return;
        }

        fetchMenuItems();
        fetchCardItems();
    }, [tableId, navigate]);

    const fetchMenuItems = async () => {
        try {
            const res = await axios.get("http://localhost:5000/menu");
            setMenuItems(res.data);
        } catch (err) {
            console.error("Error fetching menu:", err);
        }
    };

    const fetchCardItems = async () => {
        if (!tableId) return;
        try {
            const res = await axios.get(`http://localhost:5000/card_table/${tableId}`);
            setCardItems(res.data);
        } catch (err) {
            console.error("Error fetching card table:", err);
        }
    };

    const handleAdd = async (data) => {
        if (!tableId) return;
        const item = {
            t_id: tableId,
            ID: data.ID,
            DISHNAME: data.DISHNAME,
            DISHTYPE: data.DISHTYPE,
            PRICE: data.PRICE,
        };

        try {
            const res = await axios.post("http://localhost:5000/addcarditem", item);
            if (res.status === 200 || res.status === 201) {
                fetchCardItems();
            }
        } catch (err) {
            console.error("Error adding item:", err);
        }
    };

    const handleIncrementCount = async (item) => {
        try {
            await axios.post("http://localhost:5000/incrementitem", {
                ID: item.ID,
                table_id: tableId
            });
            fetchCardItems();
        } catch (err) {
            console.error("Error incrementing item count:", err);
        }
    };

    const handleDecrementCount = async (item) => {
        if (!tableId) return;
        try {
            await axios.post("http://localhost:5000/decrementitem", {
                ID: item.ID,
                table_id: tableId
            });
            fetchCardItems();
        } catch (err) {
            console.error("Error decrementing item count:", err);
        }
    };

    const handleDelete = async (item) => {
        if (!tableId) return;
        if (window.confirm(`Are you sure you want to remove ${item.DISHNAME}?`)) {
            try {
                await axios.delete(`http://localhost:5000/removecarditem`, {
                    data: { ID: item.ID, table_id: tableId }
                });
                fetchCardItems();
            } catch (err) {
                console.error("Error removing item:", err);
            }
        }
    };

    const generatePDFReceipt = (cardItems, tableId, amount) => {
        const doc = new jsPDF();
        const user = JSON.parse(localStorage.getItem('staff')) || { ID: "N/A", name: "Unknown" };

        doc.setFontSize(18);
        doc.text("Delicious Restaurant", 70, 15);

        doc.setFontSize(12);
        doc.text(`Receipt for Table: ${tableId}`, 14, 30);
        doc.text(`Staff ID: ${user.ID}`, 14, 37);
        doc.text(`Staff Name: ${user.NAME}`, 14, 44);
        doc.text(`Date: ${new Date().toLocaleString()}`, 14, 51);

        // Table headers
        const startY = 60;
        let y = startY;
        doc.setFontSize(12);
        doc.text("Dish ID", 14, y);
        doc.text("Name", 40, y);
        doc.text("Qty", 100, y);
        doc.text("Unit Price (₹)", 120, y);
        doc.text("Total (₹)", 160, y);
        y += 8;

        cardItems.forEach((item) => {
            doc.text(`${item.ID}`, 14, y);
            doc.text(`${item.DISHNAME}`, 40, y);
            doc.text(`${item.COUNT_ITEMS}`, 100, y);
            doc.text(`${item.PRICE}`, 120, y);
            doc.text(`${item.COUNT_ITEMS * item.PRICE}`, 160, y);
            y += 8;
        });

        y += 5;
        doc.setFontSize(14);
        doc.text(`Grand Total: ₹${amount}`, 14, y);

        const filename = `Receipt_Table_${tableId}_${Date.now()}.pdf`;
        doc.save(filename); // ✅ Auto download
    };


    async function completeOrder() {
        const amount = cardItems.reduce((total, item) => total + item.PRICE * item.COUNT_ITEMS, 0);

        if (amount === 0) {
            alert("Cart is empty");
            return;
        }

        try {
            const { data: order } = await axios.post('http://localhost:5000/create-order', {
                amount: amount * 100
            });

            const options = {
                key: "rzp_test_s2VG2G2HwcOQd6",
                amount: order.amount,
                currency: "INR",
                name: "Delicious Checkout",
                description: "Complete your table order",
                order_id: order.id,
                handler: async function (response) {
                    const verifyRes = await axios.post("http://localhost:5000/validate-payment", {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verifyRes.data.success) {
                        // ✅ Save to sales
                        await Promise.all(cardItems.map(item =>
                            axios.post('http://localhost:5000/addtosales', { ...item, table_id: tableId })
                        ));

                        // ✅ Generate receipt before cart is cleared
                        generatePDFReceipt(cardItems, tableId, amount);

                        await fetchCardItems(); // clear cart
                        alert("Payment successful! Receipt downloaded.");
                    } else {
                        alert("Payment verification failed!");
                    }
                },
                prefill: {
                    name: "Customer",
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4CAF50"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Error in payment:", err);
            alert("Payment failed. Please try again.");
        }
    }

    return (
        <>
            <Dashboard />
            <div className="Table table3">
                <div>
                    <h3>Menu Items</h3>
                    <div className="menuTable">
                        <table>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Price(Rs)</th>
                                    <th>Add</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuItems.map((item) => (
                                    <tr key={item.ID}>
                                        <td>{item.ID}</td>
                                        <td>{item.DISHNAME}</td>
                                        <td>{item.PRICE}</td>
                                        <td>
                                            <button className="edit-btn" onClick={() => handleAdd(item)}>Add</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='card1'>
                    <h3>Card Items for Table {tableId}</h3>
                    <div className="menuTable">
                        <table>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Price(Rs)</th>
                                    <th>Count</th>
                                    <th>Actions</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cardItems.map((item) => (
                                    <tr key={item.ID}>
                                        <td>{item.ID}</td>
                                        <td>{item.DISHNAME}</td>
                                        <td>{item.PRICE}</td>
                                        <td>{item.COUNT_ITEMS}</td>
                                        <td>
                                            <button className="edit-btn add" onClick={() => handleIncrementCount(item)}>+</button>
                                            <button className="edit-btn sub" onClick={() => handleDecrementCount(item)}>-</button>
                                        </td>
                                        <td>
                                            <button className="edit-btn" onClick={() => handleDelete(item)}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <strong>Total Amount: ₹{
                            cardItems.reduce((total, item) => total + item.PRICE * item.COUNT_ITEMS, 0)
                        }</strong>
                    </div>
                    <button type="button" className="btn btn-success" onClick={completeOrder}>
                        Complete the Order
                    </button>
                </div>
            </div>
        </>
    );
};

export default TableItem;
