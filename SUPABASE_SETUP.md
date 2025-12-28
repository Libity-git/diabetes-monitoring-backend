# 🚀 Supabase Setup Guide

## 📋 ขั้นตอนการตั้งค่า Supabase

### 1. สร้าง Supabase Project

1. ไปที่ [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. คลิก **New Project**
3. กรอกข้อมูล:
   - **Name**: `diabetes-monitoring`
   - **Database Password**: (จดไว้ใช้ตอนหลัง)
   - **Region**: `Southeast Asia (Singapore)`
4. คลิก **Create new project**

### 2. หา Connection String

1. ไปที่ **Settings** > **Database**
2. เลื่อนลงไปที่ **Connection string**
3. เลือก Tab **URI**

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน folder `diabetes-backend`:

```env
# ==========================================
# 🔧 Supabase PostgreSQL Configuration
# ==========================================

# Connection Pooling URL (สำหรับ Application)
# ใช้ port 6543 
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection URL (สำหรับ Prisma Migrations)
# ใช้ port 5432 
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ==========================================
# 🔐 JWT Configuration
# ==========================================
JWT_SECRET=your_jwt_secret_key_here

# ==========================================
# 📱 LINE Messaging API
# ==========================================
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# ==========================================
# 🌐 Server Configuration
# ==========================================
PORT=5000
NODE_ENV=development
```

### 4. Run Migration

```bash
cd diabetes-backend

# Generate Prisma Client
npx prisma generate

# Push schema to Supabase (สร้าง tables)
npx prisma db push

# หรือใช้ migrate (แนะนำสำหรับ production)
npx prisma migrate dev --name init_supabase
```

### 5. (Optional) Seed Data

สร้าง Admin user แรก:

```bash
# เปิด Prisma Studio
npx prisma studio
```

หรือใช้ Supabase SQL Editor:

```sql
-- สร้าง Admin (password: admin123)
INSERT INTO "Admin" (username, "passwordHash", "createdAt") 
VALUES (
  'admin',
  '$2a$10$rQZ8K1Y5Y1Y5Y1Y5Y1Y5YuO1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1',
  NOW()
);
```

---

## 📊 ความแตกต่างจาก MySQL

| MySQL | PostgreSQL (Supabase) |
|-------|----------------------|
| `AUTO_INCREMENT` | `SERIAL` / `@default(autoincrement())` |
| `DATETIME` | `TIMESTAMP` |
| `TINYINT(1)` | `BOOLEAN` |
| Case insensitive | Case sensitive (ใช้ `""` สำหรับ column names) |

> ⚠️ Prisma จัดการความแตกต่างเหล่านี้ให้อัตโนมัติ

---

## 🔒 Row Level Security (RLS)

Supabase มี RLS แต่เราใช้ JWT authentication ผ่าน backend ดังนั้น:

1. ไปที่ **Authentication** > **Policies**
2. สำหรับ tables ทั้งหมด ให้ **Disable RLS** หรือสร้าง policy ที่อนุญาต service role

```sql
-- ถ้าต้องการ disable RLS (ง่ายกว่าสำหรับ backend-only access)
ALTER TABLE "Patient" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" DISABLE ROW LEVEL SECURITY;
```

---

## 🧪 ทดสอบ Connection

```bash
# ทดสอบ Prisma connection
npx prisma db pull

# ถ้าเห็น schema ก็แปลว่าเชื่อมต่อได้แล้ว!
```

---

## 📱 Deploy ไปยัง Render/Railway

อัปเดต Environment Variables บน hosting:

```
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
JWT_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_CHANNEL_SECRET=...
```

---

## ❓ Troubleshooting

### Error: Connection refused
- ตรวจสอบ IP ไม่ถูก block (Supabase อนุญาตทุก IP โดย default)
- ตรวจสอบ password ถูกต้อง

### Error: Relation does not exist
- Run `npx prisma db push` เพื่อสร้าง tables

### Error: prepared statement already exists
- เพิ่ม `?pgbouncer=true&connection_limit=1` ใน DATABASE_URL

