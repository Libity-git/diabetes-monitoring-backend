// 📁 src/utils/lineMessaging.js
const axios = require('axios');
const { channelAccessToken } = require('../config/line');

// ฟังก์ชันสร้าง Flex สำหรับผลตรวจน้ำตาล
const sugarResultFlex = (name, value, status, advice) => ({
  type: "flex",
  altText: "ผลตรวจน้ำตาลล่าสุด",
  contents: {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: `สวัสดีคุณ${name} 👋`,
          weight: "bold",
          size: "lg",
          color: "#FFFFFF",
          wrap: true,
        },
      ],
      backgroundColor: "#1976D2",
      paddingAll: "lg",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "ผลตรวจน้ำตาลวันนี้",
          size: "md",
          color: "#555555",
        },
        {
          type: "text",
          text: `${value} mg/dL`,
          weight: "bold",
          size: "xxl",
          color: "#0044CC",
          margin: "md",
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "สถานะ: ",
              size: "md",
              color: "#555555",
            },
            {
              type: "text",
              text: status,
              size: "md",
              weight: "bold",
              color: status === "ปกติ" ? "#00BB00" : "#FF4444",
            },
          ],
          margin: "md",
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "text",
          text: "คำแนะนำ 💡",
          size: "md",
          weight: "bold",
          color: "#1976D2",
          margin: "lg",
        },
        {
          type: "text",
          text: advice,
          size: "md",
          wrap: true,
          color: "#333333",
        },
      ],
      paddingAll: "lg",
      backgroundColor: "#F5F5F5",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#1976D2",
          height: "md",
          action: {
            type: "uri",
            label: "ดูประวัติย้อนหลัง 📜",
            uri: process.env.DASHBOARD_URL || "https://your-dashboard-url.com",
          },
        },
      ],
      paddingAll: "md",
    },
  },
});

// ฟังก์ชันสร้าง Flex สำหรับผลตรวจความดันโลหิต
const bloodPressureFlex = (name, systolic, diastolic, pulse, status, advice) => ({
  type: "flex",
  altText: "ผลตรวจความดันโลหิตล่าสุด",
  contents: {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: `สวัสดีคุณ${name} 👋`,
          weight: "bold",
          size: "lg",
          color: "#FFFFFF",
          wrap: true,
        },
      ],
      backgroundColor: "#1976D2",
      paddingAll: "lg",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "ผลตรวจความดันวันนี้",
          size: "md",
          color: "#555555",
        },
        {
          type: "text",
          text: `${systolic}/${diastolic} mmHg`,
          weight: "bold",
          size: "xxl",
          color: "#0044CC",
          margin: "md",
        },
        ...(pulse ? [
          {
            type: "text",
            text: `ชีพจร: ${pulse} bpm`,
            size: "md",
            color: "#666666",
            margin: "sm",
          },
        ] : []),
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "สถานะ: ",
              size: "md",
              color: "#555555",
            },
            {
              type: "text",
              text: status,
              size: "md",
              weight: "bold",
              color: status === "ปกติ" ? "#00BB00" : "#FF4444",
            },
          ],
          margin: "md",
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "text",
          text: "คำแนะนำ 💡",
          size: "md",
          weight: "bold",
          color: "#1976D2",
          margin: "lg",
        },
        {
          type: "text",
          text: advice,
          size: "md",
          wrap: true,
          color: "#333333",
        },
      ],
      paddingAll: "lg",
      backgroundColor: "#F5F5F5",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#1976D2",
          height: "md",
          action: {
            type: "uri",
            label: "ดูประวัติย้อนหลัง 📜",
            uri: process.env.DASHBOARD_URL || "https://your-dashboard-url.com",
          },
        },
      ],
      paddingAll: "md",
    },
  },
});

// ฟังก์ชันสร้าง Flex สำหรับผลตรวจค่าน้ำตาลและความดันพร้อมกัน
const combinedResultFlex = (name, sugarValue, sugarStatus, sugarAdvice, systolic, diastolic, pulse, pressureStatus, pressureAdvice) => ({
  type: "flex",
  altText: "ผลตรวจน้ำตาลและความดันล่าสุด",
  contents: {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: `สวัสดีคุณ${name} 👋`,
          weight: "bold",
          size: "lg",
          color: "#FFFFFF",
          wrap: true,
        },
      ],
      backgroundColor: "#1976D2",
      paddingAll: "lg",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "ผลตรวจน้ำตาลวันนี้",
          size: "md",
          color: "#555555",
        },
        {
          type: "text",
          text: `${sugarValue} mg/dL`,
          weight: "bold",
          size: "xl",
          color: "#0044CC",
          margin: "md",
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "สถานะ: ",
              size: "md",
              color: "#555555",
            },
            {
              type: "text",
              text: sugarStatus,
              size: "md",
              weight: "bold",
              color: sugarStatus === "ปกติ" ? "#00BB00" : "#FF4444",
            },
          ],
          margin: "md",
        },
        {
          type: "text",
          text: sugarAdvice,
          size: "sm",
          wrap: true,
          color: "#333333",
          margin: "md",
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "text",
          text: "ผลตรวจความดันวันนี้",
          size: "md",
          color: "#555555",
          margin: "md",
        },
        {
          type: "text",
          text: `${systolic}/${diastolic} mmHg`,
          weight: "bold",
          size: "xl",
          color: "#0044CC",
          margin: "md",
        },
        ...(pulse ? [
          {
            type: "text",
            text: `ชีพจร: ${pulse} bpm`,
            size: "md",
            color: "#666666",
            margin: "sm",
          },
        ] : []),
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "สถานะ: ",
              size: "md",
              color: "#555555",
            },
            {
              type: "text",
              text: pressureStatus,
              size: "md",
              weight: "bold",
              color: pressureStatus === "ปกติ" ? "#00BB00" : "#FF4444",
            },
          ],
          margin: "md",
        },
        {
          type: "text",
          text: pressureAdvice,
          size: "sm",
          wrap: true,
          color: "#333333",
          margin: "md",
        },
      ],
      paddingAll: "lg",
      backgroundColor: "#F5F5F5",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#1976D2",
          height: "md",
          action: {
            type: "uri",
            label: "ดูประวัติย้อนหลัง 📜",
            uri: process.env.DASHBOARD_URL || "https://your-dashboard-url.com",
          },
        },
      ],
      paddingAll: "md",
    },
  },
});

