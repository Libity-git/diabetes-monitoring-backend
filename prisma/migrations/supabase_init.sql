-- ==========================================
-- 🔧 Supabase PostgreSQL Migration
-- สำหรับ Diabetes Monitoring System
-- ==========================================

-- สร้าง Table: Patient
CREATE TABLE IF NOT EXISTS "Patient" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(50) NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "lineUserId" VARCHAR(255) NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Table: Report
CREATE TABLE IF NOT EXISTS "Report" (
    "id" SERIAL PRIMARY KEY,
    "patientId" INTEGER NOT NULL,
    "bloodSugar" INTEGER NOT NULL,
    "mealTime" VARCHAR(50) NOT NULL,
    "systolic" INTEGER NOT NULL,
    "diastolic" INTEGER NOT NULL,
    "pulse" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloodSugarStatus" VARCHAR(50),
    "systolicStatus" VARCHAR(50),
    CONSTRAINT "Report_patientId_fkey" FOREIGN KEY ("patientId") 
        REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- สร้าง Table: Admin
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Index สำหรับ performance
CREATE INDEX IF NOT EXISTS "Report_patientId_idx" ON "Report"("patientId");
CREATE INDEX IF NOT EXISTS "Report_recordedAt_idx" ON "Report"("recordedAt");
CREATE INDEX IF NOT EXISTS "Patient_lineUserId_idx" ON "Patient"("lineUserId");

-- ==========================================
-- 🔓 Disable RLS (เนื่องจากใช้ backend authentication)
-- ==========================================
ALTER TABLE "Patient" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 👤 สร้าง Admin User แรก (Optional)
-- Password: admin123 (bcrypt hash)
-- ==========================================
-- INSERT INTO "Admin" ("username", "passwordHash", "createdAt")
-- VALUES (
--     'admin',
--     '$2a$10$N9qo8uLOickgx2ZMRZoMye.IYfM1VlcJrEejR7h/WXk0dw1q0yU7O',
--     CURRENT_TIMESTAMP
-- )
-- ON CONFLICT ("username") DO NOTHING;

-- ==========================================
-- ✅ Migration Complete
-- ==========================================

