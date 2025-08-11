//Estiak

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
import { signIn } from "@/lib/auth-client";
import { FormError } from "@/components/FormError";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

type SigninFormProps = {
  /** Comes from `searchParams.error` via the page component */
  initialError?: string;
};

const SigninForm = ({ initialError = "" }: SigninFormProps) => {
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  // Map URL error codes -> human messages shown in the UI
  const mappedInitialError = useMemo(() => {
    if (initialError === "already_logged_in_elsewhere") {
      return "Already logged in on another device.";
    }
    if (initialError === "lock_error") {
      return "Couldn't verify session lock. Please try again.";
    }
    // pass-through any other message you might send
    return initialError || "";
  }, [initialError]);

  // Show the error (if any) on first render
  useEffect(() => {
    if (mappedInitialError) {
      setFormError(mappedInitialError);
      // optional toast for visibility
      if (initialError === "already_logged_in_elsewhere") {
        toast.error("Already logged in on another device");
      } else if (initialError === "lock_error") {
        toast.error("Session lock check failed");
      }
    }
  }, [mappedInitialError, initialError]);

  const form = useForm<yup.InferType<typeof signInSchema>>({
    resolver: yupResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = async (values: yup.InferType<typeof signInSchema>) => {
    await signIn.email(
      { email: values.email, password: values.password },
      {
        onRequest: () => {
          setIsLoading(true);
          setFormError("");
        },
        onSuccess: () => {
          toast.success("Login Successful");
          // If this device owns the lock, middleware will allow /admin.
          // If not, middleware will bounce back here with ?error=already_logged_in_elsewhere
          router.push("/admin");
          router.refresh();
        },
        onError: (ctx) => {
          setFormError(ctx.error.message);
        },
        onFinally: () => setIsLoading(false),
      }
    );
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setFormError("");
    try {
      await authClient.signIn.social(
        { provider: "google", callbackURL: "/admin" },
        {
          onSuccess: () => {
            router.refresh();
            toast.success("Login Successful");
          },
          onError: (ctx) => setFormError(ctx.error.message),
        }
      );
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      toast.error("Google Login Failed. Try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isBusy = isLoading || isGoogleLoading || form.formState.isSubmitting;

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
                        autoComplete="email"
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
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldset>

            <FormError message={formError} />

            <Button type="submit" className="mt-4 w-full" disabled={isBusy}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <Button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-100"
          variant="outline"
          disabled={isBusy}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Signing In...
            </>
          ) : (
            <>
              <FcGoogle size={20} />
              Sign in with Google
            </>
          )}
        </Button>

        <div className="mt-5 space-x-1 text-center text-sm">
          <Link
            href="/auth/forgot-password"
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
