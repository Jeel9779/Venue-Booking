const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const srcApp = path.join(baseDir, 'src/app');

// Define mappings
const fileMappings = [
  // Guards
  { old: 'core/auth-guard.ts', new: 'core/guards/auth.guard.ts' },
  { old: 'core/auth-guard.spec.ts', new: 'core/guards/auth.guard.spec.ts' },
  { old: 'core/role-guard.ts', new: 'core/guards/role.guard.ts' },
  { old: 'core/role-guard.spec.ts', new: 'core/guards/role.guard.spec.ts' },

  // Services
  { old: 'features/dashboard/dashboard-service.ts', new: 'core/services/dashboard.service.ts' },
  { old: 'features/dashboard/dashboard-service.spec.ts', new: 'core/services/dashboard.service.spec.ts' },
  { old: 'features/users/user-service.ts', new: 'core/services/user.service.ts' },
  { old: 'features/users/user-service.spec.ts', new: 'core/services/user.service.spec.ts' },
  { old: 'features/vendors/vendor-service.ts', new: 'core/services/vendor.service.ts' },
  { old: 'features/vendors/vendor-service.spec.ts', new: 'core/services/vendor.service.spec.ts' },
  { old: 'features/venues/venue-service.ts', new: 'core/services/venue.service.ts' },
  { old: 'features/venues/venue-service.spec.ts', new: 'core/services/venue.service.spec.ts' },
  { old: 'features/subscription/service/plan.service.ts', new: 'core/services/plan.service.ts' },
  { old: 'features/subscription/service/plan.service.spec.ts', new: 'core/services/plan.service.spec.ts' },
  { old: 'features/subscription/service/vendor-subscription.services.ts', new: 'core/services/vendor-subscription.service.ts' },
  { old: 'features/subscription/service/vendor-subscription.services.spec.ts', new: 'core/services/vendor-subscription.service.spec.ts' },

  // Models
  { old: 'features/dashboard/dashboard.model.ts', new: 'core/models/dashboard.model.ts' },
  { old: 'features/vendors/vendor.model.ts', new: 'core/models/vendor.model.ts' },
  { old: 'features/venues/venue.model.ts', new: 'core/models/venue.model.ts' },
  { old: 'features/subscription/models/plan.model.ts', new: 'core/models/plan.model.ts' },
  { old: 'features/subscription/models/vendor-subscription.model.ts', new: 'core/models/vendor-subscription.model.ts' },

  // Add Vendor
  { old: 'features/vendors/admin/add-vendor/add-vendor.ts', new: 'features/vendors/add-vendor/add-vendor.ts' },
  { old: 'features/vendors/admin/add-vendor/add-vendor.spec.ts', new: 'features/vendors/add-vendor/add-vendor.spec.ts' },
  { old: 'features/vendors/admin/add-vendor/add-vendor.html', new: 'features/vendors/add-vendor/add-vendor.html' },
  { old: 'features/vendors/admin/add-vendor/add-vendor.css', new: 'features/vendors/add-vendor/add-vendor.css' },
  
  // Layout components
  { old: 'layout/admin-layout/admin-layout.ts', new: 'core/layout/admin-layout/admin-layout.ts' },
  { old: 'layout/admin-layout/admin-layout.spec.ts', new: 'core/layout/admin-layout/admin-layout.spec.ts' },
  { old: 'layout/admin-layout/admin-layout.html', new: 'core/layout/admin-layout/admin-layout.html' },
  { old: 'layout/admin-layout/admin-layout.css', new: 'core/layout/admin-layout/admin-layout.css' },
  
  { old: 'layout/header/header.ts', new: 'core/layout/header/header.ts' },
  { old: 'layout/header/header.spec.ts', new: 'core/layout/header/header.spec.ts' },
  { old: 'layout/header/header.html', new: 'core/layout/header/header.html' },
  { old: 'layout/header/header.css', new: 'core/layout/header/header.css' },

  { old: 'layout/sidebar/sidebar.ts', new: 'core/layout/sidebar/sidebar.ts' },
  { old: 'layout/sidebar/sidebar.spec.ts', new: 'core/layout/sidebar/sidebar.spec.ts' },
  { old: 'layout/sidebar/sidebar.html', new: 'core/layout/sidebar/sidebar.html' },
  { old: 'layout/sidebar/sidebar.css', new: 'core/layout/sidebar/sidebar.css' },
];

const sharedComponents = ['button', 'chart', 'donut-chart', 'insight-card', 'revenue-chart', 'stat-card', 'table', 'venue-list'];
for (const comp of sharedComponents) {
  for (const ext of ['ts', 'spec.ts', 'html', 'css']) {
    fileMappings.push({
      old: `shared/${comp}/${comp}.${ext}`,
      new: `shared/components/${comp}/${comp}.${ext}`
    });
  }
}

