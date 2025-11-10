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
  Eye,
  EyeOff,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (
      (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
    ).toUpperCase();
  }
  if (email && email.length) return email[0]!.toUpperCase();
  return "";
}

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
  const [markazName, setMarkazName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const { data: session } = useSession();

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
      // Resolve Markaz name from API response variants
      try {
        if (data?.markaz && typeof data.markaz === "string" && data.markaz.trim()) {
          setMarkazName(data.markaz.trim());
        } else if (data?.markaz && typeof data.markaz === "object" && data.markaz?.name) {
          setMarkazName(String(data.markaz.name));
        } else if (data?.markazId) {
          const mr = await fetch(`/api/markaz-masjid/${data.markazId}`);
          if (mr.ok) {
            const mj = await mr.json();
            if (mj?.name) setMarkazName(String(mj.name));
          }
        } else {
          setMarkazName("");
        }
      } catch (_) {
        setMarkazName("");
      }
    } catch (err: any) {
      console.error("fetchProfile error:", err);
      // For demo purposes, set some sample data
      setFormData({
        name: "No Name Found",
        email: "No Email Found",
        phone: "No Phone Found",
        role: "No Role Found",
        division: "No Division Found",
        district: "No District Found",
        area: "No Area Found",
        upazila: "No Upazila Found",
        union: "No Union Found",
        markaz: "No Markaz Found",
        parent: "No Parent Found",
        emailVerified: false,
        createdAt: "No Created At Found",
        banned: false,
        note: "No Note Found",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !pwdForm.currentPassword ||
      !pwdForm.newPassword ||
      !pwdForm.confirmPassword
    )
      return;
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return;
    try {
      setPwdLoading(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
          toast: true,
        }),
      });
      if (!res.ok) {
        toast("Failed to change password");
        return;
      }
      toast("Password changed successfully...");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } finally {
      setPwdLoading(false);
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
      <div>
        {/* Single Card Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#a9d5e4] via-[#7aaabc] to-[#84d4ef] px-6 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-24 h-24 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/50">
                  {(() => {
                    const displayImage =
                      (formData.image as string | undefined) ||
                      (session?.user?.image as string | undefined);
                    if (displayImage) {
                      return (
                        <img
                          src={displayImage}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      );
                    }
                    const initials = getInitials(
                      formData.name || session?.user?.name,
                      formData.email || session?.user?.email
                    );
                    return initials ? (
                      <span className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center text-lg font-semibold">
                        {initials}
                      </span>
                    ) : (
                      <UserCircle className="w-16 h-16 text-gray-400" />
                    );
                  })()}
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
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Landmark className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500">Markaz</p>
                      <p className="text-sm text-gray-900">{(typeof formData.markaz === 'string' ? formData.markaz : formData.markaz && (formData.markaz as any).name) || markazName || '-'}</p>
                    </div>
                  </div>
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

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-3 h-3 text-red-600" />
                </div>
                <span>Change Password</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type={showPwd.current ? "text" : "password"}
                    value={pwdForm.currentPassword}
                    onChange={(e) =>
                      setPwdForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Current password"
                    className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPwd((s) => ({ ...s, current: !s.current }))
                    }
                    className="absolute inset-y-0 right-2 my-auto h-6 w-6 flex items-center justify-center text-gray-500"
                    aria-label={
                      showPwd.current ? "Hide password" : "Show password"
                    }
                  >
                    {showPwd.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPwd.new ? "text" : "password"}
                    value={pwdForm.newPassword}
                    onChange={(e) =>
                      setPwdForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="New password"
                    className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => ({ ...s, new: !s.new }))}
                    className="absolute inset-y-0 right-2 my-auto h-6 w-6 flex items-center justify-center text-gray-500"
                    aria-label={showPwd.new ? "Hide password" : "Show password"}
                  >
                    {showPwd.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? "text" : "password"}
                    value={pwdForm.confirmPassword}
                    onChange={(e) =>
                      setPwdForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPwd((s) => ({ ...s, confirm: !s.confirm }))
                    }
                    className="absolute inset-y-0 right-2 my-auto h-6 w-6 flex items-center justify-center text-gray-500"
                    aria-label={
                      showPwd.confirm ? "Hide password" : "Show password"
                    }
                  >
                    {showPwd.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={
                    pwdLoading ||
                    !pwdForm.currentPassword ||
                    !pwdForm.newPassword ||
                    pwdForm.newPassword !== pwdForm.confirmPassword
                  }
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                >
                  {pwdLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
