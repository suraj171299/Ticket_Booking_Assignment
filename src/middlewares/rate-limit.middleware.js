import IORedis from 'ioredis'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import RateLimitError from '../errors/rate-limit-error.js'
import logger from '../utils/logger.js';

const redis = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  enableReadyCheck: true,

  retryStrategy(times) {
    const delay = Math.min(30000, times * 500);
    logger.warn(
      `Redis retry attempt ${times}, reconnecting in ${delay / 1000}s...`
    );
    return delay;
  },

  reconnectOnError(err) {
    logger.error({ err }, 'Redis connection error — attempting reconnect');
    return true;
  },
})

redis.on('connect', () => {
  logger.info('Redis: attempting connection...');
});

redis.on('ready', () => {
  logger.info('Redis: connection established successfully');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis: connection failed');
});

redis.on('close', () => {
  logger.warn('Redis: connection closed');
});

redis.on('reconnecting', (delay) => {
  logger.warn(`Redis: reconnecting in ${delay}ms...`);
});

export function createLimiter({ keyPrefix, points, duration }) {
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix,
    points,
    duration
  })

  return async (req, res, next) => {
    try {
      const userkey = req.user && req.user.id ? `user:${req.user.id}` : `ip:${req.ip}`

      await limiter.consume(userkey, 1)
      next()
    } catch (error) {
      const retrySecs = Math.ceil((error.msBeforeNext || 1000) / 1000)
      res.setHeader("Retry-After", String(retrySecs));
      throw new RateLimitError("Too many requests", "Rate limit exceeded", `Try again after ${retrySecs} seconds`)
    }
  }
}
