// 📁 scripts/updateStatuses.js
const prisma = require('../utils/prisma');

async function updateReportStatuses() {
  const reports = await prisma.report.findMany();
  for (const report of reports) {
    // คำนวณสถานะน้ำตาลในเลือด (bloodSugarStatus) โดยพิจารณา mealTime
    let bloodSugarStatus;
    if (!report.bloodSugar) {
      bloodSugarStatus = null;
    } else if (report.mealTime === 'before') {
      if (report.bloodSugar < 70) {
        bloodSugarStatus = 'ต่ำ';
      } else if (report.bloodSugar <= 100) {
        bloodSugarStatus = 'ปกติ';
      } else if (report.bloodSugar <= 125) {
        bloodSugarStatus = 'สูง';
      } else {
        bloodSugarStatus = 'เสี่ยงสูง';
      }
    } else { // after หรือ other
      if (report.bloodSugar < 70) {
        bloodSugarStatus = 'ต่ำ';
      } else if (report.bloodSugar < 140) {
        bloodSugarStatus = 'ปกติ';
      } else if (report.bloodSugar <= 199) {
        bloodSugarStatus = 'สูง';
      } else {
        bloodSugarStatus = 'เสี่ยงสูง';
      }
    }

    // คำนวณสถานะความดันโลหิต (systolicStatus)
    let systolicStatus;
    if (!report.systolic) {
      systolicStatus = null;
    } else if (report.systolic < 90) {
      systolicStatus = 'ต่ำ';
    } else if (report.systolic <= 129) {
      systolicStatus = 'ปกติ';
    } else if (report.systolic <= 139) {
      systolicStatus = 'สูง';
    } else {
      systolicStatus = 'เสี่ยงสูง';
    }

    // อัปเดตข้อมูลในตาราง
    await prisma.report.update({
      where: { id: report.id },
      data: {
        bloodSugarStatus,
        systolicStatus,
      },
    });
  }
  console.log('อัปเดตสเตตัสเรียบร้อย');
}

updateReportStatuses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());