import { Router } from "express";
import { createEventHandler, deleteEventHandler, getAllEventsHandler, getEventAvailabilityHandler, getEventByIdHandler, updateEventHandler } from "../controllers/event.controller.js";
import validate from "../middlewares/validation.middleware.js";
import { createEventSchema, updateEventSchema } from "../utils/input-schema.js";
import { authenticateUser, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { createLimiter } from "../middlewares/rate-limit.middleware.js";

const router = Router();

const availabilityLimiter = createLimiter({
  keyPrefix: 'availability',
  points: 60,
  duration: 60
});


//PUBLIC ROUTES
router.route('/all-events').get(getAllEventsHandler)
router.route('/:id').get(getEventByIdHandler);
router.route('/:id/availability').get(availabilityLimiter, getEventAvailabilityHandler);

//ADMIN ROUTESs
router.route('/create').post(authenticateUser, authorizeAdmin, validate(createEventSchema), createEventHandler);
router.route('/:id/update').patch(authenticateUser, authorizeAdmin, validate(updateEventSchema), updateEventHandler);
router.route('/:id/delete').delete(authenticateUser, authorizeAdmin, deleteEventHandler);

export default router;