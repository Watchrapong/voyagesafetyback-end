const Sequelize = require("sequelize");
//const sequelize = new Sequelize("postgres://oaeobknbyajxuk:3ce67bc55d8c54e0957f6710cfa0c515078f645be082971671f6476963e3f6c4@ec2-54-196-33-23.compute-1.amazonaws.com:5432/de19df4ji5dnb1");

const sequelize = new Sequelize('d8boa87t8o98ut', 'hdvtnhvkvqpilz', 'a207f2edd4bfed0a19da748be3726c3eff822f52bdba7f49a3ab523e3b692333',{
  host: 'ec2-3-226-59-11.compute-1.amazonaws.com',
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