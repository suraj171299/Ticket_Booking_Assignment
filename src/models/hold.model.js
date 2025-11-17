export default (sequelize, DataTypes) => {
  const Hold = sequelize.define('Hold', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hold_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
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
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CONFIRMED'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tablename: 'holds',
    timestamps: true,
    underscored: true
  })

  return Hold
}