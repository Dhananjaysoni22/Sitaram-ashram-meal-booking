const fs = require('fs');

let m = fs.readFileSync('frontend/src/components/WorkerProfileModal.tsx', 'utf8');

m = m.replace(
  /key=\{\\`empty-\\\$\{i\}\\`\}/g,
  `key={\`empty-\${i}\`}`
);
m = m.replace(
  /className=\{\\`aspect-square/g,
  `className={\`aspect-square`
);
m = m.replace(
  /hover:border-gray-200'\\n\s*\\\}\`/g,
  `hover:border-gray-200'\n                        }\``
);
// just to be sure I will also do a blanket replace of {\` and \`} and \${
m = m.replace(/\\`/g, "`");
m = m.replace(/\\\$/g, "$");

fs.writeFileSync('frontend/src/components/WorkerProfileModal.tsx', m);
console.log("Fixed syntax");
