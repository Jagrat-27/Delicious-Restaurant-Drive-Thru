import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import jsPDF from 'jspdf';
import Navbar2 from './Navbar2';

const CartItems = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        const user = localStorage.getItem('user');
        const id = user ? JSON.parse(user).ID : null;

        if (!id) {
            console.error("User ID not found in localStorage");
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/cart/${id}`);
            setCartItems(res.data);
        } catch (err) {
            console.error("Error fetching cart items:", err);
        }
    };

    const handleIncrementCount = async (item) => {
        try {
            const res = await axios.post("http://localhost:5000/incrementcartitem", item);
            if (res.status === 200 || res.status === 201) {
                fetchCartItems();
            }
        } catch (err) {
            console.error("Error adding item:", err);
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to remove ${item.DISHNAME}?`)) {
            try {
                const res = await axios.post("http://localhost:5000/removecartitem", { ID: item.P_ID });
                if (res.status === 200) {
                    fetchCartItems();
                }
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    const handleDecrementCount = async (item) => {
        try {
            const res = await axios.post("http://localhost:5000/decrementcartitem", { ID: item.P_ID });
            if (res.status === 200) {
                fetchCartItems();
            }
        } catch (err) {
            console.error("Decrement error:", err);
        }
    };

    const generatePDFReceipt = (cartItems, totalAmount) => {
        const doc = new jsPDF();
        const user = JSON.parse(localStorage.getItem('user')) || { ID: "N/A", name: "Guest" };

        doc.setFontSize(18);
        doc.text("Delicious Restaurant", 70, 15);

        doc.setFontSize(12);
        doc.text(`Customer ID: ${user.ID}`, 14, 30);
        doc.text(`Customer Name: ${user.NAME || "Guest"}`, 14, 37);
        doc.text(`Date: ${new Date().toLocaleString()}`, 14, 44);

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

        cartItems.forEach((item) => {
            doc.text(`${item.P_ID}`, 14, y);
            doc.text(`${item.DISHNAME}`, 40, y);
            doc.text(`${item.COUNT_ITEMS}`, 100, y);
            doc.text(`${item.PRICE}`, 120, y);
            doc.text(`${item.COUNT_ITEMS * item.PRICE}`, 160, y);
            y += 8;
        });

        y += 5;
        doc.setFontSize(14);
        doc.text(`Grand Total: ₹${totalAmount}`, 14, y);

        const filename = `Receipt_User_${user.ID}_${Date.now()}.pdf`;
        doc.save(filename);
    };

    const proceedToPay = async () => {
        const confirmPayment = window.confirm("Are you sure you want to proceed with the payment?");
        if (!confirmPayment) return;

        try {
            const totalAmount = cartItems.reduce((total, item) => total + item.PRICE * item.COUNT_ITEMS, 0);

            const orderResponse = await axios.post('http://localhost:5000/createOrder', { amount: totalAmount });
            const order = orderResponse.data;

            if (!order || !order.id) throw new Error("Failed to create order");

            const options = {
                key: "rzp_test_s2VG2G2HwcOQd6",
                amount: order.amount,
                currency: "INR",
                name: "Delicious",
                description: "Payment for items",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const validationRes = await axios.post('http://localhost:5000/validate-payment', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (validationRes.data.success) {
                            // await Promise.all(cartItems.map(item =>
                            //     axios.post('http://localhost:5000/addtosalesfromcart', {item})
                            // ));
                            generatePDFReceipt(cartItems, totalAmount);
                            alert("Payment successful! Receipt downloaded.");
                            fetchCartItems();
                        } else {
                            throw new Error("Payment validation failed");
                        }
                    } catch (error) {
                        console.error("Payment validation error:", error);
                        alert("Payment validation failed!");
                    }
                },
                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Error processing payment:", error);
            alert("Payment failed! Try again.");
        }
    };

    return (
        <>
            {localStorage.getItem('user') != undefined ? <Navbar2 /> : <Navbar />}
            <div className="Table table3">
                <div className='card1'>
                    <h3>Cart Items</h3>
                    <div className="menuTable">
                        <table>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Price(Rs)</th>
                                    <th>Count</th>
                                    <th></th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <tr key={item.ID}>
                                            <td>{item.P_ID}</td>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>No items in the cart</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <strong>Total Amount: ₹{
                            cartItems.reduce((total, item) => total + item.PRICE * item.COUNT_ITEMS, 0)
                        }</strong>
                    </div>
                    {cartItems.length > 0 && (
                        <button type="button" className='btn btn-success' onClick={proceedToPay}>Proceed to Pay</button>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartItems;
