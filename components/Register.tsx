"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import { admin } from "@/lib/auth-client";
import * as yup from "yup";
import { signUpSchemaUser } from "@/validators/authValidators";

// Define props for Register component
interface RegisterProps {
  addUserToTree: (newUser: { id: number; label: string; user: string }) => void;
}

const Register: React.FC<RegisterProps> = ({ addUserToTree }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    area: "",
    markaz: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await signUpSchemaUser.validate(formData, { abortEarly: false });

      const newUser = {
        id: Math.floor(Math.random() * 1000), // Generate unique ID
        label: formData.name,
        user: formData.email,
      };

      // Add user to tree dynamically
      addUserToTree(newUser);

      // Notify backend to save user
      await admin.createUser(
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          data: {
            division: formData.division,
            district: formData.district,
            upazila: formData.upazila,
            union: formData.union,
            area: formData.area,
            markaz: formData.markaz,
            phone: formData.phone,
          },
        },
        {
          onSuccess: () => {
            toast.success("User created successfully!");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        error.inner.forEach((err) => toast.error(err.message));
      } else {
        console.error("Error creating user:", error);
        toast.error("Something went wrong! Please try again.");
      }
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Add User</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="User Name" onChange={handleChange} className="p-2 w-full border" />
        <button type="submit" className="mt-2 p-2 bg-blue-500 text-white">Add User</button>
      </form>
    </div>
  );
};

export default Register;
