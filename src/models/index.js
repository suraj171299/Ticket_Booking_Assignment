import { sequelize } from "../utils/database.js";
import { DataTypes } from "sequelize";
import defineUser from './user.model.js'

const User = defineUser(sequelize, DataTypes)

export { sequelize, User }
export default { sequelize, User }