import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

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

function escapeCsv(str) {
  if (!str) return '';
  const s = String(str).replace(/"/g, '""');
  if (s.search(/("|,|\n)/g) >= 0) {
    return `"${s}"`;
  }
  return s;
}

async function run() {
  const snapshot = await getDocs(collection(db, "products"));
  
  const headers = ['Name', 'Brand', 'Category', 'Subcategory', 'Selling Price', 'MRP', 'Weight', 'Unit', 'Image URL', 'Search Keywords', 'Active'];
  const lines = [headers.join(',')];

  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Fix category
    let category = data.category || 'other';
    if (categoryMap[category]) {
      category = categoryMap[category];
    }

    const row = [
      escapeCsv(data.name),
      escapeCsv(data.brand),
      escapeCsv(category),
      escapeCsv(data.subcategory),
      escapeCsv(data.sellingPrice),
      escapeCsv(data.mrp),
      escapeCsv(data.weight),
      escapeCsv(data.unit),
      escapeCsv(data.image),
      escapeCsv((data.searchKeywords || []).join(', ')),
      escapeCsv(data.isActive)
    ];

    lines.push(row.join(','));
  });

  fs.writeFileSync('C:\\Users\\pavan\\Desktop\\fixed_products.csv', lines.join('\n'));
  console.log('Successfully generated C:\\Users\\pavan\\Desktop\\fixed_products.csv');
  process.exit(0);
}

run().catch(console.error);
