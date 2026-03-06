import mongoose from "mongoose";
import {DB_URI} from "../../config/config.service.js";
const checkConnection = async () => {
  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`Connection to DB Successfully `);
  } catch (error) {
    console.log("Connection to DB failed", error);
  }
};

export default checkConnection;
