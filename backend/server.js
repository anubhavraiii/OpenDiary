import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './lib/db.js';
import adminRouter from './routes/admin.routes.js';
import blogRouter from './routes/blog.route.js';
import subscriberRouter from './routes/subscriber.route.js';

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200 
};

await connectDB();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json())

// Routes
app.get('/', (req, res)=> res.send("API is Working"))
app.use('/api/admin', adminRouter)
app.use('/api/blog', blogRouter)
app.use('/api', subscriberRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log('👍 Server is running on port ' + PORT)
})

export default app;