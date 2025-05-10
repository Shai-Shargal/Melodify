const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: "Shai@gmail.com" },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    // Hash the current password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Update the user with the hashed password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log("Password updated successfully");
  } catch (error) {
    console.error("Error updating password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
