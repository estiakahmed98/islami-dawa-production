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
    console.log("Sign-in Response:", res);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col rounded-lg">
        <label className="p-2 rounded-lg">Email</label>
        <input
          type="text"
          {...register("email")}
          placeholder="Enter your email"
          className="p-2 rounded-lg"
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div className="flex flex-col ">
        <label className="p-2 rounded-lg">Password</label>
        <input
          type="password"
          {...register("password")}
          placeholder="Enter your password"
          className="p-2 rounded-lg"
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <div className="align-middle">
        <button
          type="submit"
          className="mt-5 py-3 px-5 bg-green-800 rounded-xl"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
