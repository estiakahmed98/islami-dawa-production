import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import { auth } from "./auth";

// Create a single authentication client instance
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});

// Destructure authentication functions
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  admin,
  getSession,
  updateUser,
  changeEmail,
  changePassword,
} = authClient;
