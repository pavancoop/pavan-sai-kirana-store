import fs from 'fs';
import Papa from 'papaparse';

const rawData = fs.readFileSync('raw_products.csv', 'utf-8');
const parsed = Papa.parse(rawData, { header: true, skipEmptyLines: true });

const categories = {
  rice: 'rice-grains',
  dal: 'dal-pulses',
  gram: 'dal-pulses',
  pappu: 'dal-pulses',
  poha: 'breakfast-items',
  atukulu: 'breakfast-items',
  oil: 'oils',
  ghee: 'oils',
  masala: 'spices-masalas',
  powder: 'spices-masalas',
  salt: 'spices-masalas',
  chilli: 'spices-masalas',
  jeera: 'spices-masalas',
  mustard: 'spices-masalas',
  clove: 'spices-masalas',
  cinnamon: 'spices-masalas',
  cardamom: 'spices-masalas',
  turmeric: 'spices-masalas',
  pasupu: 'spices-masalas',
  karam: 'spices-masalas',
  flour: 'packaged-foods',
  pindi: 'packaged-foods',
  atta: 'packaged-foods',
  maida: 'packaged-foods',
  rava: 'packaged-foods',
  sugar: 'packaged-foods',
  jaggery: 'packaged-foods',
  bellam: 'packaged-foods',
  kaju: 'packaged-foods',
  badam: 'packaged-foods',
  kismiss: 'packaged-foods',
  soap: 'personal-care',
  santoor: 'personal-care',
  lux: 'personal-care',
  medimix: 'personal-care',
  dove: 'personal-care',
  cinthol: 'personal-care',
  dettol: 'personal-care',
  lifebuoy: 'personal-care',
  surfexcel: 'cleaning-products',
  rin: 'cleaning-products',
  ariel: 'cleaning-products',
  tide: 'cleaning-products',
  wheel: 'cleaning-products',
  vim: 'cleaning-products',
  exo: 'cleaning-products',
  sabina: 'cleaning-products',
  comfort: 'cleaning-products',
  harpic: 'cleaning-products',
  lizol: 'cleaning-products',
  domex: 'cleaning-products',
  broom: 'household',
  glass: 'household',
  plate: 'household',
  cup: 'household',
  spoon: 'household',
  tissue: 'household',
  cover: 'household',
  tea: 'tea-coffee',
  coffee: 'tea-coffee',
  bru: 'tea-coffee',
  nescafe: 'tea-coffee',
  redlabel: 'tea-coffee',
  taj: 'tea-coffee',
  roses: 'tea-coffee',
  maggi: 'biscuits-snacks',
  lays: 'biscuits-snacks',
  bingo: 'biscuits-snacks',
};

function determineCategory(name) {
  const n = name.toLowerCase();
  for (const [key, val] of Object.entries(categories)) {
    if (n.includes(key)) return val;
  }
  return 'other';
}

const nameCounts = {};
parsed.data.forEach(row => {
  nameCounts[row.Name] = (nameCounts[row.Name] || 0) + 1;
});

const weights5 = ['500g', '1kg', '5kg', '10kg', '25kg'];
const weights4 = ['250g', '500g', '1kg', '5kg'];
const weights3 = ['250g', '500g', '1kg'];
const weights2 = ['500g', '1kg'];

const currentCount = {};

const newRows = parsed.data.map(row => {
  const name = row.Name;
  const count = nameCounts[name];
  currentCount[name] = (currentCount[name] || 0) + 1;
  const idx = currentCount[name] - 1;

  let weight = '1pc';
  let unit = 'pc';

  if (count === 5) weight = weights5[idx];
  else if (count === 4) weight = weights4[idx];
  else if (count === 3) weight = weights3[idx];
  else if (count === 2) weight = weights2[idx];
  else {
    if (determineCategory(name) === 'personal-care' || determineCategory(name) === 'household' || determineCategory(name) === 'cleaning-products') {
      weight = '1pc';
    } else {
      weight = '500g';
    }
  }

  if (weight.includes('kg')) unit = 'kg';
  else if (weight.includes('g')) unit = 'g';
  else if (weight.includes('ml')) unit = 'ml';
  else if (weight.includes('L')) unit = 'L';
  
  const basePrice = 50 + Math.floor(Math.random() * 100);
  let multiplier = 1;
  if (weight === '250g') multiplier = 0.5;
  if (weight === '500g') multiplier = 1;
  if (weight === '1kg') multiplier = 2;
  if (weight === '5kg') multiplier = 10;
  if (weight === '10kg') multiplier = 20;
  if (weight === '25kg') multiplier = 50;

  const mrp = Math.floor(basePrice * multiplier);
  const sp = Math.floor(mrp * 0.9); // 10% discount

  return {
    Name: name,
    Brand: '',
    Category: determineCategory(name),
    Subcategory: '',
    'Selling Price': sp,
    MRP: mrp,
    Weight: weight,
    Unit: unit,
    'Image URL': '',
    'Search Keywords': name.split(' ').join(','),
    Active: 'TRUE'
  };
});

const outCsv = Papa.unparse(newRows);
fs.writeFileSync('C:\\Users\\pavan\\Desktop\\book1_filled.csv', outCsv, 'utf-8');
console.log('done');
