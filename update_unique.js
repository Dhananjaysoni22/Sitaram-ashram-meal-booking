const fs = require('fs');
let s = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

s = s.replace(
  `  type      String   @default("ASHRAM")
  name      String   @unique`,
  `  type      String   @default("ASHRAM")
  name      String`
);

s = s.replace(
  `model SetupWorkerCategory {
  id        String   @id @default(uuid())
  type      String   @default("ASHRAM")
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}`,
  `model SetupWorkerCategory {
  id        String   @id @default(uuid())
  type      String   @default("ASHRAM")
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  @@unique([name, type])
}`
);

fs.writeFileSync('backend/prisma/schema.prisma', s);
console.log("Updated unique constraint");
