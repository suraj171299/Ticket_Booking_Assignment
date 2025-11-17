import { sequelize } from "../utils/database.js";
import { DataTypes } from "sequelize";
import defineUser from './user.model.js'
import defineEvent from './event.model.js'
import defineBooking from './booking.model.js'
import defineHold from './hold.model.js'


const User = defineUser(sequelize, DataTypes)
const Event = defineEvent(sequelize, DataTypes)
const Booking = defineBooking(sequelize, DataTypes)
const Hold = defineHold(sequelize, DataTypes)

Event.hasMany(Hold, { foreignKey: 'event_id', as: 'holds', onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true, constraints: true })
Hold.belongsTo(Event, { foreignKey: 'event_id', as: 'event', onDelete: 'CASCADE', onUpdate: 'CASCADE', constraints: true })

Event.hasMany(Booking, {
  foreignKey: 'event_id', as: 'bookings', onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  constraints: true
})
Booking.belongsTo(Event, { foreignKey: 'event_id', as: 'event', onDelete: 'CASCADE', onUpdate: 'CASCADE', constraints: true })

User.hasMany(Hold, { foreignKey: 'user_id', as: 'holds', onDelete: 'SET NULL', onUpdate: 'CASCADE', constraints: true })
Hold.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL', onUpdate: 'CASCADE', constraints: true })

User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings', onDelete: 'SET NULL', onUpdate: 'CASCADE', constraints: true })
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL', onUpdate: 'CASCADE', constraints: true })

export { sequelize, User, Event, Booking, Hold }
export default { sequelize, User, Event, Booking, Hold }