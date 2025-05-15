import React, { useState } from 'react';
import "../css/reservation.css";
import Navbar from './Navbar';
import axios from 'axios';
import jsPDF from 'jspdf';
import Navbar2 from './Navbar2';

const Reservation = () => {
    const [form, setForm] = useState({
        name: '',
        date: '',
        time: '',
        tableId: '',
    });

    const [availableTables, setAvailableTables] = useState([]);
    const [showReservation, setShowReservation] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const searchDate = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/available-tables', {
                date: form.date,
                time: form.time,
            });

            if (response.status === 200) {
                const { availableTables } = response.data;
                setAvailableTables(availableTables);
                setShowReservation(true);
                form.tableId = ''; // reset previous selection
            }
        } catch (error) {
            console.error("Error fetching available tables:", error);
            alert("Failed to fetch available tables.");
        }
    };

    const generateReservationReceipt = (reservationData) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Delicious Restaurant", 70, 15);

        doc.setFontSize(14);
        doc.text("Reservation Receipt", 80, 25);

        doc.setFontSize(12);
        const yStart = 40;
        let y = yStart;

        doc.text(`Customer Name: ${reservationData.name}`, 20, y);
        y += 10;
        doc.text(`Date: ${reservationData.date}`, 20, y);
        y += 10;
        doc.text(`Time: ${reservationData.time}`, 20, y);
        y += 10;
        doc.text(`Table ID: ${reservationData.tableId}`, 20, y);
        y += 20;

        doc.text("Thank you for your reservation!", 20, y);

        const filename = `Reservation_${reservationData.name}_${Date.now()}.pdf`;
        doc.save(filename);
    };

    const makeReservation = async () => {
        try {
            const response = await axios.post('http://localhost:5000/reservation', form);

            if (response.status === 200) {
                alert("Reservation successful!");

                // Generate and download the receipt
                generateReservationReceipt(form);

                // Reset form
                setForm({
                    name: '',
                    date: '',
                    time: '',
                    tableId: ''
                });
                setAvailableTables([]);
                setShowReservation(false);
            }
        } catch (error) {
            console.error("Reservation error:", error);
            alert("Reservation failed. Please try again.");
        }
    };

    return (
        <>
            {localStorage.getItem('user') != undefined ? <Navbar2 /> : <Navbar />}
            <div className="reserveName">Reserve Your Table</div>
            <div className='reserveContainer'>
                <div className="reserveLeft">
                    <form onSubmit={searchDate}>
                        <div className="searchDate">Search Date and Time</div>
                        <label>Select Date</label>
                        <input type="date" name="date" value={form.date} onChange={handleChange} required />
                        <label>Select Time</label>
                        <input type="time" name="time" value={form.time} onChange={handleChange} required />
                        <input id="btn" type="submit" value="Search Available Tables" />
                    </form>
                </div>

                <div className="reserveRight">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="searchDate">Make Reservation</div>
                        <label>Customer Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required />

                        <label>Reservation Date</label>
                        <input type="date" name="date" value={form.date} onChange={handleChange} required />
                        <input type="time" name="time" value={form.time} onChange={handleChange} required />

                        <label>Select Table</label>
                        <select name="tableId" value={form.tableId} onChange={handleChange} required>
                            <option value="">-- Select Table --</option>
                            {availableTables.map((id) => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>

                        {showReservation && (
                            <input
                                id="makeReservationBtn"
                                type="button"
                                value="Make Reservation"
                                onClick={makeReservation}
                            />
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default Reservation;
