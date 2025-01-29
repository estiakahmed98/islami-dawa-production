// "use client";

// import React, { useState, useEffect, FormEvent } from "react";
// import { toast } from "sonner";
// import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
// import { admin } from "@/lib/auth-client";
// import * as yup from "yup";
// import { signUpSchemaUser } from "@/validators/authValidators";

// // Types

// type District = {
//   value: number;
//   title: string;
// };

// type Upazila = {
//   value: number;
//   title: string;
// };

// type Union = {
//   value: number;
//   title: string;
// };

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     role: "",
//     division: "",
//     district: "",
//     upazila: "",
//     union: "",
//     area: "",
//     markaz: "",
//     phone: "",
//     email: "",
//     password: "",
//   });

//   const [districtsList, setDistrictsList] = useState<District[]>([]);
//   const [upazilasList, setUpazilasList] = useState<Upazila[]>([]);
//   const [unionsList, setUnionsList] = useState<Union[]>([]);

//   useEffect(() => {
//     if (formData.division) {
//       const divisionDistricts =
//         districts[parseInt(formData.division, 10)] || [];
//       setDistrictsList(divisionDistricts);
//     } else {
//       setDistrictsList([]);
//     }

//     if (formData.district) {
//       const districtUpazilas = upazilas[parseInt(formData.district, 10)] || [];
//       setUpazilasList(districtUpazilas);
//     } else {
//       setUpazilasList([]);
//     }

//     if (formData.upazila) {
//       const upazilaUnions = unions[parseInt(formData.upazila, 10)] || [];
//       setUnionsList(upazilaUnions);
//     } else {
//       setUnionsList([]);
//     }
//   }, [formData.division, formData.district, formData.upazila]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       await signUpSchemaUser.validate(formData, { abortEarly: false });

//       const newUser = await admin.createUser(
//         {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           role: formData.role,
//           data: {
//             division: formData.division,
//             district: formData.district,
//             upazila: formData.upazila,
//             union: formData.union,
//             area: formData.area,
//             markaz: formData.markaz,
//             phone: formData.phone,
//           },
//         },
//         {
//           onSuccess: () => {
//             toast.success("User created successfully!");
//           },
//           onError: (ctx) => {
//             toast.error(ctx.error.message);
//           },
//         }
//       );
//     } catch (error) {
//       if (error instanceof yup.ValidationError) {
//         error.inner.forEach((err) => toast.error(err.message));
//       } else {
//         console.error("Error creating user:", error);
//         toast.error("Something went wrong! Please try again.");
//       }
//     }
//   };

//   return (
//     <div className="flex items-center justify-center bg-gray-50 lg:m-10">
//       <div className="w-full p-8 space-y-6 shadow-lg rounded-lg">
//         <h2 className="text-2xl font-bold text-center">Add New User</h2>
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           {/* Full Name */}
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Full Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Enter your Full name"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>

//           {/* Role Dropdown */}
//           <div>
//             <label
//               htmlFor="role"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Role
//             </label>
//             <select
//               id="role"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="" disabled>
//                 Select Role
//               </option>
//               <option value="centraladmin">কেন্দ্রীয় এডমিন</option>
//               <option value="divisionadmin">বিভাগীয় এডমিন</option>
//               <option value="districtadmin">জেলা এডমিন</option>
//               <option value="areaadmin">এলাকার এডমিন</option>
//               <option value="upozilaadmin">উপজেলা এডমিন</option>
//               <option value="unionadmin">ইউনিয়ন এডমিন</option>
//               <option value="daye">দা&apos;ঈ</option>
//             </select>
//           </div>

//           {/* Division Dropdown */}
//           <div>
//             <label
//               htmlFor="division"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Division
//             </label>
//             <select
//               id="division"
//               name="division"
//               value={formData.division}
//               onChange={handleChange}
//               className="p-2 border-2 rounded-lg grow w-full"
//             >
//               <option value="">Select Division</option>
//               {divisions.map((division) => (
//                 <option key={division.value} value={division.value}>
//                   {division.title}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* District Dropdown */}
//           <div>
//             <label
//               htmlFor="district"
//               className="block text-sm font-medium text-gray-700"
//             >
//               District
//             </label>
//             <select
//               id="district"
//               name="district"
//               value={formData.district}
//               onChange={handleChange}
//               className="p-2 border-2 rounded-lg grow w-full"
//               disabled={!districtsList.length}
//             >
//               <option value="">Select District</option>
//               {districtsList.map((district) => (
//                 <option key={district.value} value={district.value}>
//                   {district.title}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Upazila Dropdown */}
//           <div>
//             <label
//               htmlFor="upazila"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Upazila
//             </label>
//             <select
//               id="upazila"
//               name="upazila"
//               value={formData.upazila}
//               onChange={handleChange}
//               className="p-2 border-2 rounded-lg grow w-full"
//               disabled={!upazilasList.length}
//             >
//               <option value="">Select Upazila</option>
//               {upazilasList.map((upazila) => (
//                 <option key={upazila.value} value={upazila.value}>
//                   {upazila.title}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Union Dropdown */}
//           <div>
//             <label
//               htmlFor="union"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Union
//             </label>
//             <select
//               id="union"
//               name="union"
//               value={formData.union}
//               onChange={handleChange}
//               className="p-2 border-2 rounded-lg grow w-full"
//               disabled={!unionsList.length}
//             >
//               <option value="">Select Union</option>
//               {unionsList.map((union) => (
//                 <option key={union.value} value={union.value}>
//                   {union.title}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Area */}
//           <div>
//             <label
//               htmlFor="area"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Area
//             </label>
//             <input
//               type="text"
//               id="area"
//               name="area"
//               value={formData.area}
//               onChange={handleChange}
//               placeholder="Enter your Area Name"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>

