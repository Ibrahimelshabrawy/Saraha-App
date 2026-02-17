import mongoose from "mongoose";
const checkConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/sarahaApp", {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("Connection to DB Successfully");
  } catch (error) {
    console.log("Connection to DB failed", error);
  }
};

export default checkConnection;
