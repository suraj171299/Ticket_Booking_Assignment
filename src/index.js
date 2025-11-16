import { app } from './app.js'
import { sequelize } from './utils/database.js';
import dotenv from 'dotenv';
dotenv.config({
  path: './src/.env'
});

const PORT = process.env.PORT

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    })
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer()