const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.users.findMany();

    console.log(users);
  } catch (error) {
    console.error(error);
  }
}

main();
