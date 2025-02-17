"use client"; //Estiak

import React, { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import { admin, useSession } from "@/lib/auth-client";
import markazList from "@/app/data/markazList";
import * as yup from "yup";

type LocationOption = { value: number | string; title: string };

const SpeacialRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    divisionId: "",
    districtId: "",
    upazilaId: "",
    unionId: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    markaz: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const signUpSchemaUser = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(8).required("Password is required"),
    role: yup.string().required("Role is required"),
    phone: yup.string().required("Phone is required"),
  });

  const roleHierarchy = {
    centraladmin: [
      "divisionadmin",
      "districtadmin",
      "upozilaadmin",
      "unionadmin",
      "daye",
    ],
    divisionadmin: ["districtadmin", "upozilaadmin", "unionadmin", "daye"],
    districtadmin: ["upozilaadmin", "unionadmin", "daye"],
    upozilaadmin: ["unionadmin", "daye"],
    unionadmin: ["daye"],
  };

  const { data: session } = useSession();
  const loggedInUserRole = session?.user?.role || null;

  const roleOptions = useMemo(() => {
    if (!loggedInUserRole) return [];
    return (
      roleHierarchy[loggedInUserRole as keyof typeof roleHierarchy]?.map(
        (r) => ({
          value: r,
          title: getRoleTitle(r),
        })
      ) || []
    );
  }, [loggedInUserRole]);

  function getRoleTitle(role: string) {
    const roleTitles: Record<string, string> = {
      divisionadmin: "বিভাগীয় এডমিন",
      districtadmin: "জেলা এডমিন",
      upozilaadmin: "উপজেলা এডমিন",
      unionadmin: "ইউনিয়ন এডমিন",
      daye: "দা'ঈ",
    };
    return roleTitles[role] || role;
  }

  const districtsList: LocationOption[] = formData.divisionId
    ? districts[formData.divisionId] || []
    : [];

  const upazilasList: LocationOption[] = formData.districtId
    ? upazilas[formData.districtId] || []
    : [];

  const unionsList: LocationOption[] = formData.upazilaId
    ? unions[formData.upazilaId] || []
    : [];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        if (name === "divisionId") {
          const found = divisions.find((item) => item.value === value);
          return {
            ...prev,
            divisionId: value,
            division: found?.title || "",
            districtId: "",
            district: "",
            upazilaId: "",
            upazila: "",
            unionId: "",
            union: "",
          };
        }

        if (name === "districtId") {
          const found = districtsList.find(
            (item) => String(item.value) === String(value)
          );
          return {
            ...prev,
            districtId: value,
            district: found?.title || "",
            upazilaId: "",
            upazila: "",
            unionId: "",
            union: "",
          };
        }

        if (name === "upazilaId") {
          const found = upazilasList.find(
            (item) => String(item.value) === String(value)
          );
          return {
            ...prev,
            upazilaId: value,
            upazila: found?.title || "",
            unionId: "",
            union: "",
          };
        }

        if (name === "unionId") {
          const found = unionsList.find(
            (item) => String(item.value) === String(value)
          );
          return {
            ...prev,
            unionId: value,
            union: found?.title || "",
          };
        }

        return { ...prev, [name]: value };
      });
    },
    [districtsList, upazilasList, unionsList]
  );

  const { role } = formData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpSchemaUser.validate(formData, { abortEarly: false });
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
            markaz: formData.markaz,
            phone: formData.phone,
          },
        },
        {
          onSuccess: () => {
            toast.success("User created!");
            setFormData({
              name: "",
              role: "",
              divisionId: "",
              districtId: "",
              upazilaId: "",
              unionId: "",
              division: "",
              district: "",
              upazila: "",
              union: "",
              markaz: "",
              phone: "",
              email: "",
              password: "",
            });
          },
          onError: (ctx) => toast.error(ctx.error.message),
        }
      );
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        error.inner.forEach((err) => toast.error(err.message));
      } else {
        console.error("Error creating user:", error);
        toast.error("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center lg:m-10">
      <div className="w-full p-8 space-y-6 ">
        <h2 className="text-2xl font-bold text-center">বিশেষ দা'ঈ যোগ করুন</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <SelectField
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
          />
          <SelectField
            label="Division"
            name="divisionId"
            value={formData.divisionId}
            onChange={handleChange}
            options={divisions}
          />

          <SelectField
            label="District"
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            options={districtsList}
            disabled={!districtsList.length}
          />

          <SelectField
            label="Upazila"
            name="upazilaId"
            value={formData.upazilaId}
            onChange={handleChange}
            options={upazilasList}
            disabled={!upazilasList.length}
          />

          <SelectField
            label="Union"
            name="unionId"
            value={formData.unionId}
            onChange={handleChange}
            options={unionsList}
            disabled={!unionsList.length}
          />

          <SelectField
            label="Markaz"
            name="markaz"
            value={formData.markaz}
            onChange={handleChange}
            options={markazList.map(({ name }) => ({
              value: name,
              title: name,
            }))}
          />

          <InputField
            label="Mobile Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            type="password"
            label="Create New Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-32 py-2 px-4 bg-[#155E75] text-white rounded-md hover:bg-blue-600"
            >
              {loading ? "Processing..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable components remain the same
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input className="w-full p-2 border rounded-md" {...props} />
  </div>
);

interface SelectFieldProps {
  label: string;
  options: { value: number | string; title: string }[];
  [key: string]: any;
}
const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  ...props
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select className="w-full p-2 border rounded-md" {...props}>
      <option value="">Select {label}</option>
      {options.map(({ value, title }) => (
        <option key={value} value={value}>
          {title}
        </option>
      ))}
    </select>
  </div>
);

export default SpeacialRegister;
