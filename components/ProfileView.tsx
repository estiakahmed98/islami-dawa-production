"use client"; //Estiak

import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Landmark,
  Calendar,
  Shield,
  User,
  Building,
  AlertTriangle,
  FileText,
  Edit3,
  Save,
  X,
  Camera,
  Crown,
  Clock,
  MapPinIcon,
  Home,
} from "lucide-react";

interface UserProfile {
  id?: string;
  name?: string | null;
  email?: string;
  phone?: string | null;
  role?: string | null;
  division?: string | null;
  district?: string | null;
  area?: string | null;
  upazila?: string | null;
  union?: string | null;
  markaz?: string | null;
  parent?: string | null;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: number | null;
  note?: string | null;
}

interface ProfileFieldProps {
  icon?: React.ElementType;
  label: string;
  name: string;
  value?: string | null | boolean | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  editable?: boolean;
  type?: string;
  isTextarea?: boolean;
  disabled?: boolean;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  editable = false,
  type = "text",
  isTextarea = false,
  disabled = false,
}) => {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value;

  if (!displayValue && !editable) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        {Icon && (
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="w-3 h-3 text-blue-500" />
          </div>
        )}
        <label className="text-xs font-medium text-gray-600">{label}</label>
      </div>

      {editable && !disabled ? (
        isTextarea ? (
          <textarea
            name={name}
            value={displayValue || ""}
            onChange={onChange}
            rows={2}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 resize-none text-sm"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={displayValue || ""}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )
      ) : (
        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-gray-700 text-sm">
            {displayValue || "Not specified"}
          </span>
        </div>
      )}
    </div>
  );
};

const Profile: React.FC = () => {
  const [formData, setFormData] = useState<UserProfile>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with your actual API
      const response = await fetch("/api/profile");
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to load profile");
      }
      const data = await response.json();
      setFormData(data);
    } catch (err: any) {
      console.error("fetchProfile error:", err);
      // For demo purposes, set some sample data
      setFormData({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        role: "Admin",
        division: "Dhaka",
        district: "Dhaka",
        area: "Dhanmondi",
        upazila: "Dhanmondi",
        union: "Ward 15",
        markaz: "Central Markaz",
        parent: "Jane Doe",
        emailVerified: true,
        createdAt: "2023-01-15T10:00:00.000Z",
        banned: false,
        note: "Active member with good standing in the community.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

      // Success notification would go here
      setIsEditing(false);
      await fetchProfile();
    } catch (err: any) {
      console.error("Failed to update profile", err);
      // Error notification would go here
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-25 via-indigo-25 to-purple-25 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-25 via-indigo-25 to-purple-25 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Single Card Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#a9d5e4] via-[#7aaabc] to-[#84d4ef] px-6 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-24 h-24 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/50">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-1 right-1 w-7 h-7 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="w-3 h-3 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {formData.name || "User Profile"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                  <div className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span className="text-gray-700 font-medium text-sm">
                      {formData.role || "User"}
                    </span>
                  </div>
                  {formData.emailVerified && (
                    <div className="flex items-center space-x-1 bg-green-100/70 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Shield className="w-3 h-3 text-green-600" />
                      <span className="text-green-700 font-medium text-xs">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-1 text-gray-600">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">
                    Member since {formatDate(formData.createdAt)}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-1 px-4 py-2 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg border border-white/40 hover:bg-white/80 transition-all duration-200 text-sm"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium text-sm"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 px-4 py-2 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg border border-white/40 hover:bg-white/80 transition-all duration-200 text-sm"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <span>Personal Information</span>
                </h3>
                <div className="space-y-3">
                  <ProfileField
                    icon={User}
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    editable={isEditing}
                  />
                  <ProfileField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    editable={isEditing}
                    type="email"
                    disabled={true}
                  />
                  <ProfileField
                    icon={Phone}
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    editable={isEditing}
                    type="tel"
                  />
                  <ProfileField
                    icon={User}
                    label="Parent/Guardian"
                    name="parent"
                    value={formData.parent}
                    onChange={handleChange}
                    editable={isEditing}
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Location Details</span>
                </h3>
                <div className="space-y-3">
                  <ProfileField
                    icon={Building}
                    label="Division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    editable={isEditing}
                  />
                  <ProfileField
                    icon={MapPinIcon}
                    label="District"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    editable={isEditing}
                  />
                  <ProfileField
                    icon={Home}
                    label="Area"
                    name="area"
                    value={formData.area}
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
              </div>

              {/* Account & Additional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-3 h-3 text-purple-600" />
                  </div>
                  <span>Account Status</span>
                </h3>
                <div className="space-y-3">
                  <ProfileField
                    icon={Crown}
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    editable={isEditing}
                  />
                  <ProfileField
                    icon={Shield}
                    label="Email Verified"
                    name="emailVerified"
                    value={formData.emailVerified}
                    editable={false}
                  />
                  <ProfileField
                    icon={Clock}
                    label="Last Updated"
                    name="updatedAt"
                    value={formatDate(formData.updatedAt)}
                    editable={false}
                  />
                  {formData.banned && (
                    <>
                      <ProfileField
                        icon={AlertTriangle}
                        label="Account Status"
                        name="banned"
                        value="Banned"
                        editable={false}
                      />
                      <ProfileField
                        icon={FileText}
                        label="Ban Reason"
                        name="banReason"
                        value={formData.banReason}
                        editable={false}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section - Full Width */}
            {(formData.note || isEditing) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-3 h-3 text-orange-600" />
                  </div>
                  <span>Additional Notes</span>
                </h3>
                <ProfileField
                  icon={FileText}
                  label="Notes"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  editable={isEditing}
                  isTextarea={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
