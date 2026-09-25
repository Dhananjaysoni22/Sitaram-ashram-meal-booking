const fs = require('fs');

// Layout.tsx
let l = fs.readFileSync('frontend/src/components/Layout.tsx', 'utf8');
l = l.replace(
  `{ id: "WORKERS", name: t("Workers"), path: "/workers", icon: Users },`,
  `{ id: "WORKERS", name: t("Workers"), path: "/workers", icon: Users },
    { id: "MANDIR_WORKERS", name: t("MandirWorkers", "Mandir Workers"), path: "/mandir-workers", icon: Users },`
);
fs.writeFileSync('frontend/src/components/Layout.tsx', l);

// App.tsx
let a = fs.readFileSync('frontend/src/App.tsx', 'utf8');
a = a.replace(
  `import Workers from './pages/Workers';`,
  `import Workers from './pages/Workers';
import MandirWorkers from './pages/MandirWorkers';`
);
a = a.replace(
  `<Route path="/workers" element={<ProtectedRoute screenId="WORKERS"><Workers /></ProtectedRoute>} />`,
  `<Route path="/workers" element={<ProtectedRoute screenId="WORKERS"><Workers /></ProtectedRoute>} />
            <Route path="/mandir-workers" element={<ProtectedRoute screenId="MANDIR_WORKERS"><MandirWorkers /></ProtectedRoute>} />`
);
fs.writeFileSync('frontend/src/App.tsx', a);

console.log("Updated Layout and App routes");
