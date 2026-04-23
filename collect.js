const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src/app');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getFiles(srcApp);
const tsFiles = files.filter(f => f.endsWith('.ts'));

console.log(tsFiles.map(f => path.relative(srcApp, f).replace(/\\/g, '/')).join('\n'));
