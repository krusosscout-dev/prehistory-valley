# หุบเขาแห่งกาลเวลา

สื่อการเรียนรู้เชิงเกม วิชาประวัติศาสตร์ ม.1 เรื่อง การแบ่งยุคสมัยก่อนประวัติศาสตร์
เว็บแอปแบบไฟล์ HTML ล้วน ไม่ต้อง build ใช้ **Firebase** เก็บห้องเรียนและคะแนน และใช้ **Vercel** เผยแพร่เว็บ

## โครงสร้างไฟล์

```
prehistory-valley/
├── public/
│   ├── index.html            ตัวสื่อทั้งหมด
│   ├── firebase-config.js    ค่าตั้งค่า Firebase และอีเมลผู้ดูแล  ← ต้องแก้
│   └── firebase-adapter.js   ตัวเชื่อม Firebase (ไม่ต้องแก้)
├── firestore.rules           กฎความปลอดภัยของฐานข้อมูล            ← ต้องแก้อีเมล
├── firebase.json             สำหรับ deploy กฎด้วย Firebase CLI
├── .firebaserc               ชื่อโปรเจกต์ Firebase                ← ต้องแก้ (ถ้าใช้ CLI)
├── vercel.json               ตั้งค่า Vercel ให้เสิร์ฟโฟลเดอร์ public
└── README.md
```

## ขั้นที่ 1 สร้างโปรเจกต์ Firebase

1. เข้า https://console.firebase.google.com แล้วกด **Add project** ตั้งชื่อ เช่น `prehistory-valley` (ปิด Google Analytics ได้)
2. **Authentication**: เมนู Build → Authentication → Get started → แท็บ Sign-in method แล้วเปิด 2 วิธี
   - **Anonymous** สำหรับนักเรียน ไม่ต้องสมัครสมาชิก
   - **Google** สำหรับครู ใช้สร้างและจัดการห้องเรียน
3. **Firestore**: เมนู Build → Firestore Database → Create database เลือก **Production mode** และเลือก location `asia-southeast1` (สิงคโปร์) ซึ่งใกล้ไทยที่สุด
4. **ลงทะเบียนเว็บแอป**: Project settings (รูปเฟือง) → General → Your apps → ไอคอน `</>` ตั้งชื่อแล้วกด Register app จะได้ค่า `firebaseConfig`
5. เปิดไฟล์ `public/firebase-config.js` วางค่า `firebaseConfig` แทนค่า `YOUR_...` และใส่อีเมล Google ของผู้ดูแลสื่อใน `ADMIN_EMAILS`

> ค่าใน `firebase-config.js` เปิดเผยได้ เพราะเป็นค่าสาธารณะของเว็บแอปทุกตัว ความปลอดภัยของข้อมูลควบคุมด้วย `firestore.rules`

## ขั้นที่ 2 ติดตั้งกฎความปลอดภัย (สำคัญมาก)

แก้อีเมลในฟังก์ชัน `isAdmin()` ของไฟล์ `firestore.rules` ให้ตรงกับ `ADMIN_EMAILS` แล้วเลือกติดตั้งวิธีใดวิธีหนึ่ง

**วิธี A: ผ่านหน้าเว็บ (ง่ายที่สุด)**
Firestore Database → แท็บ **Rules** → ลบของเดิม แล้ววางเนื้อหาทั้งไฟล์ `firestore.rules` → กด **Publish**

**วิธี B: ผ่าน Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
# แก้ YOUR_PROJECT_ID ใน .firebaserc ให้เป็น Project ID จริง
firebase deploy --only firestore:rules
```

กฎนี้กำหนดว่า
- ทุกคนอ่านข้อมูลห้องเรียนและกระดานคะแนนได้
- เฉพาะครูที่เข้าสู่ระบบด้วย Google สร้างห้องเรียนได้ และลบได้เฉพาะห้องของตัวเอง
- นักเรียนแต่ละเครื่องเขียนได้เฉพาะคะแนนของตัวเอง และส่งคะแนนได้เฉพาะห้องที่มีอยู่จริง
- ครูเจ้าของห้องล้างคะแนนในห้องตัวเองได้ ส่วนผู้ดูแลจัดการได้ทุกห้อง

## ขั้นที่ 3 อัปขึ้น Git (GitHub)

สร้าง repository ใหม่ที่ https://github.com/new (เลือก Public หรือ Private ก็ได้) แล้วรันคำสั่งในโฟลเดอร์ `prehistory-valley`

```bash
git init
git add .
git commit -m "หุบเขาแห่งกาลเวลา เวอร์ชันแรก"
git branch -M main
git remote add origin https://github.com/ชื่อบัญชี/prehistory-valley.git
git push -u origin main
```

## ขั้นที่ 4 เผยแพร่ด้วย Vercel

1. เข้า https://vercel.com เข้าสู่ระบบด้วย GitHub
2. กด **Add New… → Project** แล้ว Import repository `prehistory-valley`
3. ตั้งค่า **Framework Preset: Other** ไม่ต้องใส่ Build Command เพราะ `vercel.json` กำหนดให้เสิร์ฟโฟลเดอร์ `public` อยู่แล้ว
4. กด **Deploy** จะได้ลิงก์ เช่น `https://prehistory-valley.vercel.app`

