import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import authentication from './middlewares/auth.js';
import userRouter from './routes/user.js';
import connectCloudinary from './configs/cloudinary.js';
import educatorRouter from './routes/educator.js';
import protectEducator from './middlewares/protectEducator.js';
import courseRouter from './routes/course.js';
import { stripeWebHooks } from './controllers/webhook.js';

const app = express();
const PORT = process.env.PORT || 8000;

await connectDB();
await connectCloudinary();

// Middlewares
app.use(cors())

// Stripe webhook MUST be before express.json()
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebHooks);

app.use(express.urlencoded({ extended: true })); 
app.use(express.json())

// Routes
app.get('/', (req, res)=>{
    res.send("API Working!")
});
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/educator', authentication, protectEducator, educatorRouter);

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));

export default app;