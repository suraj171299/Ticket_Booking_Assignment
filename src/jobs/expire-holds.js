import cron from "node-cron";
import { Op } from "sequelize";
import { Hold } from '../models/index.js';
import logger from "../utils/logger.js";

export function scheduleExpireHolds() {
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const now = new Date()
      const [count] = await Hold.update(
        { status: 'EXPIRED' },
        {
          where: { status: 'ACTIVE', expires_at: { [Op.lte]: now } }
        }
      )
      if (count) logger.info(`Expired ${count} holds`)
    } catch (error) {
      logger.error('Error expiring holds:', error);
    }
  })
}

