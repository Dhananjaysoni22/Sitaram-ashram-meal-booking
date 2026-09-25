const fs = require('fs');
let s = fs.readFileSync('frontend/src/components/PermissionsMatrix.tsx', 'utf8');

s = s.replace(
  `"WORKERS",`,
  `"WORKERS",
  "MANDIR_WORKERS",`
);

fs.writeFileSync('frontend/src/components/PermissionsMatrix.tsx', s);
console.log("Updated PermissionsMatrix.tsx");
