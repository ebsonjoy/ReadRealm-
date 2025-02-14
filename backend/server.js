import express from 'express';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
dotenv.config()
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import articleRoutes from './routes/articleRoutes.js'
import cors from 'cors'

const port = process.env.PORT || 5000

connectDB();
const app = express()
app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "https://read-realm-sepia.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static('public'))

app.use('/api/auth',authRoutes)
app.use('/api/article',articleRoutes)
app.get('/',(req,res)=>res.send('Server is ready'))

app.listen(port,()=>console.log(`Server is running on port ${port}`))