for (const ext of ['ts', 'spec.ts', 'html', 'css']) {
  fileMappings.push({
    old: `shared/modal/modal.${ext}`,
    new: `shared/modals/modal/modal.${ext}`
  });
}

const pathToNewPath = {};
fileMappings.forEach(m => {
  if (m.old.endsWith('.ts')) {
    const oldP = m.old.replace(/\.spec\.ts$/, '').replace(/\.ts$/, '');
    const newP = m.new.replace(/\.spec\.ts$/, '').replace(/\.ts$/, '');
    pathToNewPath[oldP] = newP;
  }
});

function getNewPath(oldPathNoExt) {
  return pathToNewPath[oldPathNoExt] || oldPathNoExt;
}

function getNewImportString(newPathNoExt) {
  if (newPathNoExt.startsWith('core/')) return `@core/${newPathNoExt.substring(5)}`;
  if (newPathNoExt.startsWith('shared/')) return `@shared/${newPathNoExt.substring(7)}`;
  if (newPathNoExt.startsWith('features/')) return `@features/${newPathNoExt.substring(9)}`;
  return `./${newPathNoExt}`; // fallback
}

// Find all TS files
function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
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

// 1. Move files
console.log('Moving files...');
for (const mapping of fileMappings) {
  const oldPath = path.join(srcApp, mapping.old);
  const newPath = path.join(srcApp, mapping.new);
  
  if (fs.existsSync(oldPath)) {
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${mapping.old} -> ${mapping.new}`);
  }
}

// After moving, some empty directories might be left. We can ignore them or clean them later.

// 2. Process all TS files (including those we just moved)
const allTsFiles = getFiles(srcApp).filter(f => f.endsWith('.ts'));

console.log('Refactoring imports...');
for (const file of allTsFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  const replaceFn = (match, importPath, beforeStr, afterStr) => {
    if (importPath.startsWith('@')) return match; // skip already absolute
    if (!importPath.startsWith('.')) return match; // node module / angular core

    const currDir = path.dirname(file);
    const resolved = path.resolve(currDir, importPath);
    const relToApp = path.relative(srcApp, resolved).replace(/\\/g, '/');

    const newRelToApp = getNewPath(relToApp);
    const newImportString = getNewImportString(newRelToApp);

    return `${beforeStr}['"]${newImportString}['"]${afterStr}`;
  };

  // match `import { X } from '...'` and `export { X } from '...'`
  const importRegex = /(import|export)(\s+(?:[^"']*)\s+from\s+)['"]([^'"]+)['"]/g;
  content = content.replace(importRegex, (match, impExp, rest, importPath) => {
     if (importPath.startsWith('@') || !importPath.startsWith('.')) return match;
     const currDir = path.dirname(file);
     const resolved = path.resolve(currDir, importPath);
     const relToApp = path.relative(srcApp, resolved).replace(/\\/g, '/');
     const newRelToApp = getNewPath(relToApp);
     const newImportString = getNewImportString(newRelToApp);
     return `${impExp}${rest}'${newImportString}'`;
  });

  // match `import('...')`
  const dynamicRegex = /(import\()['"]([^'"]+)['"](\))/g;
  content = content.replace(dynamicRegex, (match, startStr, importPath, endStr) => {
     if (importPath.startsWith('@') || !importPath.startsWith('.')) return match;
     const currDir = path.dirname(file);
     const resolved = path.resolve(currDir, importPath);
     const relToApp = path.relative(srcApp, resolved).replace(/\\/g, '/');
     const newRelToApp = getNewPath(relToApp);
     const newImportString = getNewImportString(newRelToApp);
     return `${startStr}'${newImportString}'${endStr}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${path.relative(srcApp, file)}`);
  }
}

// 3. Update tsconfig.json
const tsconfigPath = path.join(baseDir, 'tsconfig.json');
let tsconfigStr = fs.readFileSync(tsconfigPath, 'utf8');
// Safely insert baseUrl and paths using regex since it's likely json with comments
if (!tsconfigStr.includes('"baseUrl"')) {
  tsconfigStr = tsconfigStr.replace(/"compilerOptions":\s*\{/, `"compilerOptions": {\n    "baseUrl": "./",\n    "paths": {\n      "@core/*": ["src/app/core/*"],\n      "@shared/*": ["src/app/shared/*"],\n      "@features/*": ["src/app/features/*"]\n    },`);
  fs.writeFileSync(tsconfigPath, tsconfigStr, 'utf8');
  console.log('Updated tsconfig.json');
}

console.log('Done!');
