"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "@/validators/authValidators";
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
import { signUp } from "@/lib/auth-client";
import { FormError } from "@/components/FormError";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignupForm = () => {
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "centraladmin",
      division: "Dhaka",
      district: "Dhaka",
      area: "Dhanmondi",
      upazila: "Dhaka",
      union: "Dhaka",
      phone: "01736486851",
    },
  });

  const onSubmit = async (values) => {
    console.log(values);
    await signUp.email(
      {
        name: values.name,
        password: values.password,
        email: values.email,
        role: "centraladmin",
        division: "Dhaka",
        district: "Dhaka",
        area: "Dhanmondi",
        upazila: "Dhaka",
        union: "Dhaka",
        phone: "01736486851",
      },
      {
        onRequest: () => {
          setFormError("");
          toast.loading;
        },
        onSuccess: () => {
          toast.success("Login Successful");
          router.push("/admin");
        },
        onError: (ctx) => {
          setFormError(ctx.error.message);
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Create your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormFieldset>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              Sign Up
            </Button>
          </form>
        </Form>
        <div className="mt-5 space-x-1 text-center text-sm">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            Already have an account?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