// ฟังก์ชันสร้าง Flex สำหรับการสมัครสมาชิกสำเร็จ
const registerSuccessFlex = (name) => ({
  type: "flex",
  altText: "สมัครสมาชิกสำเร็จ",
  contents: {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "สมัครสมาชิกสำเร็จ 🎉",
          weight: "bold",
          size: "lg",
          color: "#FFFFFF",
          align: "center",
        },
      ],
      backgroundColor: "#4CAF50",
      paddingAll: "lg",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: `ขอบคุณคุณ ${name} ที่สมัครใช้งานระบบค่ะ`,
          size: "md",
          color: "#333333",
          wrap: true,
          align: "center",
        },
        {
          type: "text",
          text: "เริ่มส่งค่าน้ำตาลหรือความดันได้เลยนะคะ 😊",
          size: "md",
          color: "#555555",
          wrap: true,
          align: "center",
        },
      ],
      paddingAll: "lg",
      backgroundColor: "#F5F5F5",
    },
  },
});

// ฟังก์ชันสร้าง Flex สำหรับแจ้งให้สมัครสมาชิก
const pushRegisterFlex = (userId) => {
  const flexMessage = {
    type: "flex",
    altText: "สมัครสมาชิกระบบ",
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📋 สมัครสมาชิกระบบ",
            weight: "bold",
            size: "lg",
            color: "#FFFFFF",
            align: "center",
          },
        ],
        backgroundColor: "#1976D2",
        paddingAll: "lg",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: "กรุณาส่งข้อมูลตามรูปแบบนี้ค่ะ",
            size: "md",
            color: "#555555",
            wrap: true,
          },
          {
            type: "text",
            text: "สมัคร: ชื่อ, เพศ, อายุ, เบอร์โทร",
            weight: "bold",
            size: "md",
            color: "#333333",
            wrap: true,
          },
          {
            type: "text",
            text: "ตัวอย่าง: สมัคร: สมชาย, ชาย, 55, 0812345678",
            size: "md",
            color: "#666666",
            wrap: true,
            margin: "md",
          },
        ],
        paddingAll: "lg",
        backgroundColor: "#F5F5F5",
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#1976D2",
            height: "md",
            action: {
              type: "message",
              label: "คัดลอกตัวอย่าง 📝",
              text: "สมัคร: สมชาย, ชาย, 55, 0812345678",
            },
          },
        ],
        paddingAll: "md",
      },
    },
  };

  return axios.post('https://api.line.me/v2/bot/message/push', {
    to: userId,
    messages: [flexMessage],
  }, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
  }).catch(error => {
    console.error('Error sending register flex message:', error.response?.data || error.message);
    throw error;
  });
};

// ฟังก์ชันส่ง LINE Flex Message
exports.pushSugarResultCard = (userId, name, value, status, advice) => {
  const flexMessage = sugarResultFlex(name, value, status, advice);
  return axios.post('https://api.line.me/v2/bot/message/push', {
    to: userId,
    messages: [flexMessage],
  }, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
  }).catch(error => {
    console.error('Error sending sugar result card:', error.response?.data || error.message);
    throw error;
  });
};

exports.pushBloodPressureCard = (userId, name, systolic, diastolic, pulse, status, advice) => {
  const flexMessage = bloodPressureFlex(name, systolic, diastolic, pulse, status, advice);
  return axios.post('https://api.line.me/v2/bot/message/push', {
    to: userId,
    messages: [flexMessage],
  }, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
  }).catch(error => {
    console.error('Error sending blood pressure card:', error.response?.data || error.message);
    throw error;
  });
};

exports.pushCombinedResultCard = (userId, name, sugarValue, sugarStatus, sugarAdvice, systolic, diastolic, pulse, pressureStatus, pressureAdvice) => {
  const flexMessage = combinedResultFlex(name, sugarValue, sugarStatus, sugarAdvice, systolic, diastolic, pulse, pressureStatus, pressureAdvice);
  return axios.post('https://api.line.me/v2/bot/message/push', {
    to: userId,
    messages: [flexMessage],
  }, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
  }).catch(error => {
    console.error('Error sending combined result card:', error.response?.data || error.message);
    throw error;
  });
};

exports.pushRegisterSuccessCard = (userId, name) => {
  const flexMessage = registerSuccessFlex(name);
  return axios.post('https://api.line.me/v2/bot/message/push', {
    to: userId,
    messages: [flexMessage],
  }, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
  }).catch(error => {
    console.error('Error sending register success card:', error.response?.data || error.message);
    throw error;
  });
};

exports.pushRegisterFlex = pushRegisterFlex;

// ฟังก์ชันส่งข้อความตอบกลับ
exports.replyMessage = (replyToken, message) => {
  return axios.post('https://api.line.me/v2/bot/message/reply', {
    replyToken,
    messages: [message],
  }, {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json',
    },
  }).catch(error => {
    console.error('Error sending reply message:', error.response?.data || error.message);
    throw error;
  });
};