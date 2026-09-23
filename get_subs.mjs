import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-48PNzVXkXhVqK_GQLxLFlWm_Ffo3xlg",
  authDomain: "pavan-sai-kgs.firebaseapp.com",
  projectId: "pavan-sai-kgs",
  storageBucket: "pavan-sai-kgs.firebasestorage.app",
  messagingSenderId: "393496843671",
  appId: "1:393496843671:web:8891dd253336293434e0d2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snapshot = await getDocs(collection(db, "products"));
  const catMap = new Map();

  snapshot.forEach(doc => {
    const data = doc.data();
    const cat = data.category || 'Uncategorized';
    const sub = data.subcategory || '';
    if (!catMap.has(cat)) catMap.set(cat, new Set());
    if (sub) catMap.get(cat).add(sub);
  });

  for (const [cat, subs] of catMap.entries()) {
    console.log(`\n**Category: ${cat}**`);
    if (subs.size === 0) console.log("  - (No specific subcategories)");
    for (const sub of subs) {
      console.log(`  - ${sub}`);
    }
  }
  process.exit(0);
}

run().catch(console.error);
