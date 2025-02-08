"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema } from "@/validators/authValidators";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormFieldset,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";
import { FormError } from "@/components/FormError";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

const SigninForm = () => {
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const session = useSession();

  const form = useForm<yup.InferType<typeof signInSchema>>({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: yup.InferType<typeof signInSchema>) => {
    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setFormError("");
        },
        onSuccess: () => {
          toast.success("Login Successful");
          router.push("/admin");
        },
        onError: (ctx) => {
          setFormError(ctx.error.message);
        },
      }
    );
  };

  // Corrected Google Sign-In Function
  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social(
        { provider: "google" },
        {
          onRequest: () => {
            setFormError("");
          },
          onSuccess: async () => {
            toast.success("Login Successful");
            // ✅ Wait for session to be available before redirecting
            const interval = setInterval(async () => {
              const session = await authClient.getSession();
              if (session?.data?.user) {
                clearInterval(interval);
                router.push("/admin");
              }
            }, 500);
          },
          onError: (ctx) => {
            setFormError(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error("Google Login Failed. Try again.");
    }
  };

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Enter your account details to login</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormFieldset>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldset>
            <FormError message={formError} />
            <Button type="submit" className="mt-4 w-full">
              Sign In
            </Button>
          </form>
        </Form>

        {/* Google Sign-In Button */}
        <Button
          onClick={handleGoogleLogin}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          <FcGoogle size={20} />
          Sign in with Google
        </Button>

        <div className="mt-5 space-x-1 text-center text-sm">
          <Link
            href="/auth/sign-up"
            className="text-sm text-muted-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SigninForm;
