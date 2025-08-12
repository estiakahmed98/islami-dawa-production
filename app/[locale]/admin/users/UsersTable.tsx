"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import markazList from "@/app/data/markazList";
import AdminTable from "@/components/AdminTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import { TablePdfExporter } from "@/components/TablePdfExporter";
import AssistantDaeeList from "./assistant-daee-table";

/** ---------------- Types ---------------- */
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  phone: string;
  area: string;
  markaz: string;
  banned: boolean;
}

interface Filters {
  role: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; title: string }>;
}

/** AdminTable expects: { records: { [email]: { [YYYY-MM-DD]: { [rowKey]: value } } }, labelMap: { [rowKey]: label } } */
type RecordsByEmail = Record<string, Record<string, Record<string, any>>>;
type UserDataForAdminTable = { records: RecordsByEmail; labelMap: Record<string, string> };

/** --------------- Helpers --------------- */
const toDateKey = (iso: string) => {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const ensureEmailDateSlot = (records: RecordsByEmail, email: string, dateKey: string) => {
  if (!records[email]) records[email] = {};
  if (!records[email][dateKey]) records[email][dateKey] = {};
  return records[email][dateKey];
};

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, options }) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full p-2 border rounded-md">
        <option value="">{label}</option>
        {options.map((option) => (
          <option className="truncate" key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    </div>
  );
};

/** ------------- Label Maps (rows) ------------- */
const AMOLI_LABELS: Record<string, string> = {
  tahajjud: "তাহাজ্জুদ (মিনিট/রাকাআত)",
  surah: "সূরা",
  ayat: "আয়াত",
  zikir: "যিকির",
  ishraq: "ইশরাক/আওয়াবীন/চাশ্ত",
  jamat: "জামাতে নামাজ",
  sirat: "সীরাত/হাদীস পাঠ",
  Dua: "দোয়া",
  ilm: "ইলম",
  tasbih: "তাসবিহ",
  dayeeAmol: "দায়ীর আমল",
  amoliSura: "আমলী সূরা",
  ayamroja: "আয়াম-এ-বিদ",
  hijbulBahar: "হিজবুল বাহর",
  percentage: "পারসেন্টেজ",
  editorContent: "মতামত",
};

const MOKTOB_LABELS: Record<string, string> = {
  notunMoktobChalu: "নতুন মক্তব চালু",
  totalMoktob: "মোট মক্তব",
  totalStudent: "মোট ছাত্র",
  obhibhabokConference: "অভিভাবক কনফারেন্স",
  moktoThekeMadrasaAdmission: "মক্তব থেকে মাদরাসায় ভর্তি",
  notunBoyoskoShikkha: "নতুন বয়স্ক শিক্ষা",
  totalBoyoskoShikkha: "মোট বয়স্ক শিক্ষা",
  boyoskoShikkhaOnshogrohon: "বয়স্ক শিক্ষায় অংশগ্রহণ",
  newMuslimeDinerFikir: "নতুন মুসলিমের দিনের ফিকির",
  editorContent: "মতামত",
};

const TALIM_LABELS: Record<string, string> = {
  mohilaTalim: "মহিলাদের তালিম",
  mohilaOnshogrohon: "মহিলাদের অংশগ্রহণ",
  editorContent: "মতামত",
};

const DAWATI_LABELS: Record<string, string> = {
  nonMuslimDawat: "অমুসলিমকে দাওয়াত",
  murtadDawat: "মুরতাদকে দাওয়াত",
  alemderSatheyMojlish: "আলেমদের সাথে মজলিশ",
  publicSatheyMojlish: "জনসাধারণের সাথে মজলিশ",
  nonMuslimSaptahikGasht: "অমুসলিম সাপ্তাহিক গাশত",
  editorContent: "মতামত",
};

const DAWATI_MOJLISH_LABELS: Record<string, string> = {
  dawatterGuruttoMojlish: "দাওয়াতের গুরুত্ব মজলিশ",
  mojlisheOnshogrohon: "মজলিশে অংশগ্রহণ",
  prosikkhonKormoshalaAyojon: "প্রশিক্ষণ কর্মশালা আয়োজন",
  prosikkhonOnshogrohon: "প্রশিক্ষণে অংশগ্রহণ",
  jummahAlochona: "জুম্মাহ আলােচনা",
  dhormoSova: "ধর্মসভা",
  mashwaraPoint: "মাশওয়ারা পয়েন্ট",
  editorContent: "মতামত",
};

const JAMAT_LABELS: Record<string, string> = {
  jamatBerHoise: "জামাত বের হয়েছে",
  jamatSathi: "জামাত সাথী",
  editorContent: "মতামত",
};

const DINEFERA_LABELS: Record<string, string> = {
  nonMuslimMuslimHoise: "অমুসলিম মুসলিম হয়েছে",
  murtadIslamFireche: "মুরতাদ ইসলাম ফিরেছে",
  editorContent: "মতামত",
};

const SOFOR_LABELS: Record<string, string> = {
  madrasaVisit: "মাদ্রাসা ভিজিট",
  madrasaVisitList: "মাদ্রাসা ভিজিট তালিকা",
  moktobVisit: "মক্তব ভিজিট",
  schoolCollegeVisit: "স্কুল/কলেজ ভিজিট",
  schoolCollegeVisitList: "স্কুল/কলেজ ভিজিট তালিকা",
  editorContent: "মতামত",
};

/** ---------- Fetchers (build records+labels) ---------- */
async function fetchAmoli(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/amoli?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.tahajjud = r.tahajjud ?? "-";
        slot.surah = r.surah ?? "-";
        slot.ayat = r.ayat ?? "-";
        slot.zikir = r.zikir ?? "-";
        slot.ishraq = r.ishraq ?? "-";
        slot.jamat = r.jamat ?? "-";
        slot.sirat = r.sirat ?? "-";
        slot.Dua = r.Dua ?? "-";
        slot.ilm = r.ilm ?? "-";
        slot.tasbih = r.tasbih ?? "-";
        slot.dayeeAmol = r.dayeeAmol ?? "-";
        slot.amoliSura = r.amoliSura ?? "-";
        slot.ayamroja = r.ayamroja ?? "-";
        slot.hijbulBahar = r.hijbulBahar ?? "-";
        slot.percentage = r.percentage ?? "-";
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: AMOLI_LABELS };
}

