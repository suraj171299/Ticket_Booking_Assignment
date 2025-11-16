// src/db/sequelize.js
import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';

const nodeEnv = process.env.NODE_ENV || 'development';
const config = dbConfig[nodeEnv];

if (!config) {
  throw new Error(`No DB config found for NODE_ENV=${nodeEnv}`);
}

if (!config.database || !config.username || !config.host) {
  console.error('DB CONFIG RESOLVED AS:', config);
  throw new Error(
    `Incomplete DB config for env=${nodeEnv}. Check ${nodeEnv.toUpperCase()}_DB_* in your .env`
  );
}

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
  }
);
