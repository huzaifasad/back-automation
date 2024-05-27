



require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User=require('./shecma/models/user')

const app = express();
app.use(express.json());
app.use(cors(
    {
        origin:"*",
        methods:["POST","GET"],
        credentials:true
    }

));

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB:", err));

// Generate JWT
const generateToken = (userId, email) => {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Signup route
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    
    console.log('singup'+email)
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        user = new User({ name, email, password });  // Assuming no password hashing for demonstration purposes
        await user.save();
        const token = generateToken(user._id, email);
        res.status(201).json({ email: user.email, token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering new user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email)
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.password !== password) {  // Note: In real applications, use hashed password comparison
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = generateToken(user._id, email);
        res.json({ email: user.email, token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error during login');
    }
});

// Server listening
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