async function fetchMoktob(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/moktob?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.notunMoktobChalu = r.notunMoktobChalu ?? "-";
        slot.totalMoktob = r.totalMoktob ?? "-";
        slot.totalStudent = r.totalStudent ?? "-";
        slot.obhibhabokConference = r.obhibhabokConference ?? "-";
        slot.moktoThekeMadrasaAdmission = r.moktoThekeMadrasaAdmission ?? "-";
        slot.notunBoyoskoShikkha = r.notunBoyoskoShikkha ?? "-";
        slot.totalBoyoskoShikkha = r.totalBoyoskoShikkha ?? "-";
        slot.boyoskoShikkhaOnshogrohon = r.boyoskoShikkhaOnshogrohon ?? "-";
        slot.newMuslimeDinerFikir = r.newMuslimeDinerFikir ?? "-";
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: MOKTOB_LABELS };
}

async function fetchTalim(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/talim?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.mohilaTalim = r.mohilaTalim ?? "-";
        slot.mohilaOnshogrohon = r.mohilaOnshogrohon ?? "-";
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: TALIM_LABELS };
}

async function fetchDawati(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/dawati?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.nonMuslimDawat = r.nonMuslimDawat ?? "-";
        slot.murtadDawat = r.murtadDawat ?? "-";
        slot.alemderSatheyMojlish = r.alemderSatheyMojlish ?? "-";
        slot.publicSatheyMojlish = r.publicSatheyMojlish ?? "-";
        slot.nonMuslimSaptahikGasht = r.nonMuslimSaptahikGasht ?? "-";
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: DAWATI_LABELS };
}

