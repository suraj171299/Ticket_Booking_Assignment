require('dotenv').config({ path: './src/.env' });

const makeConfig = (prefix) => ({
  username: process.env[`${prefix}_DB_USERNAME`] || '',
  password: process.env[`${prefix}_DB_PASSWORD`] || '',
  database: process.env[`${prefix}_DB_NAME`] || '',
  host: process.env[`${prefix}_DB_HOST`] || '',
  port: process.env[`${prefix}_DB_PORT`] || 3306,
  dialect: 'mysql',
  logging: false,
});

module.exports = {
  development: makeConfig('DEV'),
  production: makeConfig('PROD'),
};