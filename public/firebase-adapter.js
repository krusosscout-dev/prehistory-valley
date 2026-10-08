// เชื่อมแอปกับ Firebase (Firestore + Authentication)
// แอปเรียกใช้ผ่าน window.BACKEND.use("db") และ window.BACKEND.use("user")
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAILS } from "./firebase-config.js";

async function start() {
  if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_")) {
    console.warn("ยังไม่ได้ตั้งค่า firebase-config.js แอปจะทำงานแบบออฟไลน์");
    return null;
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const fs = getFirestore(app);

  // นักเรียนเข้าแบบไม่ระบุตัวตน (anonymous) อัตโนมัติ ไม่ต้องสมัครสมาชิก
  await new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, async (u) => {
      if (u) { stop(); resolve(); return; }
      try { await signInAnonymously(auth); } catch (e) { console.error(e); stop(); resolve(); }
    });
  });
  if (!auth.currentUser) return null;

  const err = (e) => ({ code: e && e.code === "permission-denied" ? "invalid_argument" : (e && e.code) || "unavailable", message: e && e.message });
  const wrapDoc = (s) => ({ id: s.id, exists: s.exists(), data: () => s.data(), metadata: {} });
  const wrapQ = (qs) => ({ docs: qs.docs.map(wrapDoc), size: qs.size, empty: qs.empty });
  const mkQuery = (path, cons = []) => ({
    where: (f, op, v) => mkQuery(path, [...cons, where(f, op, v)]),
    get: async () => { try { return wrapQ(await getDocs(query(collection(fs, path), ...cons))); } catch (e) { throw err(e); } },
    onSnapshot: (next, onErr) => onSnapshot(query(collection(fs, path), ...cons), (qs) => next(wrapQ(qs)), (e) => onErr && onErr(err(e))),
    doc: (id) => db.doc(path + "/" + id)
  });
  const db = {
    doc: (p) => ({
      get: async () => { try { return wrapDoc(await getDoc(doc(fs, p))); } catch (e) { throw err(e); } },
      set: async (d) => { try { await setDoc(doc(fs, p), d); } catch (e) { throw err(e); } },
      delete: async () => { try { await deleteDoc(doc(fs, p)); } catch (e) { throw err(e); } }
    }),
    collection: (p) => mkQuery(p)
  };
  const cur = () => auth.currentUser;
  const user = {
    id: async () => (cur() ? cur().uid : null),
    isAnonymous: () => !cur() || cur().isAnonymous,
    email: () => (cur() && cur().email) || "",
    displayName: () => (cur() && cur().displayName) || "",
    isOwner: async () => !!(cur() && cur().email && ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(cur().email.toLowerCase())),
    canEdit: async () => false,
    signInTeacher: async () => { await signInWithPopup(auth, new GoogleAuthProvider()); return cur(); },
    signOut: async () => { await signOut(auth); await signInAnonymously(auth); }
  };
  return { use: async (name) => (name === "db" ? db : name === "user" ? user : null) };
}

start().then((api) => window.__fbResolve(api)).catch((e) => { console.error(e); window.__fbResolve(null); });
