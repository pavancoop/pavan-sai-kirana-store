import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

// Map old formatting to valid slugs
const categoryMap = {
  'Rice & Grains': 'rice-grains',
  'Rice & grains': 'rice-grains',
  'Dal & Pulses': 'dal-pulses',
  'Oils': 'oils',
  'Spices & Masalas': 'spices-masalas',
  'Pooja & Religious': 'pooja-religious',
  'Biscuits & Snacks': 'biscuits-snacks',
  'Tea & Coffee': 'tea-coffee',
  'Breakfast Items': 'breakfast-items',
  'Packaged Foods': 'packaged-foods',
  'Personal Care': 'personal-care',
  'Household': 'household',
  'Cleaning Products': 'cleaning-products',
  'Fresh Produce': 'fresh-produce',
  'Baby Products': 'baby-products'
};

async function run() {
  try {
    await signInWithEmailAndPassword(auth, "pavan@pavan-sai-kgs.com", "Admin@123");
    console.log("Logged in successfully!");
  } catch (err) {
    console.error("Login failed:", err.message);
    process.exit(1);
  }

  const snapshot = await getDocs(collection(db, "products"));
  let updatedCount = 0;

  for (const document of snapshot.docs) {
    const data = document.data();
    const currentCat = data.category;
    
    // If it exists in the map, it means it's improperly formatted
    if (categoryMap[currentCat]) {
      const correctSlug = categoryMap[currentCat];
      await updateDoc(doc(db, "products", document.id), {
        category: correctSlug
      });
      console.log(`Updated ${data.name}: ${currentCat} -> ${correctSlug}`);
      updatedCount++;
    } else {
      // maybe it's already lowercased, or unrecognized.
      if (!currentCat.match(/^[a-z0-9-]+$/)) {
         console.log(`[WARNING] Unmapped weird category found: ${currentCat} on ${data.name}`);
      }
    }
  }

  console.log(`\nMigration complete. Updated ${updatedCount} products.`);
  process.exit(0);
}

run().catch(console.error);
