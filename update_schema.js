const fs = require('fs');

let s = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

s = s.replace(
  `model Worker {
  id           String       @id @default(uuid())
  name         String`,
  `model Worker {
  id           String       @id @default(uuid())
  workerType   String       @default("ASHRAM")
  name         String`
);

s = s.replace(
  `model SetupWorkerCategory {
  id        String   @id @default(uuid())
  name      String   @unique`,
  `model SetupWorkerCategory {
  id        String   @id @default(uuid())
  type      String   @default("ASHRAM")
  name      String`
);

fs.writeFileSync('backend/prisma/schema.prisma', s);
console.log("Updated schema");
