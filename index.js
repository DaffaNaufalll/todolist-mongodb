import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import todoRoute from "./routes/todoRoute.js";

const app = express();
dotenv.config()

app.use(express.json()); // Built-in body-parser for parsing JSON
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(cookieParser()); // Enable cookie parsing

const CONNECTION_URL = process.env.CONNECTION_URL
const PORT = process.env.PORT

app.use("/service/todo", todoRoute)

mongoose.set("strictQuery", true)

// Start the server
mongoose.connect(CONNECTION_URL)
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message));