require("dotenv").config();

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI2)
  
      console.log('MongoDB connected!!')
    } catch (err) {
      console.log('Failed to connect to MongoDB', err)
    }
}

connectDB();