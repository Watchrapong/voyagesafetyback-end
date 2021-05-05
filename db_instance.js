const Sequelize = require("sequelize");
//const sequelize = new Sequelize("postgres://oaeobknbyajxuk:3ce67bc55d8c54e0957f6710cfa0c515078f645be082971671f6476963e3f6c4@ec2-54-196-33-23.compute-1.amazonaws.com:5432/de19df4ji5dnb1");

const sequelize = new Sequelize('de19df4ji5dnb1', 'oaeobknbyajxuk', '3ce67bc55d8c54e0957f6710cfa0c515078f645be082971671f6476963e3f6c4',{
  host: 'ec2-54-196-33-23.compute-1.amazonaws.com',
  dialect: 'postgres',
  protocol: "postgres",
  schema: "Voyage_Safety",
  logging: true,
  dialectOptions: {
      ssl: {
          require: true,
          rejectUnauthorized: false // <<<<<< YOU NEED THIS
      }
  }
});

module.exports = sequelize;