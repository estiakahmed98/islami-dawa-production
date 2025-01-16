"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import {
  divisions_en,
  districts_en,
  upazilas_en,
  unions_en,
} from "@/app/data/english";

// Types
type Division = {
  value: number;
  title: string;
};

type District = {
  value: number;
  title: string;
};

type Upazila = {
  value: number;
  title: string;
};

type Union = {
  value: number;
  title: string;
};

const Register = () => {
  const router = useRouter();

  const [language, setLanguage] = useState("bn");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    markaz: "",
    phone: "",
    email: "",
    password: "",
  });

  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [upazilasList, setUpazilasList] = useState<Upazila[]>([]);
  const [unionsList, setUnionsList] = useState<Union[]>([]);

  useEffect(() => {
    if (formData.division) {
      const divisionDistricts =
        (language === "en"
          ? districts_en[parseInt(formData.division, 10)]
          : districts[parseInt(formData.division, 10)]) || [];
      setDistrictsList(divisionDistricts);
    } else {
      setDistrictsList([]);
    }

    if (formData.district) {
      const districtUpazilas =
        (language === "en"
          ? upazilas_en[parseInt(formData.district, 10)]
          : upazilas[parseInt(formData.district, 10)]) || [];
      setUpazilasList(districtUpazilas);
    } else {
      setUpazilasList([]);
    }

    if (formData.upazila) {
      const upazilaUnions =
        (language === "en"
          ? unions_en[parseInt(formData.upazila, 10)]
          : unions[parseInt(formData.upazila, 10)]) || [];
      setUnionsList(upazilaUnions);
    } else {
      setUnionsList([]);
    }
  }, [formData.division, formData.district, formData.upazila, language]);

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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("User created successfully!");
        router.push("/admin/register");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "User creation failed! Try again.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 m-10">
      <div className="w-full p-8 space-y-6 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center">Add New User</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your Full name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="centraladmin">কেন্দ্রীয় এডমিন</option>
              <option value="divisionadmin">বিভাগীয় এডমিন</option>
              <option value="districtadmin">জেলা এডমিন</option>
              <option value="areaadmin">এলাকার এডমিন</option>
              <option value="upozilaadmin">উপজেলা এডমিন</option>
              <option value="unionadmin">ইউনিয়ন এডমিন</option>
              <option value="daye">দা&apos;ঈ</option>
            </select>
          </div>

          {/* Division Dropdown */}
          <div>
            <label
              htmlFor="division"
              className="block text-sm font-medium text-gray-700"
            >
              Division
            </label>
            <select
              id="division"
              name="division"
              value={formData.division}
              onChange={handleChange}
              className="p-2 border-2 rounded-lg grow w-full"
            >
              <option value="">Select Division</option>
              {(language === "en" ? divisions_en : divisions).map(
                (division) => (
                  <option key={division.value} value={division.value}>
                    {division.title}
                  </option>
                )
              )}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700"
            >
              District
            </label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="p-2 border-2 rounded-lg grow w-full"
              disabled={!districtsList.length}
            >
              <option value="">Select District</option>
              {districtsList.map((district) => (
                <option key={district.value} value={district.value}>
                  {district.title}
                </option>
              ))}
            </select>
          </div>

          {/* Upazila Dropdown */}
          <div>
            <label
              htmlFor="upazila"
              className="block text-sm font-medium text-gray-700"
            >
              Upazila
            </label>
            <select
              id="upazila"
              name="upazila"
              value={formData.upazila}
              onChange={handleChange}
              className="p-2 border-2 rounded-lg grow w-full"
              disabled={!upazilasList.length}
            >
              <option value="">Select Upazila</option>
              {upazilasList.map((upazila) => (
                <option key={upazila.value} value={upazila.value}>
                  {upazila.title}
                </option>
              ))}
            </select>
          </div>

          {/* Union Dropdown */}
          <div>
            <label
              htmlFor="union"
              className="block text-sm font-medium text-gray-700"
            >
              Union
            </label>
            <select
              id="union"
              name="union"
              value={formData.union}
              onChange={handleChange}
              className="p-2 border-2 rounded-lg grow w-full"
              disabled={!unionsList.length}
            >
              <option value="">Select Union</option>
              {unionsList.map((union) => (
                <option key={union.value} value={union.value}>
                  {union.title}
                </option>
              ))}
            </select>
          </div>

          {/* Markaz */}
          <div>
            <label
              htmlFor="markaz"
              className="block text-sm font-medium text-gray-700"
            >
              Markaz (Optional)
            </label>
            <input
              type="text"
              id="markaz"
              name="markaz"
              value={formData.markaz}
              onChange={handleChange}
              placeholder="Enter your Markaz Name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Mobile Number
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your Phone Number"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Create New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your New Password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-32 py-2 px-4 bg-[#155E75] text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
