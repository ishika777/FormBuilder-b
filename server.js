import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import connectDb from './utils/db.js';

import userRouter from './routes/user.routes.js';
import formRouter from './routes/form.routes.js';

const app = express();
const port = process.env.PORT || 8080;

const corsOption = {
    origin: process.env.FRONTEND_URL,
    credentials: true
};

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));

app.use('/api/user', userRouter);
app.use('/api/form', formRouter);

app.listen(port, () => {
    connectDb();
    console.log(`Server running on port ${port}`);
});
