import * as yup from "yup";

export const signInSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  password: yup.string().required("Password is required"),
});

export const signUpSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  role: yup.string().optional(),
  division: yup.string().optional(),
  district: yup.string().optional(),
  area: yup.string().optional(),
  upazila: yup.string().optional(),
  union: yup.string().optional(),
  markaz: yup.string().optional(),
  phone: yup.string().optional(),
});
