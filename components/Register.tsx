"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import { admin, useSession } from "@/lib/auth-client";
import * as yup from "yup";
import { useTranslations } from "next-intl";

type LocationOption = { value: number | string; title: string };
type Variant = "standard" | "special";

type Props = {
  variant?: Variant; // default "standard"
};

const Register: React.FC<Props> = ({ variant = "standard" }) => {
  const t = useTranslations("register");
  const { data: session } = useSession();
  const loggedInUserRole = session?.user?.role || null;

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
    markazId: "", // <-- use Markaz ID (relation)
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Markaz options now use ID as value so we can connect by id
  const [markazOptions, setMarkazOptions] = useState<{ value: string; title: string }[]>([]);
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/markaz-masjid?pageSize=1000`, { cache: "no-store" });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Failed to load markaz");
        const opts = Array.isArray(j?.data)
          ? j.data.map((m: any) => ({ value: m.id as string, title: m.name as string })) // <-- id
          : [];
        if (!aborted) setMarkazOptions(opts);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const signUpSchemaUser = yup.object().shape({
    name: yup.string().required(t("errors.nameRequired")),
    email: yup.string().email(t("errors.emailInvalid")).required(t("errors.emailRequired")),
    password: yup.string().min(8, t("errors.passwordMin")).required(t("errors.passwordRequired")),
    role: yup.string().required(t("errors.roleRequired")),
    phone: yup.string().required(t("errors.phoneRequired")),
    // we can enforce markazId by role if you want; currently HTML "required" handles it
  });

  const roleHierarchy: Record<string, string[]> = {
    centraladmin: variant === "standard"
      ? ["centraladmin", "divisionadmin", "markazadmin", "daye"]
      : ["divisionadmin", "markazadmin", "daye"],
    divisionadmin: ["markazadmin", "daye"],
    markazadmin: ["daye"],
  };

  const roleOptions = useMemo(() => {
    if (!loggedInUserRole) return [];
    const allowed = roleHierarchy[loggedInUserRole as keyof typeof roleHierarchy] || [];
    return allowed.map((r) => ({ value: r, title: getRoleTitle(r, t) }));
  }, [loggedInUserRole, t, variant]);

  const districtsList: LocationOption[] = formData.divisionId ? (districts[formData.divisionId] || []) : [];
  const upazilasList: LocationOption[] = formData.districtId ? (upazilas[formData.districtId] || []) : [];
  const unionsList: LocationOption[] = formData.upazilaId ? (unions[formData.upazilaId] || []) : [];

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
          const found = districtsList.find((item) => String(item.value) === String(value));
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
          const found = upazilasList.find((item) => String(item.value) === String(value));
          return {
            ...prev,
            upazilaId: value,
            upazila: found?.title || "",
            unionId: "",
            union: "",
          };
        }
        if (name === "unionId") {
          const found = unionsList.find((item) => String(item.value) === String(value));
          return { ...prev, unionId: value, union: found?.title || "" };
        }
        // markazId & others fall through here
        return { ...prev, [name]: value };
      });
    },
    [districtsList, upazilasList, unionsList]
  );

  const { role } = formData;

  const geoAlwaysVisible = variant === "special";
  const hideDivision = !geoAlwaysVisible && role === "centraladmin";
  const hideDistrict = !geoAlwaysVisible && role === "divisionadmin";
  const hideUpazila = !geoAlwaysVisible && (role === "divisionadmin" || role === "districtadmin");
  const hideUnion =
    !geoAlwaysVisible &&
    (role === "divisionadmin" || role === "districtadmin" || role === "upozilaadmin");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpSchemaUser.validate(formData, { abortEarly: false });

      // Build nested data for Prisma create via Better Auth
      const extraData: any = {
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        union: formData.union,
        phone: formData.phone,
      };

      // attach relation only if markaz is selected
      if (formData.markazId) {
        // many-to-many: use connect with array
        extraData.markaz = { connect: [{ id: formData.markazId }] };
      }

      await admin.createUser(
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          data: extraData,
        },
        {
          onSuccess: () => {
            toast.success(t("toasts.created"));
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
              markazId: "",
              phone: "",
              email: "",
              password: "",
            });
          },
          onError: (ctx) => toast.error(ctx.error.message),
        }
      );
    } catch (error: any) {
      if (error?.name === "ValidationError" && Array.isArray(error.inner)) {
        error.inner.forEach((err: any) => toast.error(err.message));
      } else {
        console.error("Error creating user:", error);
        toast.error(t("toasts.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center lg:m-10">
      <div className="w-full p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {variant === "special" ? t("titles.special") : t("titles.standard")}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField label={t("fields.name")} name="name" value={formData.name} onChange={handleChange} />

          <SelectField
            label={t("fields.role")}
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            required
            placeholder={t("select")}
          />

          {!hideDivision && (
            <SelectField
              label={t("fields.division")}
              name="divisionId"
              value={formData.divisionId}
              onChange={handleChange}
              options={divisions}
              required
              placeholder={t("select")}
            />
          )}

          {!hideDistrict && (
            <SelectField
              label={t("fields.district")}
              name="districtId"
              value={formData.districtId}
              onChange={handleChange}
              options={districtsList}
              disabled={!districtsList.length}
              required
              placeholder={t("select")}
            />
          )}

          {!hideUpazila && (
            <SelectField
              label={t("fields.upazila")}
              name="upazilaId"
              value={formData.upazilaId}
              onChange={handleChange}
              options={upazilasList}
              disabled={!upazilasList.length}
              required
              placeholder={t("select")}
            />
          )}

          {!hideUnion && (
            <SelectField
              label={t("fields.union")}
              name="unionId"
              value={formData.unionId}
              onChange={handleChange}
              options={unionsList}
              disabled={!unionsList.length}
              required
              placeholder={t("select")}
            />
          )}

          {(variant === "special" || !hideDivision) && (
            <SelectField
              label={t("fields.markaz")}
              name="markazId" // <-- use ID
              value={formData.markazId}
              onChange={handleChange}
              options={markazOptions}
              required={variant !== "special"}
              placeholder={t("select")}
            />
          )}

          <InputField label={t("fields.phone")} name="phone" value={formData.phone} onChange={handleChange} />
          <InputField label={t("fields.email")} name="email" value={formData.email} onChange={handleChange} />
          <InputField
            type="password"
            label={t("fields.password")}
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
              {loading ? t("buttons.processing") : t("buttons.addUser")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function getRoleTitle(role: string, t: ReturnType<typeof useTranslations>) {
  const map: Record<string, string> = {
    superadmin: t("roles.superadmin"),
    centraladmin: t("roles.centraladmin"),
    divisionadmin: t("roles.divisionadmin"),
    markazadmin: t("roles.markazadmin"),
    daye: t("roles.daye"),
  };
  return map[role] || role;
}

// Reusables
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
  placeholder?: string;
  [key: string]: any;
}
const SelectField: React.FC<SelectFieldProps> = ({ label, options = [], placeholder, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select className="w-full p-2 border rounded-md" {...props}>
      <option value="">{placeholder || "Select"}</option>
      {options.map(({ value, title }) => (
        <option key={value} value={value}>
          {title}
        </option>
      ))}
    </select>
  </div>
);

export default Register;
