const { Op } = require("sequelize");
const Student = require("../models/sequelize/Student");

const pad = (n) => n.toString().padStart(3, "0");

module.exports.generateRollNo = async ({
  enrollmentYear,
  zoneCode,
  centerCode
}) => {
  const YY = enrollmentYear.toString().slice(-2);
  const ZZZ = zoneCode.substring(0, 3).toUpperCase();
  const CCC = centerCode.substring(0, 3).toUpperCase();

  const prefix = `${YY}${ZZZ}${CCC}`;

  const lastStudent = await Student.findOne({
    where: {
      roll_no: { [Op.like]: `${prefix}%` }
    },
    order: [["roll_no", "DESC"]]
  });

  let seq = 1;
  if (lastStudent) {
    seq = parseInt(lastStudent.roll_no.slice(-3)) + 1;
  }

  return `${prefix}${pad(seq)}`;
};
