// ===== ตั้งค่า Firebase =====
// คัดลอกค่าจาก Firebase Console > Project settings > General > Your apps > Web app
// ค่าเหล่านี้เปิดเผยได้ (เป็นค่าสาธารณะของเว็บแอป) ความปลอดภัยควบคุมด้วย firestore.rules
export const firebaseConfig = {
  apiKey: "AIzaSyB7TWWOTPZrtr9lztZaXT7-hzAXhmYgrQ8",
  authDomain: "prehistory-valley.firebaseapp.com",
  projectId: "prehistory-valley",
  storageBucket: "prehistory-valley.firebasestorage.app",
  messagingSenderId: "356050490331",
  appId: "1:356050490331:web:fcaf190263c6cb99250dfe"
};

// อีเมลของผู้ดูแลสื่อ (เห็นหน้า "ภาพรวมการใช้งาน" ทุกโรงเรียน)
// ต้องตรงกับรายชื่อใน firestore.rules ด้วย
export const ADMIN_EMAILS = ["krusossocial5344@gmail.com"];
