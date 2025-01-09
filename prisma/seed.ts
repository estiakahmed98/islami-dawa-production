import { db } from "../lib/db";
import bcrypt from "bcryptjs";

// Super User
const user = {
  name: "Mason",
  email: "mason@example.com",
  password: "12345",
};

async function main() {
  const userCount = await db.user.count();

  if (!userCount) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Create user
    await db.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
  }
}

main()
  .then(async () => {
    console.log("User seeding was successful");
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.log("Error seeding database", error);
    await db.$disconnect();
    process.exit(1);
  });
