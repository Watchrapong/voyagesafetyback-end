const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

const image = sequelize.define(
  "Image",
  {
    // attributes
    ImgId: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    EstId: {
        type: Sequelize.STRING,
      },
    Img: {
        type: Sequelize.STRING,
      },
    mainImage: {
      type: Sequelize.BOOLEAN,
    },
    fileName: {
      type: Sequelize.STRING,
    }
  },
  {
    sequelize,
    tableName: 'Image',
    schema: 'Voyage_Safety',}
);

(async () => {
  await image.sync({ force: false });
})();

module.exports = image;
