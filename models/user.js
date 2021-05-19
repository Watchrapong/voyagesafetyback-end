const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const user = sequelize.define(
  "User",
  {
    // attributes
    UserId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    FirstName: {
      type: Sequelize.STRING,
    },
    LastName: {
      type: Sequelize.STRING,
    },
    CitizenId: {
      type: Sequelize.STRING,
    },
    Email: {
      type: Sequelize.STRING,
    },
    Password: {
      type: Sequelize.STRING,
    },
    Telno: {
      type: Sequelize.STRING,
    },
    Status: {
      type: Sequelize.BOOLEAN,
    },
    Gender: {
      type: Sequelize.INTEGER,
    },
    EstId: {
      type: Sequelize.INTEGER,
    }
  },
  {
    sequelize,
    tableName: 'Users',
    schema: 'Voyage_Safety',}
);

(async () => {
  await user.sync({ force: false });
})();

module.exports = user;
