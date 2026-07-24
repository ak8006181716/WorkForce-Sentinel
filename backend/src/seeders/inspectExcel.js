import XLSX from 'xlsx';
import path from 'path';

const filePath = 'C:\\Users\\ankit\\Downloads\\workers_dataset.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);

  for (const name of workbook.SheetNames) {
    console.log(`\n--- Sheet: ${name} ---`);
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`Total Rows: ${data.length}`);
    if (data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
      console.log('Sample Rows (first 3):', JSON.stringify(data.slice(0, 3), null, 2));
    }
  }
} catch (err) {
  console.error('Error reading excel file:', err.message);
}
