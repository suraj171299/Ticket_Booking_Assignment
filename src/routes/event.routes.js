import { Router } from "express";
import { createEventHandler, deleteEventHandler, getAllEventsHandler, getEventAvailabilityHandler, getEventByIdHandler, updateEventHandler } from "../controllers/event.controller.js";
import validate from "../middlewares/input-validation.js";
import { createEventSchema, updateEventSchema } from "../utils/input-schema.js";
import { authenticateUser, authorizeAdmin } from "../middlewares/authenticate-user.js";

const router = Router();

//PUBLIC ROUTES
router.route('/all-events').get(getAllEventsHandler)
router.route('/:id').get(getEventByIdHandler);
router.route('/availability/:id').get(getEventAvailabilityHandler);

//ADMIN ROUTESs
router.route('/create').post(authenticateUser, authorizeAdmin, validate(createEventSchema), createEventHandler);
router.route('/update/:id').patch(authenticateUser, authorizeAdmin, validate(updateEventSchema), updateEventHandler);
router.route('/delete/:id').delete(authenticateUser, authorizeAdmin, deleteEventHandler);

export default router;