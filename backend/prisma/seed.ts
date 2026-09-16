import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  const passwordHash = await bcrypt.hash('1080', 10);

  // 1. Create a dummy super admin
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Ashram Admin',
      username: 'admin',
      email: 'admin@ashram.com',
      passwordHash: passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  // Create a staff user
  const staffHash = await bcrypt.hash('1234', 10);
  await prisma.user.upsert({
    where: { username: 'staff1' },
    update: {},
    create: {
      name: 'Booking Coordinator',
      username: 'staff1',
      passwordHash: staffHash,
      role: 'BOOKING_COORDINATOR',
      isActive: true
    }
  });

  console.log('Created Super Admin (admin) and Staff (staff1)');

  // 2. Create some dummy bookings only in development if none exist
  if (process.env.NODE_ENV !== 'production') {
    const bookingCount = await prisma.booking.count();
    if (bookingCount === 0) {
      const today = new Date();
      await prisma.booking.create({
        data: {
          date: today,
          mealType: 'BALBHOG',
          status: 'BOOKED',
          sponsorName: 'Rahul Desai',
          mobileNumber: '9876543210',
          cityLocation: 'Mumbai',
          occasion: 'Birthday',
          monksCount: 10,
          guestsCount: 5,
          totalCount: 15,
          specialInstructions: '1. Roti\n2. Sabzi'
        }
      });
      console.log('Created 1 dummy booking');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
