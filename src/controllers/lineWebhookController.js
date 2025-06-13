// 📁 src/controllers/lineWebhookController.js
const prisma = require('../utils/prisma');
const {
  pushSugarResultCard,
  pushBloodPressureCard,
  pushRegisterFlex,
  pushRegisterSuccessCard,
  replyMessage,
} = require('../utils/lineMessaging');

// ฟังก์ชันช่วยเหลือ (แสดงคำสั่งที่ใช้งานได้)
const sendHelpMessage = async (replyToken) => {
  await replyMessage(replyToken, {
    type: 'text',
    text: `💡 วิธีใช้งานระบบสำหรับคุณค่ะ\n\n` +
          `1️⃣ สมัครสมาชิก\nพิมพ์: สมัคร: ชื่อ, เพศ, อายุ, เบอร์โทร\nตัวอย่าง: สมัคร: สมชาย, ชาย, 55, 0812345678\n\n` +
          `4️⃣ ส่งค่าน้ำตาลและความดันพร้อมกัน\nตัวอย่าง: น้ำตาล: 120 ก่อน ความดัน: 120/80 ชีพจร: 70\n\n` +
          `📌 หากมีข้อสงสัย พิมพ์ "ช่วยเหลือ" ได้เลยค่ะ 😊`,
  });
};

