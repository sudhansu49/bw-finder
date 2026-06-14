const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, passwordLength: u.password.length })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
