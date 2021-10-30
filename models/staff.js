const { QueryTypes } = require("sequelize");
const sequelize = require("../db_instance");

findAllStaff = async (EstId) => {
const staffUser = await sequelize.query(`SELECT E."UserId",E."FirstName",E."LastName",E."CitizenId",E."pathImg" FROM "Voyage_Safety"."Staff" join "Voyage_Safety"."Users" E on E."UserId" = "Staff"."UserId" where "EstId" = '${EstId}';`, { type: QueryTypes.SELECT });
return staffUser;
}

module.exports = findAllStaff;
