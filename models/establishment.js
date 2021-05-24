const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const Establishment = sequelize.define(
  "Establishment",
  {
    // attributes
    EstId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    Name: {
      type: Sequelize.STRING,
    },
    SubCategoryId: {
      type: Sequelize.INTEGER,
      },
    Description: {
      type: Sequelize.STRING,
    },
    Address: {
      type: Sequelize.STRING,
    },
    District: {
      type: Sequelize.STRING,
    },
    Province: {
      type: Sequelize.STRING,
    },
    PostCode: {
      type: Sequelize.STRING,
    },
    Owner: {
      type: Sequelize.STRING,
      },
    Lat: {
      type: Sequelize.STRING,
    },
    Lng: {
      type: Sequelize.STRING,
    },
    pathImg: {
      type: Sequelize.STRING,
    }
  },
  {
    sequelize,
    tableName: 'Establishment',
    schema: 'Voyage_Safety',}
);

(async () => {
  await Establishment.sync({ force: false });
})();

module.exports = Establishment;
