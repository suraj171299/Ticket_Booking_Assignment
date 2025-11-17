export default (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('CONFIRMED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'CONFIRMED'
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tablename: 'bookings',
    timestamps: true,
    underscored: true
  })
  return Booking
}