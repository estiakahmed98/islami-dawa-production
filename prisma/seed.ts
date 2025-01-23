// // import { db } from "../lib/db";
// // import bcrypt from "bcryptjs";
// // import { userData, User } from "../app/data/userData";

// const users: Array<User> = Object.values(userData); // Convert object to array

// async function main() {
//   const userCount = await db.user.count(); // Fix the table name to match Prisma schema

//   if (!userCount) {
//     // Hash passwords for each user and format data correctly
//     const usersWithHashedPasswords = await Promise.all(
//       users.map(async (user) => ({
//         ...user,
//         password: await bcrypt.hash(user.password, 10), // Hash the password
//         emailVerified: user.emailVerified ? new Date(user.emailVerified) : null, // Ensure it's Date or null
//         createdAt: new Date(user.createdAt), // Ensure Date format
//         updatedAt: new Date(user.updatedAt), // Ensure Date format
//       }))
//     );

//     // Create users using `createMany`
//     await db.user.createMany({
//       // Ensure `user` matches Prisma schema
//       data: usersWithHashedPasswords,
//       skipDuplicates: true,
//     });

//     console.log("✅ User seeding was successful!");
//   } else {
//     console.log("✅ Users already exist. Skipping seeding.");
//   }
// }

// // Execute the script
// main()
//   .then(async () => {
//     await db.$disconnect();
//   })
//   .catch(async (error) => {
//     console.error("❌ Error seeding database:", error);
//     await db.$disconnect();
//     process.exit(1);
//   });
