import dotenv from 'dotenv';
dotenv.config({
  path: './src/.env',
})

const makeConfig = (prefix) => ({
  username: process.env[`${prefix}_DB_USERNAME`] || '',
  password: process.env[`${prefix}_DB_PASSWORD`] || '',
  database: process.env[`${prefix}_DB_NAME`] || '',
  host: process.env[`${prefix}_DB_HOST`] || '',
  port: process.env[`${prefix}_DB_PORT`],
  dialect: 'mysql',
  logging: false,
});

const dbConfig = {
  development: makeConfig('DEV'),
  production: makeConfig('PROD'),
};

export default dbConfig;
