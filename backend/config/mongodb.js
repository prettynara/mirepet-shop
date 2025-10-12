import mongoose from "mongoose";

const connectDB = async () => {

    console.log("🔗 Connecting to:", process.env.MONGODB_URI);

    mongoose.connection.on('connected', () => {
        console.log("DB Connected");
    })

    await mongoose.connect(`${process.env.MONGODB_URI}/mirepet-shop`)

}

export default connectDB;
