const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const Owner = sequelize.define(
  "Owner",
  {
    // attributes
    OwnerId: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    EstId: {
      type: Sequelize.STRING,
    },
    UserId: {
      type: Sequelize.STRING,
    },
    vaccineName1: {
      type: Sequelize.STRING,
    },
    vaccineName2: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    tableName: "Owner",
    schema: "Voyage_Safety",
  }
);

(async () => {
  await Owner.sync({ force: false });
})();

module.exports = Owner;
