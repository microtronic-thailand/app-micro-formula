# 🏢 Micro Account - ระบบบริหารจัดการบัญชีบริษัท

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**ระบบบัญชีที่ออกแบบมาเพื่อธุรกิจ SME และองค์กรสมัยใหม่ ใช้งานง่าย ครบถ้วน ลื่นไหล**

[🚀 เริ่มต้นใช้งาน](#-การติดตั้ง) • [📖 คุณสมบัติ](#-คุณสมบัติหลัก) • [🤝 สนับสนุน](#-การสนับสนุน)

[🔴 **Live Demo: nextjs-micro-account.vercel.app**](https://nextjs-micro-account.vercel.app/)

</div>

---

## 📋 สารบัญ

- [เกี่ยวกับโครงการ](#-เกี่ยวกับโครงการ)
- [คุณสมบัติหลัก](#-คุณสมบัติหลัก)
- [เทคโนโลยี](#-เทคโนโลยีที่ใช้)
- [การติดตั้ง](#-การติดตั้ง)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [คู่มือและแผนราคา](#-คู่มือและแผนราคา)
- [Roadmap](#-roadmap)

---

## 📚 คู่มือและแผนราคา

เพื่อความสะดวกในการใช้งานและการตัดสินใจ เราได้เตรียมเอกสารไว้ให้คุณดังนี้:

*   📘 **[คู่มือการใช้งาน (User Manual)](./docs/USER_MANUAL.md)** - สอนการใช้งานตั้งแต่เริ่มต้นจนถึงการออกเอกสาร
*   💰 **[แผนราคาและบริการ (Pricing Plan)](./docs/PRICING_PLAN.md)** - รายละเอียดราคาซื้อขาด, รายเดือน, และบริการเสริมต่างๆ

---

## 🎯 เกี่ยวกับโครงการ

**Micro Account** คือแพลตฟอร์มบริหารจัดการบัญชีที่พัฒนาด้วย **Next.js (App Router)** เน้นประสิทธิภาพและความเร็วในการทำงาน รองรับการทำงานผ่าน Cloud ทำให้สามารถตรวจสอบสถานะทางการเงินของบริษัทได้ทุกที่ทุกเวลา

### ปรัชญาการออกแบบ
- **Simplicity**: ใช้งานง่าย ไม่ซับซ้อน แม้ไม่มีพื้นฐานบัญชีลึกซึ้ง
- **Performance**: โหลดไว ตอบสนองทันที
- **Scalability**: รองรับข้อมูลปริมาณมากเมื่อธุรกิจเติบโต

---

## ✨ คุณสมบัติหลัก

### 📊 Dashboard & Overview
- ภาพรวมสถานะการเงิน (Cash Flow) แบบ Real-time
- กราฟแสดงแนวโน้มรายรับ-รายจ่าย
- แจ้งเตือนบิลที่ใกล้ถึงกำหนดชำระ

### 📑 เอกสารทางธุรกิจ (Documents)
- **ใบเสนอราคา (Quotation)**: สร้างและส่งให้ลูกค้าได้ทันที
- **ใบแจ้งหนี้ (Invoice)**: แปลงจากใบเสนอราคาได้ในคลิกเดียว
- **ใบเสร็จรับเงิน (Receipt)**: ออกอัตโนมัติเมื่อได้รับการดชำระเงิน
- **ใบหัก ณ ที่จ่าย**: รองรับมาตรฐานไทย

### 💰 บันทึกค่าใช้จ่าย (Expenses)
- จัดหมวดหมู่ค่าใช้จ่าย
- แนบรูปสลิป/ใบเสร็จได้
- สรุปภาษีซื้อ-ขาย

### 👥 การจัดการ (Management)
- **CRM**: ฐานข้อมูลลูกค้าและผู้ติดต่อ
- **Inventory**: สต็อกสินค้าและบริการ
- **User Roles**: กำหนดสิทธิ์ แอดมิน/นักบัญชี/พนักงานขาย

---

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Language**: TypeScript
- **UI Components**: Shadcn/ui, Lucide Icons
- **State Management**: Zustand / React Query
- **Charts**: Recharts
- **Database (Planned)**: Supabase / PostgreSQL

---

## 🚀 การติดตั้ง

ใช้งานบนเครื่องของคุณ (Local Development):

1. **Clone Repository**
   ```bash
   git clone https://github.com/WebShardow/nextjs-micro-account.git
   cd nextjs-micro-account
   ```

2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   # หรือ
   yarn install
   ```

3. **รันโปรแกรม**
   ```bash
   npm run dev
   ```
   เปิด Browser ไปที่ `http://localhost:3000`

---

## 📁 โครงสร้างโปรเจกต์

```
nextjs-micro-account/
├── app/                  # App Router หลัก
│   ├── (auth)/          # หน้า Login/Register
│   ├── (dashboard)/     # หน้าหลักหลัง Login
│   │   ├── invoices/    # ระบบใบแจ้หนี้
│   │   ├── expenses/    # ระบบค่าใช้จ่าย
│   │   └── customers/   # ระบบลูกค้า
│   └── api/             # API Endpoints
├── components/           # UI Components
│   ├── ui/              # Base components (Button, Input etc.)
│   └── business/        # Business components (InvoiceCard, etc.)
├── lib/                  # Utility functions
└── public/               # Static assets
```

---

<div align="center">
พัฒนาโดยทีม WebShardow
</div>
