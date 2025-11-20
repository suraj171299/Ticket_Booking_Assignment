import morgan from 'morgan';
import { app } from './app.js'
import { sequelize } from './utils/database.js';
import dotenv from 'dotenv';
import fs from 'fs'
import logger from './utils/logger.js';
import { scheduleExpireHolds } from './jobs/expire-holds.js';
dotenv.config({
  path: './src/.env'
});

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

if (process.env.NODE_ENV === 'production') {
  const accessLogStream = fs.createWriteStream(
    path.join('logs', 'access.log'),
    { flags: 'a' }
  )
  app.use(morgan('combined', { stream: accessLogStream }))
} else {
  app.use(morgan('dev'))
}

const PORT = process.env.PORT

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully.');

    scheduleExpireHolds()

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    })
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer()