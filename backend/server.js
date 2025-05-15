const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const e = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// MySQL Connection Pool
const db = mysql.createPool({
    host: "",
    user: "",
    password: "", 
    database: "",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Register Route
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (results.length > 0) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.PASSWORD);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Optional: JWT generation
        const token = jwt.sign({ id: user.ID }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful", user /*, token */ });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// STAFF Register Route
app.post("/staffregister", async (req, res) => {
    try {
        const { name, email, password, position } = req.body;

        // Check if staff already exists
        const [results] = await db.query("SELECT * FROM STAFF WHERE email = ?", [email]);
        if (results.length > 0) return res.status(400).json({ message: "Staff already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO STAFF (name, email, password, position) VALUES (?, ?, ?, ?)", 
            [name, email, hashedPassword, position]);

        res.status(201).json({ message: "Staff registered successfully" });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// STAFF Login Route
app.post('/stafflogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.query("SELECT * FROM STAFF WHERE email = ?", [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const staff = results[0];

        const isMatch = await bcrypt.compare(password, staff.PASSWORD);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Optional: JWT token
        const token = jwt.sign({ id: staff.ID, position: staff.POSITION }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful", staff /*, token */ });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Getting tables
app.get('/tables', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM TABLES");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Server error while fetching tables" });
    }
});

// checking availability
app.post("/available-tables", async (req, res) => {
    const { date, time } = req.body;

    try {
        const [rows] = await db.query(
            `SELECT ID 
             FROM tables 
             WHERE AVAILABILITY = 'Yes' 
             AND (BOOKING_DATE != ? OR BOOKING_TIME != ? OR BOOKING_DATE IS NULL)`,
            [date, time]
        );

        const availableTables = rows.map(row => row.ID);
        res.status(200).json({ availableTables });

    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.put('/updatetable/:id', async (req, res) => {
    const tableId = req.params.id;
    const { availability } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE tables SET AVAILABILITY = ?, BOOKING_DATE = ?, BOOKING_TIME = ?, CUSTOMER_NAME = ? WHERE ID = ?`,
            [availability, null, null, null, tableId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Table not found" });
        }

        res.status(200).json({ message: "Table updated successfully" });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Database update failed" });
    }
});

// Reservation
app.post('/reservation', async (req, res) => {
    const { name, date, time, tableId } = req.body;

    // Validate required fields
    if (!name || !date || !time || !tableId) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if a record exists for this table ID
        const [existing] = await db.execute(
            "SELECT * FROM tables WHERE ID = ?",
            [tableId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Table not found." });
        }

        // Optional: Check if it's already reserved at that time
        const [conflict] = await db.execute(
            "SELECT * FROM tables WHERE ID = ? AND BOOKING_DATE = ? AND BOOKING_TIME = ?",
            [tableId, date, time]
        );

        if (conflict.length > 0) {
            return res.status(400).json({ message: "Table is already reserved at the selected time." });
        }

        // Update the reservation details
        await db.execute(
            `UPDATE tables 
             SET customer_name = ?, BOOKING_DATE = ?, BOOKING_TIME = ?, AVAILABILITY = ?
             WHERE ID = ?`,
            [name, date, time, 'NO', tableId]
        );

        res.status(200).json({ message: "Reservation updated successfully!" });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


// getting menu
app.get("/menu", async (req, res) => {
    const sql = "SELECT * FROM menu";

    try {
        const [rows] = await db.query(sql); // Destructure to get rows from result
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching menu:", err);
        res.status(500).json({ error: "Failed to fetch menu items" });
    }
});



// Adding menu
app.post("/addmenu", async (req, res) => {
    try {
        const { name, type, price } = req.body;

        await db.query("INSERT INTO menu ( DISHNAME, DISHTYPE, PRICE) VALUES ( ?, ?, ?)", 
                       [ name, type, price]);

        res.status(201).json({ message: "Item added successfully" });
    } catch (error) {
        console.error("Add Item error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Updating menu
app.put("/updatemenu/:id", async (req, res) => {
    try {
        const { name, type, price } = req.body;
        const { id } = req.params;

        await db.query(
            "UPDATE menu SET DISHNAME = ?, DISHTYPE = ?, PRICE = ? WHERE ID = ?",
            [name, type, price, id]
        );

        res.status(200).json({ message: "Item updated successfully!" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Server error while updating item" });
    }
});


// Deleting menu
app.delete("/deletemenu/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query("DELETE FROM menu WHERE ID = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item deleted successfully!" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Server error while deleting item" });
    }
});


// Getting members
app.get('/members', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM users");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Server error while fetching tables" });
    }
});


// deleting members
app.delete("/deletemember/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query("DELETE FROM users WHERE ID = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item deleted successfully!" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Server error while deleting item" });
    }
});


// updating members
app.put("/updatemember/:id", async (req, res) => {
    try {
        const { name, email } = req.body;
        const { id } = req.params;

        await db.query(
            "UPDATE users SET NAME = ?, EMAIL = ? WHERE ID = ?",
            [name, email, id]
        );

        res.status(200).json({ message: "Item updated successfully!" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Server error while updating item" });
    }
});


// getting staff
app.get('/staff', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM staff");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Server error while fetching tables" });
    }
});



// deleting staff
app.delete("/deletestaff/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query("DELETE FROM staff WHERE ID = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item deleted successfully!" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Server error while deleting item" });
    }
});


// updating staff
app.put("/updatestaff/:id", async (req, res) => {
    try {
        const { name, email,position} = req.body;
        const { id } = req.params;

        await db.query(
            "UPDATE staff SET NAME = ?, EMAIL = ? , POSITION = ? WHERE ID = ?",
            [name, email,position, id]
        );

        res.status(200).json({ message: "Item updated successfully!" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Server error while updating item" });
    }
});


// Getting card-table item
app.get("/card_table/:t_id", async (req, res) => {
    const { t_id } = req.params;
    try {
        const [results] = await db.query("SELECT * FROM card_table WHERE table_id = ?", [t_id]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching table items:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ✅ API to add/update an item in the card_table
app.post("/addcarditem", async (req, res) => {
    const { t_id, ID, DISHNAME, DISHTYPE, PRICE } = req.body;
    console.log("Received Data:", req.body);

    if (!t_id || !ID || !DISHNAME || !DISHTYPE || !PRICE) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const [results] = await db.query("SELECT COUNT_ITEMS FROM card_table WHERE ID = ? AND table_id = ?", [ID, t_id]);
        
        if (results.length > 0) {
            // If item exists, update COUNT_ITEMS
            const newCount = results[0].COUNT_ITEMS + 1;
            await db.query("UPDATE card_table SET COUNT_ITEMS = ? WHERE ID = ? AND table_id = ?", [newCount, ID, t_id]);
            console.log("Item count updated successfully!");
            return res.status(200).json({ message: "Item count updated!" });
        } else {
            // If item does not exist, insert new item with COUNT_ITEMS = 1
            console.log("Item not found, inserting new record");
            await db.query("INSERT IGNORE INTO card_table (table_id, ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS) VALUES (?, ?, ?, ?, ?, 1)", 
                [t_id, ID, DISHNAME, DISHTYPE, PRICE]);
            console.log("Item inserted successfully");
            return res.status(201).json({ message: "Item added successfully!" });
        }
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});


app.delete('/removecarditem', async (req, res) => {
    const { ID,table_id } = req.body;

    if (!ID) {
        return res.status(400).json({ error: "ID is required." });
    }
    try {
                // Delete item if count is 0 or less
                await db.query("DELETE FROM card_table WHERE ID = ? and TABLE_ID=?", [ID,table_id]);
                console.log("Item removed from the card.");
                return res.status(200).json({ message: "Item removed successfully!" });   
         
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});



app.post('/incrementitem', async (req, res) => {
    const { ID,table_id} = req.body;
    console.log("Received Data:", req.body);  // Debugging: Log received request body

    if (!ID ) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Check if item already exists in card_table
        const [results] = await db.query("SELECT COUNT_ITEMS FROM card_table WHERE ID = ? and TABLE_ID=?", [ID,table_id]);
        console.log("Check Query Results:", results);  // Debugging: Log query result

        if (results.length > 0) {
            // If item exists, update COUNT_ITEMS
            const newCount = results[0].COUNT_ITEMS + 1;
            await db.query("UPDATE card_table SET COUNT_ITEMS = ? WHERE ID = ? and TABLE_ID=?", [newCount, ID,table_id]);
            console.log("Item count updated successfully!");  // Debugging
            return res.status(200).json({ message: "Item count updated!" });
        } else {
            // If item does not exist, insert new item with COUNT_ITEMS = 1
            console.log("Item not found, inserting new record");  // Debugging
            await db.query("INSERT INTO card_table (ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS) VALUES (?, ?, ?, ?, 1)", [ID, DISHNAME, DISHTYPE, PRICE]);
            console.log("Item inserted successfully");  // Debugging
            return res.status(201).json({ message: "Item added successfully!" });
        }
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});


app.post('/decrementitem', async (req, res) => {
    const { ID ,table_id} = req.body;

    if (!ID) {
        return res.status(400).json({ error: "ID is required." });
    }

    try {
        // Check if item exists
        const [results] = await db.query("SELECT COUNT_ITEMS FROM card_table WHERE ID = ? and TABLE_ID=?", [ID,table_id]);
        
        if (results.length > 0) {
            let newCount = results[0].COUNT_ITEMS - 1;

            if (newCount > 0) {
                // Update item count if greater than 0
                await db.query("UPDATE card_table SET COUNT_ITEMS = ? WHERE ID = ? and TABLE_ID=?", [newCount, ID,table_id]);
                console.log("Item count decreased.");
                return res.status(200).json({ message: "Item count decreased!" });
            } else {
                // Delete item if count is 0 or less
                await db.query("DELETE FROM card_table WHERE ID = ? and TABLE_ID=?", [ID,table_id]);
                console.log("Item removed from the card.");
                return res.status(200).json({ message: "Item removed successfully!" });
            }
        } else {
            return res.status(404).json({ error: "Item not found in card_table" });
        }
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});


// getting cart items
app.get('/cart/:id', async (req, res) => {
    try {
        const id=req.params.id;
        const [results] = await db.query("SELECT * FROM cart_items where C_ID =?",id);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Server error while fetching tables" });
    }
});

// adding cart items
app.post('/addcartitem', async (req, res) => {
    const { c_id, p_id, name, price, type } = req.body;
    console.log("Received Data:", req.body);  // Debugging: Log received request body

    if (!c_id || !p_id || !type || !price ||!name) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Check if item already exists in card_table
        const [results] = await db.query("SELECT COUNT_ITEMS FROM cart_items WHERE P_ID = ?", [p_id]);
        console.log("Check Query Results:", results);  // Debugging: Log query result

        if (results.length > 0) {
            // If item exists, update COUNT_ITEMS
            const newCount = results[0].COUNT_ITEMS + 1;
            await db.query("UPDATE cart_items SET COUNT_ITEMS = ? WHERE P_ID = ?", [newCount, p_id]);
            console.log("Item count updated successfully!");  // Debugging
            return res.status(200).json({ message: "Item count updated!" });
        } else {
            // If item does not exist, insert new item with COUNT_ITEMS = 1
            console.log("Item not found, inserting new record");  // Debugging
            await db.query("INSERT INTO cart_items (C_ID,P_ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS) VALUES (?, ?, ?, ?,?, 1)", [c_id,p_id, name, type, price]);
            console.log("Item inserted successfully");  // Debugging
            return res.status(201).json({ message: "Item added successfully!" });
        }
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// REOVING CART ITEMS
app.post('/removecartitem', async (req, res) => {
    const { ID } = req.body;

    if (!ID) {
        return res.status(400).json({ error: "ID is required." });
    }

    try {
        // Check if item exists
        const [results] = await db.query("SELECT COUNT_ITEMS FROM cart_items WHERE P_ID = ?", [ID]);
        
        if (results.length > 0) {
                // Delete item if count is 0 or less
                await db.query("DELETE FROM cart_items WHERE P_ID = ?", [ID]);
                console.log("Item removed from the card.");
                return res.status(200).json({ message: "Item removed successfully!" });
            
        } else {
            return res.status(404).json({ error: "Item not found in card_table" });
        }
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});


// incrementing cart items
app.post('/incrementcartitem', async (req, res) => {
    const { C_ID,P_ID,DISHNAME,DISHTYPE,PRICE,COUNT_ITEMS} = req.body;
    console.log("Received Data:", req.body);  // Debugging: Log received request body

    if (!C_ID || !P_ID || !DISHTYPE || !PRICE ||!DISHNAME || !COUNT_ITEMS) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Check if item already exists in card_table
        const [results] = await db.query("SELECT COUNT_ITEMS FROM cart_items WHERE P_ID = ?", [P_ID]);
        console.log("Check Query Results:", results);  // Debugging: Log query result

        if (results.length > 0) {
            // If item exists, update COUNT_ITEMS
            const newCount = results[0].COUNT_ITEMS + 1;
            await db.query("UPDATE cart_items SET COUNT_ITEMS = ? WHERE P_ID = ?", [newCount, P_ID]);
            console.log("Item count updated successfully!");  // Debugging
            return res.status(200).json({ message: "Item count updated!" });
        } else {
            // If item does not exist, insert new item with COUNT_ITEMS = 1
            console.log("Item not found, inserting new record");  // Debugging
            await db.query("INSERT INTO cart_items (C_ID,P_ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS) VALUES (?, ?, ?, ?,?, 1)", [C_ID,P_ID, DISHNAME, DISHTYPE, PRICE]);
            console.log("Item inserted successfully");  // Debugging
            return res.status(201).json({ message: "Item added successfully!" });
        }
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// decrementing cart item
app.post('/decrementcartitem', async (req, res) => {
    const { ID } = req.body;

    if (!ID) {
        return res.status(400).json({ error: "ID is required." });
    }

    try {
        // Check if item exists
        const [results] = await db.query("SELECT COUNT_ITEMS FROM cart_items WHERE P_ID = ?", [ID]);
        
        if (results.length > 0) {
            let newCount = results[0].COUNT_ITEMS - 1;

            if (newCount > 0) {
                // Update item count if greater than 0
                await db.query("UPDATE cart_items SET COUNT_ITEMS = ? WHERE P_ID = ?", [newCount, ID]);
                console.log("Item count decreased.");
                return res.status(200).json({ message: "Item count decreased!" });
            } else {
                // Delete item if count is 0 or less
                await db.query("DELETE FROM cart_items WHERE P_ID = ?", [ID]);
                console.log("Item removed from the card.");
                return res.status(200).json({ message: "Item removed successfully!" });
            }
        } else {
            return res.status(404).json({ error: "Item not found in card_table" });
        }
    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

app.post('/addtosales', async (req, res) => {
    const { table_id, ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS } = req.body;

    try {
        // Check if the ID already exists in the sales table
        const [existingItem] = await db.query("SELECT COUNT_ITEMS FROM sales WHERE ID = ?", [ID]);

        if (existingItem.length > 0) {
            // ID exists, update COUNT_ITEMS
            await db.query("UPDATE sales SET COUNT_ITEMS = COUNT_ITEMS + ? WHERE ID = ?", [COUNT_ITEMS, ID]);
            console.log(`Updated COUNT_ITEMS for ID: ${ID}`);
        } else {
            // ID does not exist, insert new record
            await db.query(
                "INSERT INTO sales (ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS) VALUES (?, ?, ?, ?, ?)", 
                [ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS]
            );
            console.log("Item inserted successfully");
        }

        // Delete item from card_table only after successfully adding to sales
        await db.query("DELETE FROM card_table WHERE ID = ? AND TABLE_ID = ?", [ID, table_id]);
        console.log(`Deleted item from card_table: ID=${ID}, TABLE_ID=${table_id}`);

        return res.status(200).json({ message: "Item processed successfully!" });

    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

app.post('/addtosalesfromcart', async (req, res) => {
    const { C_ID, P_ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS } = req.body;

    try {
        // Check if the ID already exists in the sales table
        const [existingItem] = await db.query("SELECT COUNT_ITEMS FROM sales WHERE ID = ?", [P_ID]);

        if (existingItem.length > 0) {
            // ID exists, update COUNT_ITEMS
            await db.query("UPDATE sales SET COUNT_ITEMS = COUNT_ITEMS + ? WHERE ID = ?", [COUNT_ITEMS, P_ID]);
            console.log(`Updated COUNT_ITEMS for ID: ${P_ID}`);
        } else {
            // ID does not exist, insert new record
            await db.query(
                "INSERT INTO sales (ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS) VALUES (?, ?, ?, ?, ?)", 
                [P_ID, DISHNAME, DISHTYPE, PRICE, COUNT_ITEMS]
            );
            console.log("Item inserted successfully");
        }

        // Delete item from card_table only after successfully adding to sales
        await db.query("DELETE FROM cart_items WHERE P_ID = ? AND C_ID = ?", [P_ID, C_ID]);
        console.log(`Deleted item from card_table: ID=${P_ID}, TABLE_ID=${C_ID}`);

        return res.status(200).json({ message: "Item processed successfully!" });

    } catch (err) {
        console.error("Error processing the request:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

app.get('/sales', async (req, res) => {
    try {
        const [salesData] = await db.query(`
            SELECT ID, DISHNAME, DISHTYPE, PRICE, SUM(COUNT_ITEMS) AS TOTAL_COUNT 
            FROM sales 
            GROUP BY ID, DISHNAME, DISHTYPE, PRICE
            ORDER BY ID ASC
        `);

        return res.status(200).json(salesData);

    } catch (err) {
        console.error("Error fetching sales data:", err);
        return res.status(500).json({ error: "Database error" });
    }
});


require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/createOrder', async (req, res) => {
    console.log("Razorpay key:", process.env.RAZORPAY_KEY_ID);
console.log("Razorpay secret:", process.env.RAZORPAY_KEY_SECRET);

    const { amount } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt#${Math.floor(Math.random() * 1000000)}`,
        });
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        const order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: "order_rcptid_" + Date.now(),
            payment_capture: 1
        });

        res.json(order);
    } catch (err) {
        console.error("Order creation failed", err);
        res.status(500).send("Server error");
    }
});

const crypto = require("crypto");

app.post('/validate-payment', async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification parameters'
            });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const payment = await razorpay.payments.fetch(razorpay_payment_id);

            if (payment.status === 'captured') {
                res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    orderId: razorpay_order_id
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: `Payment not captured (status: ${payment.status})`
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
    } catch (error) {
        console.error('Payment validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during payment validation',
            error: error.message
        });
    }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