//           {/* Markaz */}
//           <div>
//             <label
//               htmlFor="markaz"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Markaz (Optional)
//             </label>
//             <input
//               type="text"
//               id="markaz"
//               name="markaz"
//               value={formData.markaz}
//               onChange={handleChange}
//               placeholder="Enter your Markaz Name"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>

//           {/* Mobile Number */}
//           <div>
//             <label
//               htmlFor="phone"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Mobile Number
//             </label>
//             <input
//               type="text"
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder="Enter your Phone Number"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Create New Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your New Password"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end">
//             <button
//               type="submit"
//               className="w-32 py-2 px-4 bg-[#155E75] text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Add User
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import { admin, useSession } from "@/lib/auth-client";
import * as yup from "yup";

// Types
type LocationOption = { value: number; title: string };

const Register = () => {
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

  const [loading, setLoading] = useState(false);

  const signUpSchemaUser = yup.object().shape({
    name: yup.string().required(),
    email: yup
      .string()
      .required("Email is required")
      .email("Invalid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
    role: yup.string().required(),
    division: yup.string().optional(),
    district: yup.string().optional(),
    area: yup.string().optional(),
    upazila: yup.string().optional(),
    union: yup.string().optional(),
    markaz: yup.string().optional(),
    phone: yup.string().required("Phone is required"),
  });

  // Role Hierarchy for Filtering
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

  const { data: session} = useSession(); // Fetch session data
  const loggedInUserRole = session?.user?.role || null; // Get logged-in user role

  const roleOptions = useMemo(() => {
    if (!loggedInUserRole) return [];
    return (
      roleHierarchy[loggedInUserRole]?.map((role) => ({
        value: role,
        title: getRoleTitle(role), // Fix: Call the corrected function
      })) || []
    );
  }, [loggedInUserRole]);

  function getRoleTitle(role) {
    const roleTitles = {
      centraladmin: "কেন্দ্রীয় এডমিন",
      divisionadmin: "বিভাগীয় এডমিন",
      districtadmin: "জেলা এডমিন",
      upozilaadmin: "উপজেলা এডমিন",
      unionadmin: "ইউনিয়ন এডমিন",
      daye: "দা'ঈ",
    };
    return roleTitles[role] || role; // This ensures proper lookup
  }

  // Memoized lists based on selections
  const districtsList: LocationOption[] =
    formData.division && districts[parseInt(formData.division, 10)]
      ? districts[parseInt(formData.division, 10)]
      : [];

  const upazilasList: LocationOption[] =
    formData.district && upazilas[parseInt(formData.district, 10)]
      ? upazilas[parseInt(formData.district, 10)]
      : [];

  const unionsList: LocationOption[] =
    formData.upazila && unions[parseInt(formData.upazila, 10)]
      ? unions[parseInt(formData.upazila, 10)]
      : [];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

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
            area: formData.area,
            markaz: formData.markaz,
            phone: formData.phone,
          },
        },
        {
          onSuccess: () => {
            toast.success("User created successfully!");
            setFormData({
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
    } finally {
      setLoading(false);
    }
  };

  // Determine visibility of fields based on role
  const { role } = formData;
  const hideDistrict = role === "divisionadmin";
  const hideUpazila = role === "divisionadmin" || role === "districtadmin";
  const hideUnion =
    role === "divisionadmin" ||
    role === "districtadmin" ||
    role === "upozilaadmin";
  const hideMarkaz = hideUnion || role === "unionadmin";

  return (
    <div className="flex items-center justify-center bg-gray-50 lg:m-10">
      <div className="w-full p-8 space-y-6 shadow-lg rounded-lg bg-white">
        <h2 className="text-2xl font-bold text-center">Add New User</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Role Dropdown */}
          <SelectField
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
          />

          {/* Location Dropdowns */}
          <SelectField
            label="Division"
            name="division"
            value={formData.division}
            onChange={handleChange}
            options={divisions}
          />
          {!hideDistrict && (
            <SelectField
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              options={districtsList}
              disabled={!districtsList.length}
            />
          )}
          {!hideUpazila && (
            <SelectField
              label="Upazila"
              name="upazila"
              value={formData.upazila}
              onChange={handleChange}
              options={upazilasList}
              disabled={!upazilasList.length}
            />
          )}
          {!hideUnion && (
            <SelectField
              label="Union"
              name="union"
              value={formData.union}
              onChange={handleChange}
              options={unionsList}
              disabled={!unionsList.length}
            />
          )}

          {/* Other Inputs */}
          <InputField
            label="Area"
            name="area"
            value={formData.area}
            onChange={handleChange}
          />
          {!hideMarkaz && (
            <InputField
              label="Markaz (Optional)"
              name="markaz"
              value={formData.markaz}
              onChange={handleChange}
            />
          )}
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-32 py-2 px-4 bg-[#155E75] text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? "Processing..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable InputField Component
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

// Reusable SelectField Component
interface SelectFieldProps {
  label: string;
  options: { value: number | string; title: string }[];
  [key: string]: any;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, ...props }) => (
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

export default Register;

// "use client";

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { toast } from "sonner";
// import { useSession } from "@/lib/auth-client";
// import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
// import { admin } from "@/lib/auth-client";
// import * as yup from "yup";

// // Role Hierarchy for Filtering
// const roleHierarchy = {
//   centraladmin: ["divisionadmin", "districtadmin", "upozilaadmin", "unionadmin", "daye"],
//   divisionadmin: ["districtadmin", "upozilaadmin", "unionadmin", "daye"],
//   districtadmin: ["upozilaadmin", "unionadmin", "daye"],
//   upozilaadmin: ["unionadmin", "daye"],
//   unionadmin: ["daye"],
// };

// const Register = () => {
//   const { data: session, status } = useSession(); // Fetch session data
//   const loggedInUserRole = session?.user?.role || null; // Get logged-in user role

//   const [formData, setFormData] = useState({
//     name: "",
//     role: "",
//     division: "",
//     district: "",
//     upazila: "",
//     union: "",
//     area: "",
//     markaz: "",
//     phone: "",
//     email: "",
//     password: "",
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [loading, setLoading] = useState(false);

//   // Memoized Role Options Based on Logged-in User Role
//   const roleOptions = useMemo(() => {
//     if (!loggedInUserRole) return [];
//     return loggedInUserRole === "centraladmin"
//       ? Object.keys(roleHierarchy).map((role) => ({ value: role, title: getRoleTitle(role) }))
//       : roleHierarchy[loggedInUserRole]?.map((role) => ({ value: role, title: getRoleTitle(role) })) || [];
//   }, [loggedInUserRole]);

//   function getRoleTitle(role: string) {
//     const roleTitles: Record<string, string> = {
//       centraladmin: "কেন্দ্রীয় এডমিন",
//       divisionadmin: "বিভাগীয় এডমিন",
//       districtadmin: "জেলা এডমিন",
//       upozilaadmin: "উপজেলা এডমিন",
//       unionadmin: "ইউনিয়ন এডমিন",
//       daye: "দা'ঈ",
//     };
//     return roleTitles[role] || role;
//   }

//   // Handle Form Changes
//   const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error when user types
//   }, []);

//   // Submit Form
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await admin.createUser(
//         {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           role: formData.role,
//           data: {
//             division: formData.division,
//             district: formData.district,
//             upazila: formData.upazila,
//             union: formData.union,
//             area: formData.area,
//             markaz: formData.markaz,
//             phone: formData.phone,
//           },
//         },
//         {
//           onSuccess: () => {
//             toast.success("User created successfully!");
//             setFormData({
//               name: "",
//               role: "",
//               division: "",
//               district: "",
//               upazila: "",
//               union: "",
//               area: "",
//               markaz: "",
//               phone: "",
//               email: "",
//               password: "",
//             });
//           },
//           onError: (ctx) => {
//             toast.error(ctx.error.message);
//           },
//         }
//       );
//     } catch (error) {
//       toast.error("Something went wrong! Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show loading state while fetching session
//   if (status === "loading") {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <p>Loading user data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center bg-gray-50 lg:m-10">
//       <div className="w-full p-8 space-y-6 shadow-lg rounded-lg bg-white">
//         <h2 className="text-2xl font-bold text-center">Add New User</h2>
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Full Name</label>
//             <input className="w-full p-2 border rounded-md" name="name" value={formData.name} onChange={handleChange} />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Role</label>
//             <select className="w-full p-2 border rounded-md" name="role" value={formData.role} onChange={handleChange}>
//               <option value="">Select Role</option>
//               {roleOptions.map(({ value, title }) => (
//                 <option key={value} value={value}>
//                   {title}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input className="w-full p-2 border rounded-md" name="email" value={formData.email} onChange={handleChange} />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <input type="password" className="w-full p-2 border rounded-md" name="password" value={formData.password} onChange={handleChange} />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
//             <input className="w-full p-2 border rounded-md" name="phone" value={formData.phone} onChange={handleChange} />
//           </div>

//           <div className="flex justify-end">
//             <button type="submit" disabled={loading} className="w-32 py-2 px-4 bg-[#155E75] text-white rounded-md hover:bg-blue-600">
//               {loading ? "Processing..." : "Add User"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;
