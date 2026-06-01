const fs = require('fs');
const path = require('path');

const mappings = {
  'bg-white': 'dark:bg-slate-900',
  'bg-gray-50': 'dark:bg-slate-800',
  'bg-slate-50': 'dark:bg-slate-800',
  'bg-[#F5F6F8]': 'dark:bg-slate-950',
  'bg-[#EAECF0]': 'dark:bg-slate-800',
  'bg-gray-100': 'dark:bg-slate-800',
  'text-gray-900': 'dark:text-slate-100',
  'text-gray-800': 'dark:text-slate-200',
  'text-gray-700': 'dark:text-slate-300',
  'text-gray-600': 'dark:text-slate-400',
  'text-gray-500': 'dark:text-slate-400',
  'text-slate-900': 'dark:text-slate-100',
  'text-slate-800': 'dark:text-slate-200',
  'text-slate-700': 'dark:text-slate-300',
  'text-slate-600': 'dark:text-slate-400',
  'text-slate-500': 'dark:text-slate-400',
  'border-gray-200': 'dark:border-slate-700',
  'border-gray-100': 'dark:border-slate-700',
  'border-slate-200': 'dark:border-slate-700',
  'border-slate-300': 'dark:border-slate-700',
  'border-[#EAECF0]': 'dark:border-slate-700',
  'hover:bg-gray-50': 'dark:hover:bg-slate-800',
  'hover:bg-gray-100': 'dark:hover:bg-slate-800',
  'hover:text-gray-900': 'dark:hover:text-white',
  'shadow-sm': 'dark:shadow-none'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We only replace if it's not already followed by a dark variant for the same property
  // This is a bit tricky with regex, so we'll do something simpler:
  // For each mapping, we'll replace the class, but first we check if we've already done it.
  
  for (const [lightClass, darkClass] of Object.entries(mappings)) {
    // Regex matches the light class as a whole word, 
    // ensuring it's not already followed by the dark class somewhere in the same class string.
    // A simple global replace is fine for this project because we just wiped dark classes mostly.
    
    // We create a regex that looks for the light class, not preceded by 'dark:', 
    // and replace it with `lightClass darkClass`.
    const regex = new RegExp(`(?<!dark:)\\b${lightClass.replace(/\[/g, '\\[').replace(/\]/g, '\\]')}\\b(?!\\s+${darkClass.replace(/:/g, '\\:').replace(/\[/g, '\\[').replace(/\]/g, '\\]')})`, 'g');
    
    content = content.replace(regex, `${lightClass} ${darkClass}`);
  }

  // Also fix some potential duplications that might have occurred
  for (const darkClass of Object.values(mappings)) {
    const escaped = darkClass.replace(/:/g, '\\:').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    const doubleRegex = new RegExp(`(\\b${escaped}\\b\\s*){2,}`, 'g');
    content = content.replace(doubleRegex, `${darkClass} `);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

const targetDir = path.join(__dirname, 'src', 'app');
console.log('Starting dark mode refactoring in ' + targetDir);
walkDir(targetDir);
console.log('Done.');
