import { auth } from "@/lib/auth";
import SigninForm from "./signin-form";
import { redirect } from "next/navigation";

const SignInPage = async () => {
  const session = await auth();
  if (session) redirect("/"); // Redirect if the user is already authenticated

  return <SigninForm />;
};

export default SignInPage;
