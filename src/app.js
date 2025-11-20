import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/error.middleware.js';
import userRoutes from './routes/user.routes.js'
import eventRoutes from './routes/event.routes.js'
import holdRoutes from './routes/hold.routes.js'

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
app.use('/api/v1/events', eventRoutes)
app.use('/api/v1/hold', holdRoutes)


app.use(errorHandler)
export { app }