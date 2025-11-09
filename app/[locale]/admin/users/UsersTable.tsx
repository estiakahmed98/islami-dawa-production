"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import AdminTable from "@/components/AdminTable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
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
  markazId?: string | null;
  markaz?: { id: string; name: string } | string | null;
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
type UserDataForAdminTable = {
  records: RecordsByEmail;
  labelMap: Record<string, string>;
};

/** --------------- Helpers --------------- */
const toDateKey = (iso: string) => {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const ensureEmailDateSlot = (
  records: RecordsByEmail,
  email: string,
  dateKey: string
) => {
  if (!records[email]) records[email] = {};
  if (!records[email][dateKey]) records[email][dateKey] = {};
  return records[email][dateKey];
};

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-md"
      >
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

const DAYE_LABELS: Record<string, string> = {
  sohojogiDayeToiri: "সহযোগী দায়ী তৈরি",
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
  dawatterGuruttoMojlish: "দাওয়াতি মজলিশ",
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
  if (emails.length === 0) return { records, labelMap: AMOLI_LABELS };

  const res = await fetch(
    `/api/amoli?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: AMOLI_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
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
      slot.editorContent = r.editorContent || "";
    });
  });
  return { records, labelMap: AMOLI_LABELS };
}

async function fetchMoktob(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: MOKTOB_LABELS };

  const res = await fetch(
    `/api/moktob?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: MOKTOB_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
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
  });
  return { records, labelMap: MOKTOB_LABELS };
}

async function fetchTalim(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: TALIM_LABELS };

  const res = await fetch(
    `/api/talim?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: TALIM_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
      const dateKey = toDateKey(r.date);
      const slot = ensureEmailDateSlot(records, email, dateKey);
      slot.mohilaTalim = r.mohilaTalim ?? "-";
      slot.mohilaOnshogrohon = r.mohilaOnshogrohon ?? "-";
      slot.editorContent = r.editorContent || "";
    });
  });
  return { records, labelMap: TALIM_LABELS };
}

async function fetchDaye(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: DAYE_LABELS };

  const res = await fetch(
    `/api/dayi?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: DAYE_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
      const dateKey = toDateKey(r.date);
      const slot = ensureEmailDateSlot(records, email, dateKey);
      slot.sohojogiDayeToiri = r.sohojogiDayeToiri ?? "-";
      slot.editorContent = r.editorContent || "";
    });
  });
  return { records, labelMap: DAYE_LABELS };
}

async function fetchDawati(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: DAWATI_LABELS };

  const res = await fetch(
    `/api/dawati?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: DAWATI_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
      const dateKey = toDateKey(r.date);
      const slot = ensureEmailDateSlot(records, email, dateKey);
      slot.nonMuslimDawat = r.nonMuslimDawat ?? "-";
      slot.murtadDawat = r.murtadDawat ?? "-";
      slot.alemderSatheyMojlish = r.alemderSatheyMojlish ?? "-";
      slot.publicSatheyMojlish = r.publicSatheyMojlish ?? "-";
      slot.nonMuslimSaptahikGasht = r.nonMuslimSaptahikGasht ?? "-";
      slot.editorContent = r.editorContent || "";
    });
  });
  return { records, labelMap: DAWATI_LABELS };
}

async function fetchDawatiMojlish(
  emails: string[]
): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: DAWATI_MOJLISH_LABELS };

  const res = await fetch(
    `/api/dawatimojlish?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: DAWATI_MOJLISH_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
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
  });
  return { records, labelMap: DAWATI_MOJLISH_LABELS };
}

async function fetchJamat(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: JAMAT_LABELS };

  const res = await fetch(
    `/api/jamat?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: JAMAT_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
      const dateKey = toDateKey(r.date);
      const slot = ensureEmailDateSlot(records, email, dateKey);
      slot.jamatBerHoise = r.jamatBerHoise ?? "-";
      slot.jamatSathi = r.jamatSathi ?? "-";
      slot.editorContent = r.editorContent || "";
    });
  });
  return { records, labelMap: JAMAT_LABELS };
}

async function fetchDineFera(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: DINEFERA_LABELS };

  const res = await fetch(
    `/api/dinefera?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: DINEFERA_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
      const dateKey = toDateKey(r.date);
      const slot = ensureEmailDateSlot(records, email, dateKey);
      slot.nonMuslimMuslimHoise = r.nonMuslimMuslimHoise ?? "-";
      slot.murtadIslamFireche = r.murtadIslamFireche ?? "-";
      slot.editorContent = r.editorContent || "";
    });
  });
  return { records, labelMap: DINEFERA_LABELS };
}

