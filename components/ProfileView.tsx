"use client"; //Estiak

import React, { useState, useEffect } from "react";
import { UserCircle, Mail, Phone, MapPin, Landmark } from "lucide-react";
import { toast } from "sonner";

// A reusable field
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
  // Data we load from the DB
  const [formData, setFormData] = useState<{
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    division?: string;
    district?: string;
    upazila?: string;
    union?: string;
    area?: string;
    markaz?: string;
    // add more if needed
  }>({});

  const [isEditing, setIsEditing] = useState(false);

  // 1) Load from /api/profile
  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to load profile");
      }
      const data = await response.json();
      setFormData(data);
    } catch (err: any) {
      console.error("fetchProfile error:", err);
      toast.error(err.message || "Could not load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2) Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3) Save profile updates
  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await fetchProfile(); // optionally refresh data
    } catch (err: any) {
      console.error("Failed to update profile", err);
      toast.error(err.message || "Could not update profile");
    }
  };

  return (
    <div className="max-w-2xl mt-16 mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-3xl">
      <div className="text-center relative">
        <UserCircle className="w-24 h-24 mx-auto text-gray-300 mb-4" />

        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {formData.name || "User Profile"}
        </h2>
        <p className="text-sm text-primary-600 font-medium">
          {formData.role || "Role Not Specified"}
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
          label="Division"
          name="division"
          value={formData.division}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={MapPin}
          label="Area"
          name="area"
          value={formData.area}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={MapPin}
          label="District"
          name="district"
          value={formData.district}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={MapPin}
          label="Upazila"
          name="upazila"
          value={formData.upazila}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileField
          icon={MapPin}
          label="Union"
          name="union"
          value={formData.union}
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
