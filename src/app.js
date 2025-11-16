import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/error-handler.js';
import userRoutes from './routes/user.routes.js'

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

//Common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/v1/users', userRoutes)


app.use(errorHandler)
export { app }