async function fetchDawatiMojlish(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/dawatimojlish?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.dawatterGuruttoMojlish = r.dawatterGuruttoMojlish ?? "-";
        slot.mojlisheOnshogrohon = r.mojlisheOnshogrohon ?? "-";
        slot.prosikkhonKormoshalaAyojon = r.prosikkhonKormoshalaAyojon ?? "-";
        slot.prosikkhonOnshogrohon = r.prosikkhonOnshogrohon ?? "-";
        slot.jummahAlochona = r.jummahAlochona ?? "-";
        slot.dhormoSova = r.dhormoSova ?? "-";
        slot.mashwaraPoint = r.mashwaraPoint ?? "-";
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: DAWATI_MOJLISH_LABELS };
}

async function fetchJamat(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/jamat?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.jamatBerHoise = r.jamatBerHoise ?? "-";
        slot.jamatSathi = r.jamatSathi ?? "-";
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: JAMAT_LABELS };
}

async function fetchDineFera(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/dinefera?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.nonMuslimMuslimHoise = r.nonMuslimMuslimHoise ?? "-";
        slot.murtadIslamFireche = r.murtadIslamFireche ?? "-";
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: DINEFERA_LABELS };
}

async function fetchSofor(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  await Promise.all(
    emails.map(async (email) => {
      const res = await fetch(`/api/soforbisoy?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      (json.records || []).forEach((r: any) => {
        const dateKey = toDateKey(r.date);
        const slot = ensureEmailDateSlot(records, email, dateKey);
        slot.madrasaVisit = r.madrasaVisit ?? "-";
        slot.madrasaVisitList = Array.isArray(r.madrasaVisitList) ? r.madrasaVisitList.join("<br/>") : (r.madrasaVisitList || "");
        slot.moktobVisit = r.moktobVisit ?? "-";
        slot.schoolCollegeVisit = r.schoolCollegeVisit ?? "-";
        slot.schoolCollegeVisitList = Array.isArray(r.schoolCollegeVisitList)
          ? r.schoolCollegeVisitList.join("<br/>")
          : (r.schoolCollegeVisitList || "");
        slot.editorContent = r.editorContent || "";
      });
    })
  );
  return { records, labelMap: SOFOR_LABELS };
}

/** ----------------- Component ----------------- */
export default function UsersTable() {
  const t = useTranslations("usersTable");

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [divisionId, setDivisionId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [districtId, setDistrictId] = useState<string>("");
  const [upazilaId, setUpazilaId] = useState<string>("");
  const [unionId, setUnionId] = useState<string>("");

  const [filters, setFilters] = useState<Filters>({
    role: "",
    name: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
  });

  const { data, isPending } = useSession();
  const sessionUser = data?.user;

  const [emailList, setEmailList] = useState<string[]>([]);
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showSaveFirstModal, setShowSaveFirstModal] = useState(false);
  const [showSaveSecondModal, setShowSaveSecondModal] = useState(false);

  // LIVE datasets for AdminTable (loaded from DB)
  const [amoliData, setAmoliData] = useState<UserDataForAdminTable>({ records: {}, labelMap: AMOLI_LABELS });
  const [moktobData, setMoktobData] = useState<UserDataForAdminTable>({ records: {}, labelMap: MOKTOB_LABELS });
  const [talimData, setTalimData] = useState<UserDataForAdminTable>({ records: {}, labelMap: TALIM_LABELS });
  const [dawatiData, setDawatiData] = useState<UserDataForAdminTable>({ records: {}, labelMap: DAWATI_LABELS });
  const [dawatiMojlishData, setDawatiMojlishData] = useState<UserDataForAdminTable>({ records: {}, labelMap: DAWATI_MOJLISH_LABELS });
  const [jamatData, setJamatData] = useState<UserDataForAdminTable>({ records: {}, labelMap: JAMAT_LABELS });
  const [dineFeraData, setDineFeraData] = useState<UserDataForAdminTable>({ records: {}, labelMap: DINEFERA_LABELS });
  const [soforData, setSoforData] = useState<UserDataForAdminTable>({ records: {}, labelMap: SOFOR_LABELS });

  /** role label helper (UI) */
  const roleLabel = (role: string) =>
    t.optional ? t.optional(`filters.roleOptions.${role}`, { default: role }) : t(`filters.roleOptions.${role}`);

  /** Fetch users */
  useEffect(() => {
    if (isPending || !sessionUser) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/usershow`);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isPending, sessionUser]);

  /** Apply filters & collect email list */
  useEffect(() => {
    const filtered = users.filter((user) =>
      Object.entries(filters).every(
        ([key, value]) =>
          !value ||
          (typeof user[key as keyof User] === "string" &&
            (user[key as keyof User] as string)?.toLowerCase().includes(value.toLowerCase()))
      )
    );
    setFilteredUsers(filtered);
    setEmailList(filtered.map((user) => user.email));
  }, [filters, users]);

  /** Fetch DB datasets whenever email list changes */
  useEffect(() => {
    let aborted = false;
    const run = async () => {
      if (!emailList.length) {
        setAmoliData({ records: {}, labelMap: AMOLI_LABELS });
        setMoktobData({ records: {}, labelMap: MOKTOB_LABELS });
        setTalimData({ records: {}, labelMap: TALIM_LABELS });
        setDawatiData({ records: {}, labelMap: DAWATI_LABELS });
        setDawatiMojlishData({ records: {}, labelMap: DAWATI_MOJLISH_LABELS });
        setJamatData({ records: {}, labelMap: JAMAT_LABELS });
        setDineFeraData({ records: {}, labelMap: DINEFERA_LABELS });
        setSoforData({ records: {}, labelMap: SOFOR_LABELS });
        return;
      }
      try {
        const [amoli, moktob, talim, dawati, dawatiMojlish, jamat, dineFera, sofor] = await Promise.allSettled([
          fetchAmoli(emailList),
          fetchMoktob(emailList),
          fetchTalim(emailList),
          fetchDawati(emailList),
          fetchDawatiMojlish(emailList),
          fetchJamat(emailList),
          fetchDineFera(emailList),
          fetchSofor(emailList),
        ]);

        if (!aborted) {
          if (amoli.status === "fulfilled") setAmoliData(amoli.value);
          if (moktob.status === "fulfilled") setMoktobData(moktob.value);
          if (talim.status === "fulfilled") setTalimData(talim.value);
          if (dawati.status === "fulfilled") setDawatiData(dawati.value);
          if (dawatiMojlish.status === "fulfilled") setDawatiMojlishData(dawatiMojlish.value);
          if (jamat.status === "fulfilled") setJamatData(jamat.value);
          if (dineFera.status === "fulfilled") setDineFeraData(dineFera.value);
          if (sofor.status === "fulfilled") setSoforData(sofor.value);
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [emailList.join("|")]);

  /** Edit handlers */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveFirstModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedUser || !sessionUser || sessionUser.role !== "centraladmin") return;

    const formData = new FormData(document.getElementById("edit-user-form") as HTMLFormElement);

    try {
      const divisionId = formData.get("divisionId") as string;
      const districtId = formData.get("districtId") as string;
      const upazilaId = formData.get("upazilaId") as string;
      const unionId = formData.get("unionId") as string;

      const division = divisions.find((d) => d.value.toString() === divisionId)?.title || "";
      const district = districts[divisionId]?.find((d) => d.value.toString() === districtId)?.title || "";
      const upazila = upazilas[districtId]?.find((u) => u.value.toString() === upazilaId)?.title || "";
      const union = unions[upazilaId]?.find((u) => u.value.toString() === unionId)?.title || "";

      const updates = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as string,
        division,
        district,
        upazila,
        union,
        phone: formData.get("phone") as string,
        area: formData.get("area") as string,
        markaz: formData.get("markaz") as string,
      };
      const note = formData.get("note") as string;

      const response = await fetch("/api/usershow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, updates, note }),
      });

      if (!response.ok) throw new Error("Update failed");

      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value.toString()]))
      );
      const res = await fetch(`/api/usershow?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users);

      setSelectedUser(null);
      toast.success(t("toasts.updateSuccess"));
    } catch (error) {
      console.error("Update error:", error);
      toast.error(t("toasts.updateFailed"));
    } finally {
      setShowSaveFirstModal(false);
      setShowSaveSecondModal(false);
    }
  };

  /** Populate location selects when editing */
  useEffect(() => {
    if (selectedUser) {
      const division = divisions.find((d) => d.title === selectedUser.division);
      setDivisionId(division?.value.toString() || "");

      const districtList = division ? districts[division.value] : [];
      const district = districtList.find((d) => d.title === selectedUser.district);
      setDistrictId(district?.value.toString() || "");

      const upazilaList = district ? upazilas[district.value] : [];
      const upazila = upazilaList.find((u) => u.title === selectedUser.upazila);
      setUpazilaId(upazila?.value.toString() || "");

      const unionList = upazila ? unions[upazila.value] : [];
      const union = unionList.find((u) => u.title === selectedUser.union);
      setUnionId(union?.value.toString() || "");
    }
  }, [selectedUser]);

  const handleLocationChange = (name: string, value: string) => {
    switch (name) {
      case "divisionId":
        setDivisionId(value);
        setDistrictId("");
        setUpazilaId("");
        setUnionId("");
        break;
      case "districtId":
        setDistrictId(value);
        setUpazilaId("");
        setUnionId("");
        break;
      case "upazilaId":
        setUpazilaId(value);
        setUnionId("");
        break;
      case "unionId":
        setUnionId(value);
        break;
    }
  };

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value.toString() }));
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    try {
      const response = await fetch("/api/usershow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: !isBanned }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`API error: ${response.statusText}`);
      }

      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, banned: !isBanned } : user)));
      toast.success(
        t("toasts.banUpdated", { action: isBanned ? t("actions.unban").toLowerCase() : t("actions.ban").toLowerCase() })
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(t("toasts.banFailed"));
    }
  };

  if (isPending) {
    return <p className="text-center text-xl p-10">{t("status.authenticating")}</p>;
  }

  const getParentEmail = (user: User, users: User[]): string | null => {
    let parentUser: User | undefined;
    switch (user.role) {
      case "divisionadmin":
        parentUser = users.find((u) => u.role === "centraladmin");
        break;
      case "markazadmin":
        parentUser = users.find((u) => u.role === "divisionadmin" && u.division === user.division);
        if (!parentUser) parentUser = users.find((u) => u.role === "centraladmin");
        break;
      case "daye":
        parentUser = users.find((u) => u.role === "markazadmin" && u.markaz === user.markaz);
        if (!parentUser) parentUser = users.find((u) => u.role === "centraladmin");
        break;
      default:
        return null;
    }
    return parentUser ? `${parentUser.name} (${roleLabel(parentUser.role)})` : null;
  };

  return (
    <div className="w-full mx-auto p-2">
      <div>
        <h1 className="text-2xl font-bold text-center mb-6">{t("title")}</h1>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-3 md:grid-cols-6 gap-4">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border border-slate-500 rounded-md px-4 py-2"
          >
            <option value="">{t("filters.allRoles")}</option>
            <option value="centraladmin">{roleLabel("centraladmin")}</option>
            <option value="divisionadmin">{roleLabel("divisionadmin")}</option>
            <option value="districtadmin">{roleLabel("districtadmin")}</option>
            <option value="upozilaadmin">{roleLabel("upozilaadmin")}</option>
            <option value="unionadmin">{roleLabel("unionadmin")}</option>
            <option value="daye">{roleLabel("daye")}</option>
            <option value="AssistantDaeeList">{t("filters.roleOptions.assistantList")}</option>
          </select>

          {(["name", "division", "district", "upazila", "union"] as (keyof Filters)[]).map((key) => (
            <Input
              key={key}
              type="text"
              placeholder={t(`filters.placeholders.${key}`)}
              className="border-slate-500"
              value={filters[key]}
              onChange={(e) => handleFilterChange(key, e.target.value)}
            />
          ))}

          {sessionUser?.role === "centraladmin" && filters.role !== "AssistantDaeeList" && (
            <TablePdfExporter
              tableData={{
                headers: [
                  t("columns.name"),
                  t("columns.email"),
                  t("columns.role"),
                  t("columns.division"),
                  t("columns.district"),
                  t("columns.upazila"),
                  t("columns.union"),
                  t("columns.phone"),
                  t("columns.markaz"),
                  t("columns.adminAssigned"),
                  t("columns.status"),
                ],
                rows: filteredUsers.map((user) => ({
                  [t("columns.name")]: user.name,
                  [t("columns.email")]: user.email,
                  [t("columns.role")]: roleLabel(user.role),
                  [t("columns.division")]: user.division,
                  [t("columns.district")]: user.district,
                  [t("columns.upazila")]: user.upazila,
                  [t("columns.union")]: user.union,
                  [t("columns.phone")]: user.phone,
                  [t("columns.markaz")]: user.markaz,
                  [t("columns.adminAssigned")]: getParentEmail(user, users) || "N/A",
                  [t("columns.status")]: user.banned ? t("status.banned") : t("status.active"),
                })),
                title: t("export.title"),
                description: t("export.generatedOn", { date: new Date().toLocaleDateString() }),
              }}
              fileName="users_report"
              buttonText={t("export.download")}
              buttonClassName="bg-[#155E75] text-white rounded-md px-4 py-2 hover:bg-[#0f4c6b]"
            />
          )}
        </div>

        {filters.role === "AssistantDaeeList" ? (
          <AssistantDaeeList emails={emailList} users={users} />
        ) : (
          <div className="w-full border border-gray-300 rounded-lg shadow-md overflow-y-auto max-h-[calc(100vh-254px)]">
            <Table className="w-full">
              <TableHeader className="sticky top-0 z-50 bg-[#155E75] shadow-md border-b-2">
                <TableRow className="text-white">
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.name")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.email")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.role")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.division")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.district")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.upazila")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.union")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.phone")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.markaz")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.adminAssigned")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.status")}</TableHead>
                  <TableHead className="border-r text-center border-gray-300 text-white font-bold">{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="text-center">
                    <TableCell className="border-r font-semibold border-gray-300">{user.name}</TableCell>
                    <TableCell className="border-r border-gray-300">{user.email}</TableCell>
                    <TableCell className="border-r border-gray-300">{roleLabel(user.role)}</TableCell>
                    <TableCell className="border-r border-gray-300">{user.division}</TableCell>
                    <TableCell className="border-r border-gray-300">{user.district}</TableCell>
                    <TableCell className="border-r border-gray-300">{user.upazila}</TableCell>
                    <TableCell className="border-r border-gray-300">{user.union}</TableCell>
                    <TableCell className="border-r border-gray-300">{user.phone}</TableCell>
                    <TableCell className="border-r border-gray-300">{user.markaz}</TableCell>
                    <TableCell className="border-r border-gray-300 text-center">
                      {getParentEmail(user, users) || "N/A"}
                    </TableCell>
                    <TableCell className="border-r border-gray-300">{user.banned ? t("status.banned") : t("status.active")}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2 justify-center items-center">
                        <Button onClick={() => toggleBan(user.id, user.banned)} className={user.banned ? "bg-red-500" : "bg-green-500"}>
                          {user.banned ? t("actions.unban") : t("actions.ban")}
                        </Button>
                        <Button className="border-r font-semibold cursor-pointer hover:underline" onClick={() => setSelectedUser(user)}>
                          {t("actions.edit")}
                        </Button>
                        <Button onClick={() => { setUserToDelete(user.id); setShowFirstModal(true); }} className="bg-red-800">
                          {t("actions.delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete confirmations (1) */}
        {showFirstModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
              <h3 className="text-lg font-semibold">{t("modals.deleteConfirmTitle")}</h3>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setShowSecondModal(true);
                  }}
                  className="bg-red-600"
                >
                  {t("modals.yes")}
                </Button>
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setUserToDelete(null);
                  }}
                  className="bg-green-600"
                >
                  {t("modals.no")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmations (2) */}
        {showSecondModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
              <h3 className="text-lg font-semibold">
                {t("modals.deleteWarningTitle")} <br />
                <span className="text-red-600 font-bold">{t("modals.firstContactDev")}</span>
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={async () => {
                    if (!userToDelete) return;
                    try {
                      const response = await fetch("/api/usershow", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: userToDelete }),
                      });
                      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
                      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
                      toast.success(t("toasts.deleteSuccess"));
                    } catch (err) {
                      console.error(err);
                      toast.error(t("toasts.deleteFailed"));
                    } finally {
                      setShowFirstModal(false);
                      setShowSecondModal(false);
                      setUserToDelete(null);
                    }
                  }}
                  className="bg-red-600"
                >
                  {t("modals.delete")}
                </Button>
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setShowSecondModal(false);
                    setUserToDelete(null);
                  }}
                  className="bg-green-600"
                >
                  {t("modals.contactDev")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white m-4 p-6 rounded-lg max-w-[80vh]">
              <h2 className="text-xl font-bold mb-4">
                {t("actions.edit")} {t("columns.name")}: {selectedUser.name}
              </h2>

              <form id="edit-user-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>{t("columns.name")}</label>
                    <Input name="name" defaultValue={selectedUser.name} readOnly={sessionUser?.role !== "centraladmin"} required />
                  </div>

                  <div>
                    <label>{t("columns.email")}</label>
                    <Input name="email" type="email" defaultValue={selectedUser.email} readOnly={sessionUser?.role !== "centraladmin"} required />
                  </div>

                  <div>
                    <label>{t("columns.role")}</label>
                    <select
                      name="role"
                      defaultValue={selectedUser.role}
                      disabled={sessionUser?.role !== "centraladmin"}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="centraladmin">{roleLabel("centraladmin")}</option>
                      <option value="divisionadmin">{roleLabel("divisionadmin")}</option>
                      <option value="districtadmin">{roleLabel("districtadmin")}</option>
                      <option value="markazadmin">{roleLabel("markazadmin")}</option>
                      <option value="upozilaadmin">{roleLabel("upozilaadmin")}</option>
                      <option value="unionadmin">{roleLabel("unionadmin")}</option>
                      <option value="daye">{roleLabel("daye")}</option>
                    </select>
                  </div>

                  {["division", "district", "upazila", "union"].map((field) => (
                    <div key={field}>
                      <label>{t(`columns.${field as "division" | "district" | "upazila" | "union"}`)}</label>
                      <select
                        name={`${field}Id`}
                        value={
                          field === "division" ? divisionId :
                          field === "district" ? districtId :
                          field === "upazila" ? upazilaId : unionId
                        }
                        onChange={(e) => handleLocationChange(`${field}Id`, e.target.value)}
                        disabled={
                          sessionUser?.role !== "centraladmin" ||
                          (field === "district" && !divisionId) ||
                          (field === "upazila" && !districtId) ||
                          (field === "union" && !upazilaId)
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">{t(`filters.placeholders.${field as "division" | "district" | "upazila" | "union"}`)}</option>
                        {field === "division" &&
                          divisions.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.title}
                            </option>
                          ))}
                        {field === "district" &&
                          divisionId &&
                          districts[divisionId]?.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.title}
                            </option>
                          ))}
                        {field === "upazila" &&
                          districtId &&
                          upazilas[districtId]?.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.title}
                            </option>
                          ))}
                        {field === "union" &&
                          upazilaId &&
                          unions[upazilaId]?.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}

                  <div>
                    <label>{t("columns.phone")}</label>
                    <Input name="phone" defaultValue={selectedUser.phone} readOnly={sessionUser?.role !== "centraladmin"} required />
                  </div>

                  <div className="col-span-2">
                    <SelectField
                      label={t("columns.markaz")}
                      name="markaz"
                      value={selectedUser.markaz}
                      onChange={(e) => {
                        setSelectedUser((prev) => (prev ? { ...prev, markaz: e.target.value } : null));
                      }}
                      options={markazList.map(({ name }) => ({
                        value: name,
                        title: name,
                      }))}
                    />
                  </div>

                  {sessionUser?.role === "centraladmin" && (
                    <div className="col-span-2">
                      <label>{t("modals.editNoteLabel")}</label>
                      <textarea name="note" required className="w-full p-2 border rounded-md" />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button type="button" onClick={() => setSelectedUser(null)} variant="outline">
                    {t("modals.cancel")}
                  </Button>
                  {sessionUser?.role === "centraladmin" && <Button type="submit">{t("modals.save")}</Button>}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* --------- UniversalTableShow-backed tabs (live DB) --------- */}
      <div className="mt-8">
        <h3 className="text-center text-2xl font-semibold">{t("totalsTitle")}</h3>
        <div className="border border-[#155E75] lg:p-6 mt-4 rounded-xl overflow-y-auto">
          <Tabs defaultValue="moktob" className="w-full p-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="moktob">{t("tabs.moktob")}</TabsTrigger>
              <TabsTrigger value="talim">{t("tabs.talim")}</TabsTrigger>
              <TabsTrigger value="daye">{t("tabs.daye")}</TabsTrigger>
              <TabsTrigger value="dawati">{t("tabs.dawati")}</TabsTrigger>
              <TabsTrigger value="dawatimojlish">{t("tabs.dawatimojlish")}</TabsTrigger>
              <TabsTrigger value="jamat">{t("tabs.jamat")}</TabsTrigger>
              <TabsTrigger value="dinefera">{t("tabs.dinefera")}</TabsTrigger>
              <TabsTrigger value="sofor">{t("tabs.sofor")}</TabsTrigger>
            </TabsList>

            <TabsContent value="moktob">
              <AdminTable userData={moktobData} emailList={emailList} />
            </TabsContent>
            <TabsContent value="talim">
              <AdminTable userData={talimData} emailList={emailList} />
            </TabsContent>

            <TabsContent value="daye">
              <AdminTable
                userData={{
                  records: (async () => {
                    const records: RecordsByEmail = {};
                    await Promise.all(
                      emailList.map(async (email) => {
                        const res = await fetch(`/api/dayi?email=${encodeURIComponent(email)}`);
                        if (!res.ok) return;
                        const json = await res.json();
                        (json.records || []).forEach((r: any) => {
                          const dateKey = toDateKey(r.date);
                          const slot = ensureEmailDateSlot(records, email, dateKey);
                          slot.sohojogiDayeToiri = r.sohojogiDayeToiri ?? "-";
                          slot.editorContent = r.editorContent || "";
                        });
                      })
                    );
                    return records;
                  })(),
                  labelMap: { sohojogiDayeToiri: "সহযোগী দায়ী তৈরি", editorContent: "মতামত" },
                }}
                emailList={emailList}
              />
            </TabsContent>

            <TabsContent value="dawati">
              <AdminTable userData={dawatiData} emailList={emailList} />
            </TabsContent>

            <TabsContent value="dawatimojlish">
              <AdminTable userData={dawatiMojlishData} emailList={emailList} />
            </TabsContent>

            <TabsContent value="jamat">
              <AdminTable userData={jamatData} emailList={emailList} />
            </TabsContent>

            <TabsContent value="dinefera">
              <AdminTable userData={dineFeraData} emailList={emailList} />
            </TabsContent>

            <TabsContent value="sofor">
              <AdminTable userData={soforData} emailList={emailList} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Save confirmations */}
      {showSaveFirstModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
            <h3 className="text-lg font-semibold">{t("modals.saveConfirmTitle")}</h3>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setShowSaveFirstModal(false);
                  setShowSaveSecondModal(true);
                }}
                className="bg-red-600"
              >
                {t("modals.yes")}
              </Button>
              <Button onClick={() => setShowSaveFirstModal(false)} className="bg-green-600">
                {t("modals.no")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSaveSecondModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
            <h3 className="text-lg font-semibold">
              {t("modals.saveWarningTitle")} <br />
              <span className="text-red-600 font-bold">{t("modals.firstContactDev")}</span>
            </h3>
            <div className="flex justify-center gap-4">
              <Button onClick={handleFinalSubmit} className="bg-red-600">
                {t("modals.saveConfirmProceed")}
              </Button>
              <Button
                onClick={() => {
                  setShowSaveFirstModal(false);
                  setShowSaveSecondModal(false);
                }}
                className="bg-green-600"
              >
                {t("modals.contactDev")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
