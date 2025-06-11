import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn đến file seed
const seedFile = path.join(__dirname, '../src/seeds/index.js');

console.log('Bắt đầu chạy seeder...');

// Chạy file seed
exec(`node ${seedFile}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Lỗi khi chạy seeder: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
}); 