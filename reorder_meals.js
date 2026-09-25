const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Home.tsx', 'utf8');

const oldMeals = `  const meals = [
    { type: "BALBHOG", name: t("Balbhog"), subtitle: t("BalbhogDesc") },
    { type: "RAJBHOG", name: t("Rajbhog"), subtitle: t("RajbhogDesc") },
    {
      type: "SAYANKALIN",
      name: t("Sayankalin"),
      subtitle: t("SayankalinDesc"),
    },
    {
      type: "RAJBHOG_FIRST_FLOOR",
      name: t("RajbhogFF"),
      subtitle: t("RajbhogFFDesc"),
    },
    {
      type: "SAYANKALIN_FIRST_FLOOR",
      name: t("SayankalinFF"),
      subtitle: t("SayankalinFFDesc"),
    },
  ];`;

const newMeals = `  const meals = [
    { type: "BALBHOG", name: t("Balbhog"), subtitle: t("BalbhogDesc") },
    { type: "RAJBHOG", name: t("Rajbhog"), subtitle: t("RajbhogDesc") },
    {
      type: "RAJBHOG_FIRST_FLOOR",
      name: t("RajbhogFF"),
      subtitle: t("RajbhogFFDesc"),
    },
    {
      type: "SAYANKALIN",
      name: t("Sayankalin"),
      subtitle: t("SayankalinDesc"),
    },
    {
      type: "SAYANKALIN_FIRST_FLOOR",
      name: t("SayankalinFF"),
      subtitle: t("SayankalinFFDesc"),
    },
  ];`;

c = c.replace(oldMeals, newMeals);
fs.writeFileSync('frontend/src/pages/Home.tsx', c);
console.log("Done");
