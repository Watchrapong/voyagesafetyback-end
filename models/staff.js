const { QueryTypes } = require("sequelize");
const Sequelize = require("sequelize");
const sequelize = require("../db_instance");

findAllStaff = async (EstId) => {
const staffUser = await sequelize.query(`SELECT E."UserId",E."FirstName",E."LastName",E."CitizenId",E."pathImg","Staff"."Position","Staff"."vaccineName1","Staff"."vaccineName2" FROM "Voyage_Safety"."Staff" join "Voyage_Safety"."Users" E on E."UserId" = "Staff"."UserId" where "EstId" = '${EstId}';`, { type: QueryTypes.SELECT });
return staffUser;
}

countStaff = async (EstId) => {
  const countStaffVaccines = await sequelize.query(`SELECT (SELECT count("StaffId") from "Voyage_Safety"."Staff" where "EstId"= '${EstId}') as "Total", count("StaffId") as "NotVaccinated" from "Voyage_Safety"."Staff" where "EstId"= '${EstId}' and "vaccineName1" = '';`, { type: QueryTypes.SELECT});
  return countStaffVaccines;
}

const Staff = sequelize.define(
    "Staff",
    {
      // attributes
      StaffId: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      UserId: {
        type: Sequelize.STRING,
      },
      EstId: {
        type: Sequelize.STRING,
      },
      vaccineName1: {
        type: Sequelize.STRING,
      },
      vaccineName2: {
        type: Sequelize.STRING,
      },
      Position: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      tableName: "Staff",
      schema: "Voyage_Safety",
    }
  );
  
  (async () => {
    await Staff.sync({ force: false });
  })();
  

module.exports = {findAllStaff, Staff, countStaff};
