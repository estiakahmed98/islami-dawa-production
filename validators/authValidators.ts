import * as yup from "yup";

export const signInSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  password: yup.string().required("Password is required"),
});

export const signUpSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  name: yup.string().required("Name is required"),
  emailVerified: yup.string().optional(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"), // Enforce minimum length
  image: yup.string().optional(),
  division: yup.string().optional(),
  role: yup.string().optional(),
  district: yup.string().optional(),
  area: yup.string().optional(),
  upazila: yup.string().optional(),
  union: yup.string().optional(),
  markaz: yup.string().optional(),
  phone: yup.string().optional(),
});
