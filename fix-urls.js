const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const folders = ['frontend-user/src', 'frontend-admin/src'];

folders.forEach(folder => {
  const fullPath = path.join(__dirname, folder);
  if(!fs.existsSync(fullPath)) return;
  
  walkDir(fullPath, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('http://localhost:5000')) {
        let newContent = content.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");
        
        // Fix string interpolations where we just injected template literal syntax into single or double quotes
        // E.g., 'http://localhost:5000/api/...' becomes '${import...}/api/...' which is still a string.
        // It needs to be inside backticks for template literal injection to work.
        newContent = newContent.replace(/'\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}([^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
        newContent = newContent.replace(/"\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}([^"]*)"/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

        // Handle existing backticks: `http://localhost:5000/api/parking/slots/${zone._id}` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/parking/slots/${zone._id}`
        // In this case, `http://localhost:5000` is already inside backticks, so replacing it with `${import...}` is exactly correct!
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated: ' + filePath);
      }
    }
  });
});