async function fetchSofor(emails: string[]): Promise<UserDataForAdminTable> {
  const records: RecordsByEmail = {};
  if (emails.length === 0) return { records, labelMap: SOFOR_LABELS };

  const res = await fetch(
    `/api/soforbisoy?emails=${encodeURIComponent(emails.join(","))}`
  );
  if (!res.ok) return { records, labelMap: SOFOR_LABELS };
  const json = await res.json();
  const emailData = json.records;

  emails.forEach((email) => {
    const userRecords = emailData[email] || [];
    userRecords.forEach((r: any) => {
      const dateKey = toDateKey(r.date);
      const slot = ensureEmailDateSlot(records, email, dateKey);
      slot.madrasaVisit = r.madrasaVisit ?? "-";
      slot.madrasaVisitList = Array.isArray(r.madrasaVisitList)
        ? r.madrasaVisitList.join("<br/>")
        : r.madrasaVisitList || "";
      slot.moktobVisit = r.moktobVisit ?? "-";
      slot.schoolCollegeVisit = r.schoolCollegeVisit ?? "-";
      slot.schoolCollegeVisitList = Array.isArray(r.schoolCollegeVisitList)
        ? r.schoolCollegeVisitList.join("<br/>")
        : r.schoolCollegeVisitList || "";
      slot.editorContent = r.editorContent || "";
    });
  });
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

  const { data, status } = useSession();
  const sessionUser = data?.user;

  const [emailList, setEmailList] = useState<string[]>([]);
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showSaveFirstModal, setShowSaveFirstModal] = useState(false);
  const [showSaveSecondModal, setShowSaveSecondModal] = useState(false);

  const [markazOptions, setMarkazOptions] = useState<
    { value: string; title: string }[]
  >([]);

  // Load Markaz list for selects
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/api/markaz-masjid?pageSize=1000`, {
          cache: "no-store",
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Failed to load markaz");
        const opts = Array.isArray(j?.data)
          ? j.data.map((m: any) => ({
              value: m.id as string,
              title: m.name as string,
            }))
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

  // LIVE datasets for AdminTable (loaded from DB)
  const [amoliData, setAmoliData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: AMOLI_LABELS,
  });
  const [moktobData, setMoktobData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: MOKTOB_LABELS,
  });
  const [talimData, setTalimData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: TALIM_LABELS,
  });
  const [dayeData, setDayeData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: DAYE_LABELS,
  });
  const [dawatiData, setDawatiData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: DAWATI_LABELS,
  });
  const [dawatiMojlishData, setDawatiMojlishData] =
    useState<UserDataForAdminTable>({
      records: {},
      labelMap: DAWATI_MOJLISH_LABELS,
    });
  const [jamatData, setJamatData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: JAMAT_LABELS,
  });
  const [dineFeraData, setDineFeraData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: DINEFERA_LABELS,
  });
  const [soforData, setSoforData] = useState<UserDataForAdminTable>({
    records: {},
    labelMap: SOFOR_LABELS,
  });

  /** role label helper (UI) */
  const roleLabel = (role: string) => {
    try {
      return t(`filters.roleOptions.${role}`);
    } catch {
      return role;
    }
  };

  /** Fetch users */
  useEffect(() => {
    if (status === "loading" || !sessionUser) return;
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
  }, [status, sessionUser]);

  /** Apply filters & collect email list */
  useEffect(() => {
    const filtered = users
      .filter((user) => canViewUser(user))
      .filter((user) =>
        Object.entries(filters).every(
          ([key, value]) =>
            !value ||
            (typeof user[key as keyof User] === "string" &&
              (user[key as keyof User] as string)
                ?.toLowerCase()
                .includes(value.toLowerCase()))
        )
      );
    setFilteredUsers(filtered);
    setEmailList(filtered.map((user) => user.email));
  }, [filters, users, (sessionUser as any)?.email, (sessionUser as any)?.role]);

  /** Fetch DB datasets whenever email list changes */
  useEffect(() => {
    let aborted = false;
    const run = async () => {
      if (!emailList.length) {
        setAmoliData({ records: {}, labelMap: AMOLI_LABELS });
        setMoktobData({ records: {}, labelMap: MOKTOB_LABELS });
        setTalimData({ records: {}, labelMap: TALIM_LABELS });
        setDayeData({ records: {}, labelMap: DAYE_LABELS });
        setDawatiData({ records: {}, labelMap: DAWATI_LABELS });
        setDawatiMojlishData({ records: {}, labelMap: DAWATI_MOJLISH_LABELS });
        setJamatData({ records: {}, labelMap: JAMAT_LABELS });
        setDineFeraData({ records: {}, labelMap: DINEFERA_LABELS });
        setSoforData({ records: {}, labelMap: SOFOR_LABELS });
        return;
      }
      try {
        const [
          amoli,
          moktob,
          talim,
          daye,
          dawati,
          dawatiMojlish,
          jamat,
          dineFera,
          sofor,
        ] = await Promise.allSettled([
          fetchAmoli(emailList),
          fetchMoktob(emailList),
          fetchTalim(emailList),
          fetchDaye(emailList),
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
          if (daye.status === "fulfilled") setDayeData(daye.value);
          if (dawati.status === "fulfilled") setDawatiData(dawati.value);
          if (dawatiMojlish.status === "fulfilled")
            setDawatiMojlishData(dawatiMojlish.value);
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
    if (!selectedUser || !sessionUser || sessionUser.role !== "centraladmin")
      return;

    const formData = new FormData(
      document.getElementById("edit-user-form") as HTMLFormElement
    );

    try {
      const divisionId = formData.get("divisionId") as string;
      const districtId = formData.get("districtId") as string;
      const upazilaId = formData.get("upazilaId") as string;
      const unionId = formData.get("unionId") as string;

      const division =
        divisions.find((d) => d.value.toString() === divisionId)?.title || "";
      const district =
        (districts as Record<number, any>)[+divisionId]?.find(
          (d: any) => d.value.toString() === districtId
        )?.title || "";
      const upazila =
        (upazilas as Record<number, any>)[+districtId]?.find(
          (u: any) => u.value.toString() === upazilaId
        )?.title || "";
      const union =
        (unions as Record<number, any>)[+upazilaId]?.find(
          (u: any) => u.value.toString() === unionId
        )?.title || "";

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
        markazId: (formData.get("markazId") as string) || null,
      };
      const note = formData.get("note") as string;

      const response = await fetch("/api/usershow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, updates, note }),
      });

      if (!response.ok) throw new Error("Update failed");

      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, value.toString()])
        )
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

      const districtList = division
        ? (districts as Record<number, any>)[+division.value]
        : [];
      const district = districtList.find(
        (d: { value: string; title: string }) =>
          d.title === selectedUser.district
      );
      setDistrictId(district?.value.toString() || "");

      const upazilaList = district
        ? (upazilas as Record<number, any>)[+district.value]
        : [];
      const upazila = upazilaList.find(
        (u: { value: string; title: string }) =>
          u.title === selectedUser.upazila
      );
      setUpazilaId(upazila?.value.toString() || "");

      const unionList = upazila
        ? (unions as Record<number, any>)[+upazila.value]
        : [];
      const union = unionList.find(
        (u: { value: string; title: string }) => u.title === selectedUser.union
      );
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
      const response = await fetch("/api/banuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: !isBanned }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error(t("toasts.unauthorized"));
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API error: ${response.statusText}`
        );
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, banned: !isBanned } : user
        )
      );
      toast.success(
        t("toasts.banUpdated", {
          action: isBanned
            ? t("actions.unban").toLowerCase()
            : t("actions.ban").toLowerCase(),
        })
      );
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(error.message || t("toasts.banFailed"));
    }
  };

  if (status === "loading") {
    return (
      <p className="text-center text-xl p-10">{t("status.authenticating")}</p>
    );
  }

  // Helpers to normalize/compare Markaz (single relation)
  const getMarkazId = (u: any): string | null => {
    if (!u) return null;
    return (
      u.markazId ||
      (u.markaz && typeof u.markaz !== "string" ? u.markaz.id : null)
    );
  };
  const getMarkazName = (u: any): string => {
    if (!u?.markaz) return "";
    if (typeof u.markaz === "string") return u.markaz;
    return u.markaz.name || "";
  };
  const shareMarkaz = (a: any, b: any): boolean => {
    const aId = getMarkazId(a);
    const bId = getMarkazId(b);
    if (aId && bId) return aId === bId;
    const aName = getMarkazName(a);
    const bName = getMarkazName(b);
    if (aName && bName) return aName === bName;
    return false;
  };
  // Parent resolution updated for single markaz relation
  const getParentEmail = (
    user: User,
    users: User[],
    loggedInUser: User | null
  ): string | null => {
    let parentUser: User | undefined;

    switch (user.role) {
      case "divisionadmin": {
        parentUser =
          (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
          users.find((u) => u.role === "centraladmin");
        break;
      }
      case "markazadmin": {
        parentUser =
          users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          ) ||
          (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
          users.find((u) => u.role === "centraladmin");
        break;
      }
      case "daye": {
        parentUser =
          users.find((u) => u.role === "markazadmin" && shareMarkaz(u, user)) ||
          (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
          users.find((u) => u.role === "centraladmin");
        break;
      }
      default:
        return null;
    }

    return parentUser ? parentUser.email : null;
  };

  // View control: who can see which users in the table
  const canViewUser = (u: User): boolean => {
    // No session -> nothing to show (but upstream we guard on status/loading)
    if (!sessionUser) return false;
    // Central admin sees everyone
    if ((sessionUser as any).role === "centraladmin") return true;
    // Always allow user to view own row
    if ((sessionUser as any).email === u.email) return true;
    // Otherwise, only if the logged-in user is the computed parent admin
    const parent = getParentEmail(u, users, sessionUser as any);
    return parent === (sessionUser as any).email;
  };

  return (
    <div className="w-full h-full mx-auto p-2">
      <div className="h-auto mt-8 mb-8">
        <h1 className="text-2xl font-bold text-center mb-4">{t("title")}</h1>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border border-slate-500 rounded-md px-3 py-2 text-sm"
          >
            <option value="">{t("filters.allRoles")}</option>
            {sessionUser?.role === "centraladmin" && (
              <>
                <option value="divisionadmin">
                  {roleLabel("divisionadmin")}
                </option>
                <option value="markazadmin">{roleLabel("markazadmin")}</option>
                <option value="daye">{roleLabel("daye")}</option>
              </>
            )}
            {sessionUser?.role === "divisionadmin" && (
              <>
                <option value="markazadmin">{roleLabel("markazadmin")}</option>
                <option value="daye">{roleLabel("daye")}</option>
              </>
            )}
            {sessionUser?.role === "markazadmin" && (
              <option value="daye">{roleLabel("daye")}</option>
            )}
            {["centraladmin", "divisionadmin", "markazadmin"].includes(
              sessionUser?.role as string
            ) && (
              <option value="AssistantDaeeList">
                {t("filters.roleOptions.assistantList")}
              </option>
            )}
          </select>

          {(
            [
              "name",
              "division",
              "district",
              "upazila",
              "union",
            ] as (keyof Filters)[]
          ).map((key) => (
            <Input
              key={key}
              type="text"
              placeholder={t(`filters.placeholders.${key}`)}
              className="border-slate-500 text-sm"
              value={filters[key]}
              onChange={(e) => handleFilterChange(key, e.target.value)}
            />
          ))}

          {sessionUser?.role === "centraladmin" &&
            filters.role !== "AssistantDaeeList" && (
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
                    [t("columns.markaz")]: getMarkazName(user) || "N/A",
                    [t("columns.adminAssigned")]:
                      getParentEmail(user, users, sessionUser as any) || "N/A",
                    [t("columns.status")]: user.banned
                      ? t("status.banned")
                      : t("status.active"),
                  })),
                  title: t("export.title"),
                  description: t("export.generatedOn", {
                    date: new Date().toLocaleDateString(),
                  }),
                }}
                fileName="users_report"
                buttonText={t("export.download")}
                buttonClassName="bg-[#155E75] text-white rounded-md px-3 py-2 text-sm hover:bg-[#0f4c6b]"
              />
            )}
        </div>

        {filters.role === "AssistantDaeeList" ? (
          <AssistantDaeeList emails={emailList} users={users} />
        ) : (
          <div className="w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-y-auto max-h-[45vh]">
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-50 bg-[#155E75] shadow-md border-b-2">
                  <TableRow className="text-white">
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.name")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.email")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.role")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.division")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.district")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.upazila")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.union")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.phone")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.markaz")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.adminAssigned")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.status")}
                    </TableHead>
                    <TableHead className="border-r text-center border-gray-300 text-white font-bold text-sm px-2 py-3">
                      {t("columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="text-center hover:bg-gray-50">
                      <TableCell className="border-r font-semibold border-gray-300 text-sm px-2 py-2">
                        {user.name}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {user.email}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {roleLabel(user.role)}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {user.division}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {user.district}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {user.upazila}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {user.union}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {user.phone}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {getMarkazName(user) || "N/A"}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-center text-sm px-2 py-2">
                        {getParentEmail(user, users, sessionUser as any) || "N/A"}
                      </TableCell>
                      <TableCell className="border-r border-gray-300 text-sm px-2 py-2">
                        {user.banned ? t("status.banned") : t("status.active")}
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <div className="flex flex-col space-y-1 items-center">
                          <Button
                            onClick={() => toggleBan(user.id, user.banned)}
                            className={`text-xs px-2 py-1 ${
                              user.banned ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {user.banned ? t("actions.unban") : t("actions.ban")}
                          </Button>
                          <Button
                            className="text-xs px-2 py-1 border hover:underline"
                            onClick={() => setSelectedUser(user)}
                          >
                            {t("actions.edit")}
                          </Button>
                          <Button
                            onClick={() => {
                              setUserToDelete(user.id);
                              setShowFirstModal(true);
                            }}
                            className="text-xs px-2 py-1 bg-red-800 hover:bg-red-900"
                          >
                            {t("actions.delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Delete confirmations (1) */}
        {showFirstModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
              <h3 className="text-lg font-semibold">
                {t("modals.deleteConfirmTitle")}
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setShowSecondModal(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2"
                >
                  {t("modals.yes")}
                </Button>
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setUserToDelete(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2"
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
                <span className="text-red-600 font-bold">
                  {t("modals.firstContactDev")}
                </span>
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
                      if (!response.ok)
                        throw new Error(`API error: ${response.statusText}`);
                      setUsers((prev) =>
                        prev.filter((u) => u.id !== userToDelete)
                      );
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
                  className="bg-red-600 hover:bg-red-700 px-4 py-2"
                >
                  {t("modals.delete")}
                </Button>
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setShowSecondModal(false);
                    setUserToDelete(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2"
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
            <div className="bg-white m-4 p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {t("actions.edit")} {t("columns.name")}: {selectedUser.name}
              </h2>

              <form id="edit-user-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("columns.name")}
                    </label>
                    <Input
                      name="name"
                      defaultValue={selectedUser.name}
                      readOnly={sessionUser?.role !== "centraladmin"}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("columns.email")}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={selectedUser.email}
                      readOnly={sessionUser?.role !== "centraladmin"}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      {t("columns.markaz")}
                    </label>
                    <SelectField
                      label={t("columns.markaz")}
                      name="markazId"
                      value={selectedUser.markazId || ""}
                      onChange={(e) => {
                        setSelectedUser((prev) =>
                          prev ? { ...prev, markazId: e.target.value } : null
                        );
                      }}
                      options={markazOptions}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("columns.role")}
                    </label>
                    <select
                      name="role"
                      defaultValue={selectedUser.role}
                      disabled={sessionUser?.role !== "centraladmin"}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="centraladmin">
                        {roleLabel("centraladmin")}
                      </option>
                      <option value="divisionadmin">
                        {roleLabel("divisionadmin")}
                      </option>
                      <option value="markazadmin">
                        {roleLabel("markazadmin")}
                      </option>
                      <option value="daye">{roleLabel("daye")}</option>
                    </select>
                  </div>

                  {[
                    "division",
                    "district",
                    "upazila",
                    "union",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-1">
                        {t(
                          `columns.${field as "division" | "district" | "upazila" | "union"}`
                        )}
                      </label>
                      <select
                        name={`${field}Id`}
                        value={
                          field === "division"
                            ? divisionId
                            : field === "district"
                              ? districtId
                              : field === "upazila"
                                ? upazilaId
                                : unionId
                        }
                        onChange={(e) =>
                          handleLocationChange(`${field}Id`, e.target.value)
                        }
                        disabled={
                          sessionUser?.role !== "centraladmin" ||
                          (field === "district" && !divisionId) ||
                          (field === "upazila" && !districtId) ||
                          (field === "union" && !upazilaId)
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">
                          {t(
                            `filters.placeholders.${field as "division" | "district" | "upazila" | "union"}`
                          )}
                        </option>
                        {field === "division" &&
                          divisions.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.title}
                            </option>
                          ))}
                        {field === "district" &&
                          divisionId &&
                          (districts as Record<number, any>)[+divisionId]?.map(
                            (d: { value: string; title: string }) => (
                              <option key={d.value} value={d.value}>
                                {d.title}
                              </option>
                            )
                          )}
                        {field === "upazila" &&
                          districtId &&
                          (upazilas as Record<number, any>)[+districtId]?.map(
                            (u: { value: string; title: string }) => (
                              <option key={u.value} value={u.value}>
                                {u.title}
                              </option>
                            )
                          )}
                        {field === "union" &&
                          upazilaId &&
                          (unions as Record<number, any>)[+upazilaId]?.map(
                            (u: { value: string; title: string }) => (
                              <option key={u.value} value={u.value}>
                                {u.title}
                              </option>
                            )
                          )}
                      </select>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("columns.phone")}
                    </label>
                    <Input
                      name="phone"
                      defaultValue={selectedUser.phone}
                      readOnly={sessionUser?.role !== "centraladmin"}
                      required
                    />
                  </div>

                  {sessionUser?.role === "centraladmin" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {t("modals.editNoteLabel")}
                      </label>
                      <textarea
                        name="note"
                        required
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    variant="outline"
                  >
                    {t("modals.cancel")}
                  </Button>
                  {sessionUser?.role === "centraladmin" && (
                    <Button type="submit">{t("modals.save")}</Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* --------- UniversalTableShow-backed tabs (live DB) --------- */}
      <div className="mt-12">
        <h3 className="text-center text-2xl font-semibold mb-4">
          {t("totalsTitle")}
        </h3>
        <div className="border border-[#155E75] lg:p-4 rounded-xl">
          <Tabs defaultValue="moktob" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="moktob">{t("tabs.moktob")}</TabsTrigger>
              <TabsTrigger value="talim">{t("tabs.talim")}</TabsTrigger>
              <TabsTrigger value="daye">{t("tabs.daye")}</TabsTrigger>
              <TabsTrigger value="dawati">{t("tabs.dawati")}</TabsTrigger>
              <TabsTrigger value="dawatimojlish">
                {t("tabs.dawatimojlish")}
              </TabsTrigger>
              <TabsTrigger value="jamat">{t("tabs.jamat")}</TabsTrigger>
              <TabsTrigger value="dinefera">{t("tabs.dinefera")}</TabsTrigger>
              <TabsTrigger value="sofor">{t("tabs.sofor")}</TabsTrigger>
            </TabsList>

            <TabsContent value="moktob">
              <AdminTable
                userData={moktobData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>
            <TabsContent value="talim">
              <AdminTable
                userData={talimData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>

            <TabsContent value="daye">
              <AdminTable
                userData={dayeData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>

            <TabsContent value="dawati">
              <AdminTable
                userData={dawatiData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>

            <TabsContent value="dawatimojlish">
              <AdminTable
                userData={dawatiMojlishData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>

            <TabsContent value="jamat">
              <AdminTable
                userData={jamatData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>

            <TabsContent value="dinefera">
              <AdminTable
                userData={dineFeraData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>

            <TabsContent value="sofor">
              <AdminTable
                userData={soforData}
                emailList={emailList}
                users={users}
                allTabsData={{
                  moktobData,
                  talimData,
                  dayeData,
                  dawatiData,
                  dawatiMojlishData,
                  jamatData,
                  dineFeraData,
                  soforData,
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Save confirmations */}
      {showSaveFirstModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
            <h3 className="text-lg font-semibold">
              {t("modals.saveConfirmTitle")}
            </h3>
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
              <Button
                onClick={() => setShowSaveFirstModal(false)}
                className="bg-green-600"
              >
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
              <span className="text-red-600 font-bold">
                {t("modals.firstContactDev")}
              </span>
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
