import express from 'express';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

//Common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '16kb' }));


export { app }