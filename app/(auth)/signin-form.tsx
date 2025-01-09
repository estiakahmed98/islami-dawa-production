"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { yupResolver } from "@hookform/resolvers/yup";

import { useRouter } from "next/navigation";
import { signInSchema } from "@/validators/authValidators";

export default function SigninForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: { email: string; password: string }) => {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
      alert("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input
          type="text"
          {...register("email")}
          placeholder="Enter your email"
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          {...register("password")}
          placeholder="Enter your password"
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
}


