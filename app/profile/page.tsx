"use client";

import React, { useState } from "react";
import { UserCircle, Mail, Phone, MapPin, Landmark } from "lucide-react";
import { useSession, updateUser } from "@/lib/auth-client";
import { toast } from "sonner";

const ProfileField = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  editable = false,
}: {
  icon?: React.ElementType;
  label: string;
  name: string;
  value?: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editable?: boolean;
}) => {
  if (!value && !editable) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1.5">
      {Icon && <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />}
      <span className="font-medium">{label}:</span>
      {editable ? (
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          className="border border-gray-300 rounded px-2 py-1 text-gray-800 w-full"
        />
      ) : (
        <span className="truncate text-gray-800">{value}</span>
      )}
    </div>
  );
};

const Profile: React.FC = () => {
  const session = useSession();
  const user = session.data?.user;
  const [formData, setFormData] = useState<{
    phone?: string;
    email?: string;
    area?: string;
    district?: string;
    upazila?: string;
    markaz?: string;
  }>(user || {});
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUser(formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="max-w-lg mt-40 mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-3xl">
      <div className="text-center relative">
        {user?.image ? (
          <div className="relative mx-auto w-24 h-24 mb-4"></div>
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
        <ProfileField
          icon={Phone}
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={Mail}
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={MapPin}
          label="Address"
          name="area"
          value={formData.area}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={MapPin}
          label="City/State"
          name="district"
          value={formData.district}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={MapPin}
          label="Postcode"
          name="upazila"
          value={formData.upazila}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={Landmark}
          label="Markaz"
          name="markaz"
          value={formData.markaz}
          onChange={handleChange}
          editable={isEditing}
        />
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        {isEditing ? (
          <>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSave}
            >
              Save
            </button>
          </>
        ) : (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;

// "use client";

// import React from "react";
// import { UserCircle, Mail, Phone, MapPin, Landmark } from "lucide-react";
// import { useSession } from "@/lib/auth-client";

// const ProfileField = ({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon?: React.ElementType;
//   label: string;
//   value?: string | null;
// }) => {
//   if (!value) return null;

//   return (
//     <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1.5">
//       {Icon && <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />}
//       <span className="font-medium">{label}:</span>
//       <span className="truncate text-gray-800">{value}</span>
//     </div>
//   );
// };

// const Profile: React.FC = () => {
//   const session = useSession();
//   const user = session.data?.user;

//   return (
//     <div className="max-w-lg mt-40 mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-3xl">
//       <div className="text-center relative">
//         {user?.image ? (
//           <div className="relative mx-auto w-24 h-24 mb-4">
//             <img
//               src={user.image}
//               alt="Profile"
//               className="w-full h-full rounded-full object-cover border-4 border-primary-500 shadow-md transition-transform duration-300 hover:scale-105"
//             />
//           </div>
//         ) : (
//           <UserCircle className="w-24 h-24 mx-auto text-gray-300 mb-4" />
//         )}

//         <h2 className="text-lg font-bold text-gray-900 mb-1">
//           {user?.name || "User Profile"}
//         </h2>
//         <p className="text-sm text-primary-600 font-medium">
//           {user?.role || "Role Not Specified"}
//         </p>
//       </div>

//       <div className="mt-4 border-t pt-4 text-left space-y-3">
//         <ProfileField icon={Phone} label="Phone" value={user?.phone} />
//         <ProfileField icon={Mail} label="Email" value={user?.email} />
//         <ProfileField icon={MapPin} label="Address" value={user?.area} />
//         <ProfileField icon={MapPin} label="City/State" value={user?.district} />
//         <ProfileField icon={MapPin} label="Postcode" value={user?.upazila} />
//         <ProfileField icon={Landmark} label="Markaz" value={user?.markaz} />
//       </div>
//     </div>
//   );
// };

// export default Profile;
