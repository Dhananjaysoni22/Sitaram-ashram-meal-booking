const fs = require('fs');
let s = fs.readFileSync('frontend/src/pages/Setup.tsx', 'utf8');

// Update State
s = s.replace(
  `const [categories, setCategories] = useState<any[]>([]);`,
  `const [categories, setCategories] = useState<any[]>([]);
  const [mandirCategories, setMandirCategories] = useState<any[]>([]);`
);

s = s.replace(
  `const [activeTab, setActiveTab] = useState<"occasions" | "categories" | "roles" | "permissions" | "festivals">("permissions");`,
  `const [activeTab, setActiveTab] = useState<"occasions" | "categories" | "mandirCategories" | "roles" | "permissions" | "festivals">("permissions");`
);

// Update fetch
s = s.replace(
  `const [occRes, catRes, roleRes, festRes] = await Promise.all([
        getOccasions(), 
        getWorkerCategories(), 
        getRoles(),
        getAllFestivals()
      ]);
      setOccasions(occRes.data.data);
      setCategories(catRes.data.data);
      setRoles(roleRes.data.data);
      setFestivals(festRes.data.data);`,
  `const [occRes, catRes, mandirCatRes, roleRes, festRes] = await Promise.all([
        getOccasions(), 
        getWorkerCategories("ASHRAM"), 
        getWorkerCategories("MANDIR"),
        getRoles(),
        getAllFestivals()
      ]);
      setOccasions(occRes.data.data);
      setCategories(catRes.data.data);
      setMandirCategories(mandirCatRes.data.data);
      setRoles(roleRes.data.data);
      setFestivals(festRes.data.data);`
);

// Update handleCreate
s = s.replace(
  `} else if (activeTab === "categories") {
        await createWorkerCategory(newName);
      } else if (activeTab === "roles") {`,
  `} else if (activeTab === "categories") {
        await createWorkerCategory(newName, "ASHRAM");
      } else if (activeTab === "mandirCategories") {
        await createWorkerCategory(newName, "MANDIR");
      } else if (activeTab === "roles") {`
);

// Update Tabs UI
s = s.replace(
  `{ id: "categories", label: "Worker Categories", icon: <Users size={18} /> },`,
  `{ id: "categories", label: "Ashram Categories", icon: <Users size={18} /> },
            { id: "mandirCategories", label: "Mandir Categories", icon: <Users size={18} /> },`
);

// Update render tab logic
s = s.replace(
  `{activeTab === "categories" && (
            <ListManager
              items={categories}
              onDelete={deleteWorkerCategory}
              refresh={fetchData}
              title="Worker Categories"
            />
          )}`,
  `{activeTab === "categories" && (
            <ListManager
              items={categories}
              onDelete={deleteWorkerCategory}
              refresh={fetchData}
              title="Ashram Worker Categories"
            />
          )}
          {activeTab === "mandirCategories" && (
            <ListManager
              items={mandirCategories}
              onDelete={deleteWorkerCategory}
              refresh={fetchData}
              title="Mandir Worker Categories"
            />
          )}`
);

fs.writeFileSync('frontend/src/pages/Setup.tsx', s);
console.log("Updated Setup.tsx");