ต่อจากนี้ทุกครั้งที่ `git push` Vercel จะอัปเดตเว็บให้อัตโนมัติ

## ขั้นที่ 5 อนุญาตโดเมนให้เข้าสู่ระบบ Google ได้

Firebase Console → Authentication → **Settings** → **Authorized domains** → Add domain แล้วใส่
- `prehistory-valley.vercel.app` (โดเมนที่ได้จาก Vercel)
- โดเมนของโรงเรียน ถ้าผูกไว้

ถ้าข้ามขั้นนี้ ครูจะกดเข้าสู่ระบบด้วย Google ไม่ได้

## ขั้นที่ 6 ทดสอบ

1. เปิดลิงก์ Vercel → กด **🏫 สำหรับครู: สร้างรหัสห้องเรียน** → เข้าสู่ระบบด้วย Google → สร้างรหัสห้อง
2. เปิดลิงก์อีกครั้งในโหมดไม่ระบุตัวตน (incognito) หรือบนอีกเครื่อง ตั้งชื่อ ใส่รหัสห้อง แล้วเล่น
3. ที่เครื่องครู กด 🏆 จะเห็นคะแนนขึ้นแบบเรียลไทม์
4. ผู้ดูแลกด **❔ วิธีเล่น → 📊 ภาพรวมการใช้งาน** จะเห็นทุกโรงเรียน ทุกครู และทุกห้องที่กำลังใช้งาน

## ใช้กับครูโรงเรียนอื่น

ส่งลิงก์ Vercel ให้ได้เลย ครูแต่ละคนเข้าสู่ระบบด้วย Google ของตัวเองแล้วสร้างรหัสห้องเรียนเอง คะแนนแต่ละห้องแยกกัน ผู้ดูแลเห็นการใช้งานทั้งหมดในหน้าภาพรวม

## ค่าใช้จ่าย

Firebase แผนฟรี (Spark) ให้อ่าน 50,000 ครั้ง และเขียน 20,000 ครั้งต่อวัน สื่อนี้ออกแบบให้ประหยัดไว้แล้ว
- แต่ละเครื่องส่งคะแนนไม่เกิน 1 ครั้งต่อ 15 วินาที
- กระดานคะแนนเชื่อมต่อสดเฉพาะตอนที่เปิดดูอยู่

ห้องเรียน 40 คน ใช้ประมาณ 2,000–4,000 การเขียนต่อคาบ จึงพอสำหรับหลายห้องต่อวัน ถ้าใช้พร้อมกันหลายโรงเรียนจนเกินโควตา ให้อัปเกรดเป็นแผน Blaze ซึ่งจ่ายตามใช้จริง ค่าใช้จ่ายในระดับห้องเรียนต่ำมาก และควรตั้ง Budget alert ไว้

## ทำงานแบบออฟไลน์

ถ้ายังไม่ได้ตั้งค่า Firebase หรือไม่มีอินเทอร์เน็ต สื่อยังเล่นได้ครบ แต่ความคืบหน้าและคะแนนจะเก็บไว้ในเครื่องนั้นเท่านั้น

## ทดสอบบนเครื่องตัวเอง

ไฟล์ JavaScript แบบ module เปิดตรง ๆ ด้วย `file://` ไม่ได้ ต้องเปิดผ่านเว็บเซิร์ฟเวอร์

```bash
cd public
python3 -m http.server 8000
# เปิด http://localhost:8000
```

ถ้าจะทดสอบเข้าสู่ระบบด้วย Google บนเครื่องตัวเอง ต้องมี `localhost` อยู่ใน Authorized domains (Firebase ใส่ไว้ให้เป็นค่าเริ่มต้น)
