import { db } from "../lib/db";
import bcrypt from "bcryptjs";
import { userData, User } from "../app/data/userData";

const users: Array<User> = Object.values(userData); // Convert object to array

async function main() {
  const userCount = await db.user.count();

  if (!userCount) {
    // Hash passwords for each user
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10), // Hash the password
      }))
    );

    // Create users using `createMany`
    await db.user.createMany({
      data: usersWithHashedPasswords,
      skipDuplicates: true,
    });

    console.log("User seeding was successful");
  } else {
    console.log("Users already exist. Skipping seeding.");
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error seeding database:", error);
    await db.$disconnect();
    process.exit(1);
  });
