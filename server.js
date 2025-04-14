const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");  // Import cors
const userRoutes = require("./userRoutes");
const User = require("./models/user.js");
const booked=require("./models/bookings.js");



dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());


app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("DB connection error:", err));



app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
    console.log(`Logged in by ${user}`)
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
  
    // Simple validation (check if username and password are provided)
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
  
    try {
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
      }
  
      // Create a new user (without password hashing)
      const newUser = new User({
        username,
        password,  // Save the password as it is (plaintext, not recommended for production)
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Return a success message with the user data (excluding password)
      res.status(201).json({
        message: "User registered successfully",
        user: { username: newUser.username, _id: newUser._id },

      });
      console.log(`New user Registered Successfully`,newUser)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed", details: error.message });
    }
  });
app.post("/turfs", async (req, res) => {
  const { turfName, rate } = req.body;

  try {
    // Create a new booking (or save to DB depending on your schema)
    const newBooking = new booked({
      turfName,
      rate,
      bookedAt: new Date(), // Optional: timestamp
    });

    await newBooking.save();

    res.status(201).json({ message: "Turf booked successfully", booking: newBooking });
    console.log(`Turf booked: ${turfName} at ₹${rate}/hr`);
  } catch (error) {
    res.status(500).json({ error: "Booking failed", details: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