exports.handleWebhook = async (req, res) => {
  const events = req.body.events;

  if (!events || !Array.isArray(events)) {
    return res.sendStatus(200); // ส่ง 200 หากไม่มี events เพื่อให้ LINE ไม่ส่งซ้ำ
  }

  for (const event of events) {
    const lineUserId = event.source?.userId;
    if (!lineUserId) {
      console.error('No userId found in event:', event);
      continue;
    }

    // 🟢 ผู้ใช้เพิ่มเพื่อนครั้งแรก
    if (event.type === 'follow') {
      const existing = await prisma.patient.findUnique({ where: { lineUserId } });
      if (!existing) {
        await pushRegisterFlex(lineUserId);
      } else {
        await replyMessage(event.replyToken, {
          type: 'text',
          text: `สวัสดีคุณ ${existing.name} ค่ะ คุณสมัครไว้แล้วนะคะ 😊\n` +
                `สามารถส่งค่าน้ำตาลและความดันได้เลยค่ะ\n` +
                `หากต้องการดูวิธีใช้งาน พิมพ์ "ช่วยเหลือ" ค่ะ`,
        });
      }
      continue;
    }

    // 🟢 ข้อความจากผู้ใช้
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim(); // ไม่แปลงเป็น lowercase เพื่อรักษาข้อมูล

      // 🟡 พิมพ์ "ช่วยเหลือ"
      if (text.toLowerCase() === "ช่วยเหลือ") {
        await sendHelpMessage(event.replyToken);
        continue;
      }

      // 🟡 พิมพ์ "ลงทะเบียน"
      if (text.toLowerCase() === "ลงทะเบียน") {
        const existing = await prisma.patient.findUnique({ where: { lineUserId } });
        if (!existing) {
          await pushRegisterFlex(lineUserId);
        } else {
          await replyMessage(event.replyToken, {
            type: 'text',
            text: `สวัสดีคุณ ${existing.name} ค่ะ คุณสมัครไว้แล้วนะคะ 😊\n` +
                  `สามารถส่งค่าน้ำตาลและความดันได้เลยค่ะ\n` +
                  `หากต้องการดูวิธีใช้งาน พิมพ์ "ช่วยเหลือ" ค่ะ`,
          });
        }
        continue;
      }

      // 🟡 พิมพ์ "ส่งผลน้ำตาล/ความดันโลหิต" (จากริชเมนู)
      if (text.toLowerCase() === "ส่งผลน้ำตาล/ความดันโลหิต") {
        const patient = await prisma.patient.findUnique({ where: { lineUserId } });
        if (!patient) {
          await replyMessage(event.replyToken, {
            type: 'text',
            text: `คุณยังไม่ได้สมัครสมาชิกค่ะ 😊\n` +
                  `กรุณาพิมพ์ "ลงทะเบียน" เพื่อสมัครใช้งานระบบค่ะ`,
          });
        } else {
          await replyMessage(event.replyToken, {
            type: 'text',
            text: `💉 ส่งผลน้ำตาลและความดันโลหิต\n\n` +
                  `คุณ ${patient.name} สามารถส่งข้อมูลได้ตามตัวอย่างนี้ค่ะ\n` +
                  `- พร้อมกัน: น้ำตาล: 120 ก่อน ความดัน: 120/80 ชีพจร: 70\n` +
                  `📌 หากต้องการดูวิธีใช้งานเพิ่มเติม พิมพ์ "ช่วยเหลือ" ค่ะ`,
          });
        }
        continue;
      }

      // 🟡 พิมพ์ "รายงานสุขภาพ" (จากริชเมนู)
      if (text.toLowerCase() === "ข้อมูลสุขภาพ") {
        const patient = await prisma.patient.findUnique({ where: { lineUserId } });
        if (!patient) {
          await replyMessage(event.replyToken, {
            type: 'text',
            text: `คุณยังไม่ได้สมัครสมาชิกค่ะ 😊\n` +
                  `กรุณาพิมพ์ "ลงทะเบียน" เพื่อสมัครใช้งานระบบค่ะ`,
          });
        } else {
          // ดึงรายงานล่าสุดของผู้ป่วย
          const latestReport = await prisma.report.findFirst({
            where: { patientId: patient.id },
            orderBy: { recordedAt: 'desc' },
          });

          if (!latestReport) {
            await replyMessage(event.replyToken, {
              type: 'text',
              text: `คุณ ${patient.name} ยังไม่มีข้อมูลสุขภาพในระบบค่ะ 😊\n` +
                    `กรุณาส่งค่าน้ำตาลและความดันก่อนนะคะ`,
            });
          } else {
            // จัดรูปแบบข้อมูลสุขภาพ
            const sugarText = latestReport.bloodSugar
              ? `น้ำตาล: ${latestReport.bloodSugar} mg/dL (${latestReport.bloodSugarStatus || 'N/A'})`
              : 'น้ำตาล: -';
            const pressureText = latestReport.systolic && latestReport.diastolic
              ? `ความดัน: ${latestReport.systolic}/${latestReport.diastolic} mmHg (${latestReport.systolicStatus || 'N/A'})`
              : 'ความดัน: -';
            const pulseText = latestReport.pulse
              ? `ชีพจร: ${latestReport.pulse} bpm`
              : 'ชีพจร: -';
            const recordedAt = new Date(latestReport.recordedAt).toLocaleString('th-TH', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });

            await replyMessage(event.replyToken, {
              type: 'text',
              text: `📊 รายงานสุขภาพล่าสุดของคุณ ${patient.name}\n\n` +
                    `${sugarText}\n` +
                    `${pressureText}\n` +
                    `${pulseText}\n` +
                    `วันที่บันทึก: ${recordedAt}\n\n` +
                    `📌 หากต้องการดูวิธีใช้งานเพิ่มเติม พิมพ์ "ช่วยเหลือ" ค่ะ`,
            });
          }
        }
        continue;
      }

      // 🟡 สมัคร: สมชาย, ชาย, 55, 0812345678
      if (text.toLowerCase().startsWith("สมัคร:")) {
        const parts = text.replace(/สมัคร:/i, "").split(",");
        if (parts.length === 4) {
          const name = parts[0].trim();
          const gender = parts[1].trim();
          const age = parseInt(parts[2].trim());
          const phone = parts[3].trim();

          // ตรวจสอบข้อมูลเพิ่มเติม
          if (!name || !['ชาย', 'หญิง'].includes(gender.toLowerCase()) || isNaN(age) || age < 0 || age > 120 || !phone.match(/^\d{10}$/)) {
            await replyMessage(event.replyToken, {
              type: 'text',
              text: `❗ กรุณาตรวจสอบข้อมูลให้ถูกต้องค่ะ\n` +
                    `- ชื่อ: กรุณากรอกชื่อ\n` +
                    `- เพศ: กรอก "ชาย" หรือ "หญิง"\n` +
                    `- อายุ: กรอกตัวเลข (0-120)\n` +
                    `- เบอร์โทร: กรอกตัวเลข 10 หลัก\n` +
                    `ตัวอย่าง: สมัคร: สมชาย, ชาย, 55, 0812345678`,
            });
            continue;
          }

          const existing = await prisma.patient.findUnique({ where: { lineUserId } });

          if (existing) {
            await replyMessage(event.replyToken, {
              type: 'text',
              text: `สวัสดีคุณ ${existing.name} ค่ะ คุณสมัครไว้แล้วนะคะ 😊`,
            });
          } else {
            await prisma.patient.create({
              data: { name, gender, age, phone, lineUserId },
            });
            await pushRegisterSuccessCard(lineUserId, name);
            await replyMessage(event.replyToken, {
              type: 'text',
              text: `✅ สมัครสำเร็จแล้วค่ะ ขอบคุณคุณ ${name} ที่สมัครใช้งานระบบค่ะ 😊\n` +
                    `คุณสามารถส่งค่าน้ำตาลและความดันได้เลยค่ะ\n` +
                    `หากต้องการดูวิธีใช้งาน พิมพ์ "ช่วยเหลือ" ค่ะ`,
            });
          }
        } else {
          await replyMessage(event.replyToken, {
            type: 'text',
            text: `❗ กรุณากรอกข้อมูลให้ครบ 4 ช่อง: ชื่อ, เพศ, อายุ, เบอร์โทร\n` +
                  `ตัวอย่าง: สมัคร: สมชาย, ชาย, 55, 0812345678`,
          });
        }
        continue;
      }

      // ตรวจสอบว่าผู้ใช้สมัครสมาชิกแล้วหรือยัง
      const patient = await prisma.patient.findUnique({ where: { lineUserId } });
      if (!patient) {
        await replyMessage(event.replyToken, {
          type: 'text',
          text: `คุณยังไม่ได้สมัครสมาชิกค่ะ 😊\n` +
                `กรุณาพิมพ์ "ลงทะเบียน" เพื่อสมัครใช้งานระบบค่ะ`,
        });
        continue;
      }

      // 🎯 กรณีน้ำตาลและ/หรือความดัน
      // Define regex patterns
      const sugarRegex = /น้ำตาล: (\d+) (ก่อน|หลัง)/i;
      const pressureRegex = /ความดัน: (\d+)\/(\d+)(?: ชีพจร: (\d+))?/i;

      // Match the text with regex
      const sugarMatch = text.match(sugarRegex);
      const pressureMatch = text.match(pressureRegex);

      if (sugarMatch || pressureMatch) {
        let bloodSugar, mealTime, systolic, diastolic, pulse;
        let errors = [];

        // ตรวจสอบค่าน้ำตาล
        if (sugarMatch) {
          bloodSugar = parseInt(sugarMatch[1]);
          mealTime = sugarMatch[2] === 'ก่อน' ? 'before' : 'after';

          if (bloodSugar < 0 || bloodSugar > 500) {
            errors.push(`❗ ค่าน้ำตาล ${bloodSugar} mg/dL ดูเหมือนจะผิดปกติ (ควรอยู่ระหว่าง 0-500 mg/dL)`);
          }
        }

        // ตรวจสอบความดัน
        if (pressureMatch) {
          systolic = parseInt(pressureMatch[1]);
          diastolic = parseInt(pressureMatch[2]);
          pulse = pressureMatch[3] ? parseInt(pressureMatch[3]) : null;

          if (systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150) {
            errors.push(`❗ ค่าความดัน ${systolic}/${diastolic} mmHg ดูเหมือนจะผิดปกติ (ควรอยู่ระหว่าง 50/30 - 250/150 mmHg)`);
          }
          if (pulse && (pulse < 30 || pulse > 200)) {
            errors.push(`❗ ค่าชีพจร ${pulse} bpm ดูเหมือนจะผิดปกติ (ควรอยู่ระหว่าง 30-200 bpm)`);
          }
        }

        // ถ้ามีข้อผิดพลาด
        if (errors.length > 0) {
          await replyMessage(event.replyToken, {
            type: 'text',
            text: errors.join('\n') + `\nกรุณาตรวจสอบและส่งใหม่อีกครั้งค่ะ\nตัวอย่าง: น้ำตาล: 120 ก่อน ความดัน: 120/80 ชีพจร: 70`,
          });
          continue;
        }

        // คำนวณสถานะ
        let bloodSugarStatus;
        if (!bloodSugar) {
          bloodSugarStatus = null;
        } else if (mealTime === 'before') {
          if (bloodSugar < 70) bloodSugarStatus = 'ต่ำ';
          else if (bloodSugar <= 100) bloodSugarStatus = 'ปกติ';
          else if (bloodSugar <= 125) bloodSugarStatus = 'สูง';
          else bloodSugarStatus = 'เสี่ยงสูง';
        } else { // after หรือ other
          if (bloodSugar < 70) bloodSugarStatus = 'ต่ำ';
          else if (bloodSugar < 140) bloodSugarStatus = 'ปกติ';
          else if (bloodSugar <= 199) bloodSugarStatus = 'สูง';
          else bloodSugarStatus = 'เสี่ยงสูง';
        }

        let systolicStatus;
        if (!systolic) {
          systolicStatus = null;
        } else if (systolic < 90) systolicStatus = 'ต่ำ';
        else if (systolic <= 129) systolicStatus = 'ปกติ';
        else if (systolic <= 139) systolicStatus = 'สูง';
        else systolicStatus = 'เสี่ยงสูง';

        // บันทึกข้อมูล
        await prisma.report.create({
          data: {
            patientId: patient.id,
            bloodSugar: bloodSugar || 0,
            mealTime: mealTime || 'other',
            systolic: systolic || 0,
            diastolic: diastolic || 0,
            pulse: pulse || null,
            recordedAt: new Date(),
            createdAt: new Date(),
            bloodSugarStatus,
            systolicStatus,
          },
        });

        // กรณีค่าน้ำตาล
        if (sugarMatch) {
          let advice = "ค่าน้ำตาลของคุณอยู่ในเกณฑ์ปกติ รักษาระดับนี้ไว้นะคะ";
          if (mealTime === 'before') {
            if (bloodSugar < 70) {
              advice = "ค่าน้ำตาลต่ำ ควรรับประทานของว่าง เช่น น้ำผลไม้หรือลูกอม แล้ววัดซ้ำใน 15 นาที หากยังต่ำอยู่ให้รีบพบแพทย์ค่ะ";
            } else if (bloodSugar > 125) {
              advice = "ค่าน้ำตาลเสี่ยงสูง ควรปรึกษาแพทย์ทันทีเพื่อรับการรักษาค่ะ";
            } else if (bloodSugar > 100) {
              advice = "ค่าน้ำตาลสูงกว่าปกติ ควรหลีกเลี่ยงของหวาน ออกกำลังกายเบาๆ และปรึกษาแพทย์เพื่อปรับยาค่ะ";
            }
          } else {
            if (bloodSugar < 70) {
              advice = "ค่าน้ำตาลต่ำ ควรรับประทานของว่าง เช่น น้ำผลไม้หรือลูกอม แล้ววัดซ้ำใน 15 นาที หากยังต่ำอยู่ให้รีบพบแพทย์ค่ะ";
            } else if (bloodSugar > 200) {
              advice = "ค่าน้ำตาลเสี่ยงสูง ควรปรึกษาแพทย์ทันทีเพื่อรับการรักษาค่ะ";
            } else if (bloodSugar > 140) {
              advice = "ค่าน้ำตาลสูงกว่าปกติ ควรหลีกเลี่ยงของหวาน ออกกำลังกายเบาๆ และปรึกษาแพทย์เพื่อปรับยาค่ะ";
            }
          }
          await pushSugarResultCard(lineUserId, patient.name, bloodSugar, bloodSugarStatus, advice);
        }

        // กรณีความดัน
        if (pressureMatch) {
          let advice = "ค่าความดันของคุณอยู่ในเกณฑ์ปกติ รักษาระดับนี้ไว้นะคะ";
          if (systolic >= 140 || diastolic >= 90) {
            advice = "ค่าความดันเสี่ยงสูง ควรปรึกษาแพทย์ทันทีเพื่อรับการรักษาค่ะ";
          } else if (systolic >= 130) {
            advice = "ค่าความดันสูงกว่าปกติ ควรลดการกินเค็ม ออกกำลังกายสม่ำเสมอ และปรึกษาแพทย์เพื่อตรวจเพิ่มเติมค่ะ";
          } else if (systolic < 90 || diastolic < 60) {
            advice = "ค่าความดันต่ำกว่าปกติ อาจมีอาการเวียนหัว ควรดื่มน้ำมากๆ พักผ่อนให้เพียงพอ และปรึกษาแพทย์หากมีอาการรุนแรงค่ะ";
          }
          await pushBloodPressureCard(lineUserId, patient.name, systolic, diastolic, pulse, systolicStatus, advice);
        }

        await replyMessage(event.replyToken, {
          type: 'text',
          text: `✅ บันทึกข้อมูลสำเร็จแล้วค่ะ ขอบคุณคุณ ${patient.name} ที่ส่งข้อมูลค่ะ 😊`,
        });
        continue;
      }

      // 🟡 กรณีข้อความไม่ตรงเงื่อนไข
      await replyMessage(event.replyToken, {
        type: 'text',
        text: `ขออภัยค่ะ ไม่เข้าใจข้อความ "${text}" 😅\n` +
              `คุณสามารถส่งค่าน้ำตาลและความดันได้ตามตัวอย่างนี้ค่ะ\n` +
              `-  น้ำตาล: 120 ก่อน ความดัน: 120/80 ชีพจร: 70\n` +
              `หากต้องการดูวิธีใช้งานเพิ่มเติม พิมพ์ "ช่วยเหลือ" ค่ะ`,
      });
    }
  }

  res.sendStatus(200); // ย้ายมาอยู่หลัง loop เพื่อให้แน่ใจว่าส่ง response เสมอ
};
