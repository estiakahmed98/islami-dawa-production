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

// "use client";

// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useForm } from "react-hook-form";
// import { signIn } from "next-auth/react";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormFieldset,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { signInSchema } from "@/validators/authValidators";

// const SigninForm = () => {
//   const form = useForm<yup.InferType<typeof signInSchema>>({
//     resolver: yupResolver(signInSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (values: yup.InferType<typeof signInSchema>) => {
//     try {
//       const result = await signIn("credentials", {
//         redirect: true,
//         callbackUrl: "/dashboard", // Update this with your desired redirect URL after successful login
//         ...values,
//       });

//       if (!result?.ok) {
//         alert("Invalid credentials or login failed");
//       }
//     } catch (error) {
//       console.error("Error signing in:", error);
//       alert("An error occurred while signing in.");
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="items-center">
//         <CardTitle className="text-2xl">Sign In</CardTitle>
//         <CardDescription>Enter your account details to login</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={form.handleSubmit(onSubmit)}>
//           <FormFieldset>
//             {/* Email Field */}
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="Enter email address"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             {/* Password Field */}
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       placeholder="Enter password"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </FormFieldset>
//           <Button type="submit" className="mt-4 w-full">
//             Sign In
//           </Button>
//         </form>
//         <div className="mt-5 space-x-1 text-center text-sm">
//           <Link
//             href="/auth/forgotpass"
//             className="text-sm text-muted-foreground hover:underline"
//           >
//             Forgot Password?
//           </Link>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default SigninForm;
