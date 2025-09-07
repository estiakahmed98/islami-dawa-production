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
import { FormError } from "@/components/FormError";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type SigninFormProps = {
  /** Comes from `searchParams.error` via the page component */
  initialError?: string;
};

const SigninForm = ({ initialError = "" }: SigninFormProps) => {
  const t = useTranslations("SigninForm");
  const locale = useLocale();
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  // Map URL error codes -> human messages shown in the UI
  const mappedInitialError = useMemo(() => {
    if (initialError === "already_logged_in_elsewhere") {
      return t("errors.alreadyLoggedInElsewhere");
    }
    if (initialError === "lock_error") {
      return t("errors.lockError");
    }
    // pass-through any other message you might send
    return initialError || "";
  }, [initialError, t]);

  // Show the error (if any) on first render
  useEffect(() => {
    if (mappedInitialError) {
      setFormError(mappedInitialError);
      // optional toast for visibility
      if (initialError === "already_logged_in_elsewhere") {
        toast.error(t("errors.alreadyLoggedInElsewhere"));
      } else if (initialError === "lock_error") {
        toast.error(t("errors.sessionLockFailed"));
      }
    }
  }, [mappedInitialError, initialError, t]);

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
          toast.success(t("toasts.loginSuccessful"));
          router.push(`/${locale}/admin`);
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
      await signIn.social(
        { provider: "google", callbackURL: `/${locale}/admin` },
        {
          onSuccess: () => {
            router.refresh();
            toast.success(t("toasts.loginSuccessful"));
          },
          onError: (ctx: any) => setFormError(ctx.error.message),
        }
      );
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      toast.error(t("toasts.googleLoginFailed"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isBusy = isLoading || isGoogleLoading || form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
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
                    <FormLabel>{t("fields.email.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("fields.email.placeholder")}
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
                    <FormLabel>{t("fields.password.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("fields.password.placeholder")}
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
                  {t("buttons.signingIn")}
                </>
              ) : (
                t("buttons.signIn")
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
              {t("buttons.signingIn")}
            </>
          ) : (
            <>
              <FcGoogle size={20} />
              {t("buttons.signInWithGoogle")}
            </>
          )}
        </Button>

        <div className="mt-5 space-x-1 text-center text-sm">
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-sm text-muted-foreground hover:underline"
          >
            {t("links.forgotPassword")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SigninForm;
