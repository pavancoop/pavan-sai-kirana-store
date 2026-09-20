import fs from 'fs';
import { demoProducts } from './src/data/demo-products';

const headers = ['Name', 'Brand', 'Category', 'Subcategory', 'Selling Price', 'MRP', 'Weight', 'Unit', 'Image URL', 'Search Keywords', 'Active'];

const rows = demoProducts.map(p => {
  return [
    `"${p.name.replace(/"/g, '""')}"`,
    `"${(p.brand || '').replace(/"/g, '""')}"`,
    `"${(p.category || '').replace(/"/g, '""')}"`,
    `"${(p.subcategory || '').replace(/"/g, '""')}"`,
    p.sellingPrice,
    p.mrp,
    `"${(p.weight || '').replace(/"/g, '""')}"`,
    `"${(p.unit || '').replace(/"/g, '""')}"`,
    `"${(p.image || '').replace(/"/g, '""')}"`,
    `"${(p.searchKeywords ? p.searchKeywords.join(',') : '').replace(/"/g, '""')}"`,
    p.isActive ? 'TRUE' : 'FALSE'
  ].join(',');
});

const csvContent = headers.join(',') + '\n' + rows.join('\n');
fs.writeFileSync('C:\\Users\\pavan\\Desktop\\Pavan Sai KGS\\store\\demo_products.csv', csvContent, 'utf-8');
console.log('CSV created');
