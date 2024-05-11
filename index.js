import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from "./config/connectDb.js"
import userRouter from './routes/userRoutes.js'

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json())
const DB_URL = process.env.DB_URL
app.set('secretKey', process.env.SECRET_KEY)
app.use('/user', userRouter)

//connect database
connectDB(DB_URL)

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log("listening to port:", PORT)
})