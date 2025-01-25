"use client";

import React from "react";
import { UserCircle, Mail, Phone, MapPin, Landmark } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const ProfileField = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1.5">
      {Icon && <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />}
      <span className="font-medium">{label}:</span>
      <span className="truncate text-gray-800">{value}</span>
    </div>
  );
};

const Profile: React.FC = () => {
  const session = useSession();
  const user = session.data?.user;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-3xl">
      <div className="text-center relative">
        {user?.image ? (
          <div className="relative mx-auto w-24 h-24 mb-4">
            <img
              src={user.image}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-primary-500 shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>
        ) : (
          <UserCircle className="w-24 h-24 mx-auto text-gray-300 mb-4" />
        )}

        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {user?.name || "User Profile"}
        </h2>
        <p className="text-sm text-primary-600 font-medium">
          {user?.role || "Role Not Specified"}
        </p>
      </div>

      <div className="mt-4 border-t pt-4 text-left space-y-3">
        <ProfileField icon={Phone} label="Phone" value={user?.phone} />
        <ProfileField icon={Mail} label="Email" value={user?.email} />
        <ProfileField icon={MapPin} label="Address" value={user?.area} />
        <ProfileField icon={MapPin} label="City/State" value={user?.district} />
        <ProfileField icon={MapPin} label="Postcode" value={user?.upazila} />
        <ProfileField icon={Landmark} label="Markaz" value={user?.markaz} />
      </div>
    </div>
  );
};

export default Profile;

// "use client";

// import React, { useState, useEffect } from "react";
// import { toast } from "sonner"; // Notification library
// import { updateUser, changeEmail, changePassword } from "@/lib/auth-client"; // ✅ Import user functions

// const Profile = () => {
//   // Initial form data
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     image: "",
//   });

//   // Password Change State
//   const [passwords, setPasswords] = useState({
//     currentPassword: "",
//     newPassword: "",
//   });

//   // Email Change State
//   const [newEmail, setNewEmail] = useState("");

//   // Fetch user profile when the component mounts
//   useEffect(() => {
//     async function fetchProfile() {
//       try {
//         const res = await fetch("/api/userprofile");
//         if (!res.ok) throw new Error("Failed to fetch profile");
//         const data = await res.json();
//         setFormData(data);
//       } catch (error) {
//         console.error(error);
//       }
//     }
//     fetchProfile();
//   }, []);

//   // Handle input changes
//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // Handle Profile Update
//   const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       await updateUser({
//         name: formData.name,
//         image: formData.image,
//       });
//       toast.success("Profile updated successfully!");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update profile");
//     }
//   };

//   // Handle Email Change
//   const handleChangeEmail = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       await changeEmail({
//         newEmail,
//         callbackURL: "/dashboard",
//       });
//       toast.success("Email change request sent. Verify your email.");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to change email");
//     }
//   };

//   // Handle Password Change
//   const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       await changePassword({
//         currentPassword: passwords.currentPassword,
//         newPassword: passwords.newPassword,
//         revokeOtherSessions: true,
//       });
//       toast.success("Password changed successfully!");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to change password");
//     }
//   };

//   return (
//     <div className="w-[400px] sm:w-[500px] mx-auto p-8 bg-slate-50 shadow-lg rounded-lg">
//       {/* Profile Header */}
//       <div className="text-center mb-6">
//         <h3 className="text-lg font-semibold text-gray-800 mt-2">
//           {formData.name || "User Name"}
//           {/* {formData.email || "User Email"} */}
//         </h3>
//         <p className="text-gray-500 text-sm">{formData.email}</p>
//         <p className="text-gray-500 text-sm">{formData.email}</p>
//         <p className="text-gray-500 text-sm">{formData.email}</p>
//         <p className="text-gray-500 text-sm">{formData.email}</p>
//         <p className="text-gray-500 text-sm">{formData.email}</p>
//         <p className="text-gray-500 text-sm">{formData.email}</p>
//         <p className="text-gray-500 text-sm">{formData.email}</p>
//       </div>

//       {/* Profile Update Form */}
//       <form onSubmit={handleProfileUpdate} className="space-y-3">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Full Name
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Profile Image URL
//           </label>
//           <input
//             type="text"
//             name="image"
//             value={formData.image}
//             onChange={handleChange}
//             className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full py-2 bg-teal-600 text-white font-bold rounded-md hover:bg-teal-700 focus:outline-none"
//         >
//           Update Profile
//         </button>
//       </form>

//       {/* Email Change Form */}
//       <form onSubmit={handleChangeEmail} className="space-y-3 mt-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Change Email
//           </label>
//           <input
//             type="email"
//             value={newEmail}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setNewEmail(e.target.value)
//             }
//             className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             placeholder="Enter new email"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600 focus:outline-none"
//         >
//           Change Email
//         </button>
//       </form>

//       {/* Password Change Form */}
//       <form onSubmit={handleChangePassword} className="space-y-3 mt-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Current Password
//           </label>
//           <input
//             type="password"
//             name="currentPassword"
//             value={passwords.currentPassword}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setPasswords({ ...passwords, currentPassword: e.target.value })
//             }
//             className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             placeholder="Enter current password"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             New Password
//           </label>
//           <input
//             type="password"
//             name="newPassword"
//             value={passwords.newPassword}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setPasswords({ ...passwords, newPassword: e.target.value })
//             }
//             className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             placeholder="Enter new password"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 focus:outline-none"
//         >
//           Change Password
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Profile;
