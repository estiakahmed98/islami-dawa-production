// app/(whatever)/AdminDashboard.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelectedUser } from "@/providers/treeProvider";
import { useSession } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton";
import TallyAdmin from "@/components/TallyAdmin";
import AmoliChartAdmin from "@/components/AmoliChartAdmin";
import AdminTable from "@/components/AdminTable";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// ----------------- Types -----------------
type MarkazRef = { id: string; name: string };

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  // after schema change: single object or null; legacy string tolerated from older endpoints
  markaz?: MarkazRef | string | null;
  markazId?: string | null;
}

type RecordsByEmail = Record<string, Record<string, any>>;
type LabelMap = Record<string, string | undefined>;
type LabeledData = {
  records: RecordsByEmail;
  labelMap: LabelMap;
  meta?: {
    assistants?: Record<string, Record<string, any[]>>; // [email][date] -> Assistant[]
    madrasa?: Record<string, Record<string, string[]>>;  // [email][date] -> string[]
    school?: Record<string, Record<string, string[]>>;   // [email][date] -> string[]
  };
};

type EndpointDef = {
  key:
    | "amoli"
    | "moktob"
    | "talim"
    | "daye"
    | "dawati"
    | "dawatimojlish"
    | "jamat"
    | "dinefera"
    | "sofor";
  url: string;
  setter: React.Dispatch<React.SetStateAction<LabeledData>>;
  labelMap: LabelMap;
};

// ----------------- Helpers -----------------
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dhakaYMD(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function toNumberedHTML(arr: unknown): string {
  const list = Array.isArray(arr) ? arr.filter(Boolean).map(String) : [];
  if (list.length === 0) return "";
  return list.map((item, idx) => `${idx + 1}. ${item}`).join("<br/>");
}

// --- markaz normalization (single relation, legacy safe) ---
const getMarkazId = (u?: User): string | null => {
  if (!u) return null;
  if (u.markaz && typeof u.markaz !== "string") return u.markaz.id ?? u.markazId ?? null;
  return u.markazId ?? null;
};
const getMarkazName = (u?: User): string | null => {
  if (!u?.markaz) return null;
  return typeof u.markaz === "string" ? u.markaz : (u.markaz.name ?? null);
};
const shareMarkaz = (a: User, b: User): boolean => {
  const aId = getMarkazId(a);
  const bId = getMarkazId(b);
  if (aId && bId) return aId === bId;
  const aName = getMarkazName(a);
  const bName = getMarkazName(b);
  if (aName && bName) return aName === bName;
  return false;
};

// parent resolver using roles + markaz/division scopes
const getParentEmail = (user: User, users: User[], loggedInUser: User | null): string | null => {
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
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
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
    // legacy roles - keep for compatibility
    case "unionadmin": {
      parentUser =
        users.find((u) => u.role === "upozilaadmin" && u.upazila === user.upazila) ||
        users.find((u) => u.role === "districtadmin" && u.district === user.district) ||
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "upozilaadmin": {
      parentUser =
        users.find((u) => u.role === "districtadmin" && u.district === user.district) ||
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    case "districtadmin": {
      parentUser =
        users.find((u) => u.role === "divisionadmin" && u.division === user.division) ||
        users.find((u) => u.role === "centraladmin");
      break;
    }
    default:
      return null;
  }

  return parentUser ? parentUser.email : null;
};

// Users API may return an array or `{ users: User[] }`
async function readUsers(res: Response): Promise<User[]> {
  const json = await res.json();
  if (Array.isArray(json)) return json as User[];
  if (Array.isArray(json?.users)) return json.users as User[];
  return [];
}

// ----------------- Component -----------------
const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { selectedUser } = useSelectedUser();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchMonth, setSearchMonth] = useState<string>("");

  const [users, setUsers] = useState<User[]>([]);
  const [emailList, setEmailList] = useState<string[]>(userEmail ? [userEmail] : []);
  const [loading, setLoading] = useState<boolean>(false);

  const [amoliData, setAmoliData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [moktobData, setMoktobData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [dawatiData, setDawatiData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [dawatiMojlishData, setDawatiMojlishData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [jamatData, setJamatData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [dineFeraData, setDineFeraData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [talimData, setTalimData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [soforData, setSoforData] = useState<LabeledData>({ records: {}, labelMap: {} });
  const [dayeData, setDayeData] = useState<LabeledData>({ records: {}, labelMap: {} });

  // ---------- Modal state ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDateKey, setModalDateKey] = useState("");
  const [modalType, setModalType] = useState<"assistants" | "madrasa" | "school" | null>(null);
  const [modalItems, setModalItems] = useState<any[]>([]);
  const t = useTranslations("dashboard.adminDashboard");

  // ---------- fetch users ----------
  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch users");
        const usersData = await readUsers(res);
        setUsers(usersData);
      } catch (e) {
        console.error(e);
        toast.error(t("error.userLoad"));
      }
    };
    go();
  }, [t]);

  // ---------- compute emailList ----------
  useEffect(() => {
    if (!userEmail || users.length === 0) return;

    const loggedIn = users.find((u) => u.email === userEmail) || null;
    if (!loggedIn) return;

    let collected: string[] = [loggedIn.email];

    const findChildEmails = (parentEmail: string) => {
      users.forEach((u) => {
        if (getParentEmail(u, users, loggedIn) === parentEmail) {
          collected.push(u.email);
          findChildEmails(u.email);
        }
      });
    };
    findChildEmails(loggedIn.email);

    // legacy scope add (optional; keep for compatibility)
    const includeDayeByScope = (scope: Partial<User>) => {
      const dayeEmails = users
        .filter(
          (u) =>
            u.role === "daye" &&
            Object.entries(scope).every(([k, v]) => (u as any)[k] === v)
        )
        .map((u) => u.email);
      collected = [...new Set([...collected, ...dayeEmails])];
    };

    if ((loggedIn as any).role === "unionadmin") includeDayeByScope({ union: loggedIn.union });
    else if ((loggedIn as any).role === "upozilaadmin") includeDayeByScope({ upazila: loggedIn.upazila });
    else if ((loggedIn as any).role === "districtadmin") includeDayeByScope({ district: loggedIn.district });
    else if (loggedIn.role === "divisionadmin") includeDayeByScope({ division: loggedIn.division });
    else if (loggedIn.role === "centraladmin") {
      const dayeAll = users.filter((u) => u.role === "daye").map((u) => u.email);
      collected = [...new Set([...collected, ...dayeAll])];
    }

    if (selectedUser) {
      const chosen = users.find((u) => u.email === selectedUser);
      if (chosen) {
        let selEmails: string[] = [chosen.email];
        const findChild = (parentEmail: string) => {
          users.forEach((u) => {
            if (getParentEmail(u, users, loggedIn) === parentEmail) {
              selEmails.push(u.email);
              findChild(u.email);
            }
          });
        };
        findChild(chosen.email);

        if ((chosen as any).role === "unionadmin")
          selEmails = [
            ...new Set([
              ...selEmails,
              ...users.filter((u) => u.role === "daye" && u.union === chosen.union).map((u) => u.email),
            ]),
          ];
        else if ((chosen as any).role === "upozilaadmin")
          selEmails = [
            ...new Set([
              ...selEmails,
              ...users.filter((u) => u.role === "daye" && u.upazila === chosen.upazila).map((u) => u.email),
            ]),
          ];
        else if ((chosen as any).role === "districtadmin")
          selEmails = [
            ...new Set([
              ...selEmails,
              ...users.filter((u) => u.role === "daye" && u.district === chosen.district).map((u) => u.email),
            ]),
          ];
        else if (chosen.role === "divisionadmin")
          selEmails = [
            ...new Set([
              ...selEmails,
              ...users.filter((u) => u.role === "daye" && u.division === chosen.division).map((u) => u.email),
            ]),
          ];
        else if (chosen.role === "centraladmin")
          selEmails = [
            ...new Set([...selEmails, ...users.filter((u) => u.role === "daye").map((u) => u.email)]),
          ];

        setEmailList(selEmails);
      } else {
        setEmailList([selectedUser]);
      }
    } else {
      setEmailList(collected);
    }
  }, [selectedUser, users, userEmail]);

  // ---------- endpoints ----------
  const endpoints: EndpointDef[] = useMemo(
    () => [
      {
        key: "amoli",
        url: "/api/amoli",
        setter: setAmoliData,
        labelMap: {
          tahajjud: t("amoli.tahajjud"),
          surah: t("amoli.surah"),
          ayat: t("amoli.ayat"),
          zikir: t("amoli.zikir"),
          ishraq: t("amoli.ishraq"),
          jamat: t("amoli.jamat"),
          sirat: t("amoli.sirat"),
          Dua: t("amoli.dua"),
          ilm: t("amoli.ilm"),
          tasbih: t("amoli.tasbih"),
          dayeeAmol: t("amoli.dayeeAmol"),
          amoliSura: t("amoli.amoliSura"),
          ayamroja: t("amoli.ayamroja"),
          hijbulBahar: t("amoli.hijbulBahar"),
        },
      },
      {
        key: "moktob",
        url: "/api/moktob",
        setter: setMoktobData,
        labelMap: {
          notunMoktobChalu: t("moktob.notunMoktobChalu"),
          totalMoktob: t("moktob.totalMoktob"),
          totalStudent: t("moktob.totalStudent"),
          obhibhabokConference: t("moktob.obhibhabokConference"),
          moktoThekeMadrasaAdmission: t("moktob.moktoThekeMadrasaAdmission"),
          notunBoyoskoShikkha: t("moktob.notunBoyoskoShikkha"),
          totalBoyoskoShikkha: t("moktob.totalBoyoskoShikkha"),
          boyoskoShikkhaOnshogrohon: t("moktob.boyoskoShikkhaOnshogrohon"),
          newMuslimeDinerFikir: t("moktob.newMuslimeDinerFikir"),
        },
      },
      {
        key: "talim",
        url: "/api/talim",
        setter: setTalimData,
        labelMap: {
          mohilaTalim: t("talim.mohilaTalim"),
          mohilaOnshogrohon: t("talim.mohilaOnshogrohon"),
        },
      },
      {
        key: "daye",
        url: "/api/dayi",
        setter: setDayeData,
        labelMap: {
          sohojogiDayeToiri: t("daye.sohojogiDayeToiri"),
          assistantsList: t("daye.assistantsList"),
        },
      },
      {
        key: "dawati",
        url: "/api/dawati",
        setter: setDawatiData,
        labelMap: {
          nonMuslimDawat: t("dawati.nonMuslimDawat"),
          murtadDawat: t("dawati.murtadDawat"),
          nonMuslimSaptahikGasht: t("dawati.nonMuslimSaptahikGasht"),
        },
      },
      {
        key: "dawatimojlish",
        url: "/api/dawatimojlish",
        setter: setDawatiMojlishData,
        labelMap: {
          dawatterGuruttoMojlish: t("dawatiMojlish.dawatterGuruttoMojlish"),
          mojlisheOnshogrohon: t("dawatiMojlish.mojlisheOnshogrohon"),
          prosikkhonKormoshalaAyojon: t("dawatiMojlish.prosikkhonKormoshalaAyojon"),
          prosikkhonOnshogrohon: t("dawatiMojlish.prosikkhonOnshogrohon"),
          jummahAlochona: t("dawatiMojlish.jummahAlochona"),
          dhormoSova: t("dawatiMojlish.dhormoSova"),
          mashwaraPoint: t("dawatiMojlish.mashwaraPoint"),
        },
      },
      {
        key: "jamat",
        url: "/api/jamat",
        setter: setJamatData,
        labelMap: {
          jamatBerHoise: t("jamat.jamatBerHoise"),
          jamatSathi: t("jamat.jamatSathi"),
        },
      },
      {
        key: "dinefera",
        url: "/api/dinefera",
        setter: setDineFeraData,
        labelMap: {
          nonMuslimMuslimHoise: t("dineFera.nonMuslimMuslimHoise"),
          murtadIslamFireche: t("dineFera.murtadIslamFireche"),
        },
      },
      {
        key: "sofor",
        url: "/api/soforbisoy",
        setter: setSoforData,
        labelMap: {
          moktobVisit: t("sofor.moktobVisit"),
          madrasaVisit: t("sofor.madrasaVisit"),
          schoolCollegeVisit: t("sofor.schoolCollegeVisit"),
          madrasaVisitList: t("sofor.madrasaVisitList"),
          schoolCollegeVisitList: t("sofor.schoolCollegeVisitList"),
        },
      },
    ],
    [t]
  );

  // merge helper + collect meta
  const mergeEmailRecords = (
    acc: RecordsByEmail,
    email: string,
    rawRecords: any[],
    meta: LabeledData["meta"],
    key: EndpointDef["key"]
  ) => {
    if (!acc[email]) acc[email] = {};
    const records = Array.isArray(rawRecords) ? rawRecords : [];
    records.forEach((rec) => {
      const dateKey = dhakaYMD(new Date(rec.date));
      const copy: any = { ...rec };

      if (key === "daye") {
        meta!.assistants = meta!.assistants || {};
        meta!.assistants[email] = meta!.assistants[email] || {};
        meta!.assistants[email][dateKey] = Array.isArray(rec.assistants) ? rec.assistants : [];
      }
      if (key === "sofor") {
        meta!.madrasa = meta!.madrasa || {};
        meta!.school = meta!.school || {};
        meta!.madrasa[email] = meta!.madrasa[email] || {};
        meta!.school[email] = meta!.school[email] || {};
        meta!.madrasa[email][dateKey] = Array.isArray(rec.madrasaVisitList) ? rec.madrasaVisitList : [];
        meta!.school[email][dateKey] = Array.isArray(rec.schoolCollegeVisitList) ? rec.schoolCollegeVisitList : [];
      }

      if (copy.madrasaVisitList) copy.madrasaVisitList = toNumberedHTML(copy.madrasaVisitList);
      if (copy.schoolCollegeVisitList) copy.schoolCollegeVisitList = toNumberedHTML(copy.schoolCollegeVisitList);
      if (copy.assistants) {
        copy.assistants = toNumberedHTML((copy.assistants as any[]).map((a) => `${a.name} (${a.phone})`));
        copy.assistantsList = copy.assistants;
      }

      acc[email][dateKey] = copy;
    });
    return acc;
  };

  // fetch everything whenever emailList changes
  useEffect(() => {
    const go = async () => {
      if (!emailList.length) return;
      setLoading(true);
      try {
        await Promise.all(
          endpoints.map(async (ep) => {
            const meta: LabeledData["meta"] = {};
            const res = await fetch(`${ep.url}?emails=${encodeURIComponent(emailList.join(','))}`, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed ${ep.key} for emails`);
            const json = await res.json();
            
            // Handle different API response formats
            const perEmailResults = emailList.map(email => {
              const emailData = json.records[email];
              // Check if the data is wrapped in { records: [], isSubmittedToday: boolean } format
              const records = emailData?.records ? emailData.records : (Array.isArray(emailData) ? emailData : []);
              return { email, records };
            });

            const merged: RecordsByEmail = {};
            perEmailResults.forEach(({ email, records }) => mergeEmailRecords(merged, email, records, meta, ep.key));

            ep.setter({ records: merged, labelMap: ep.labelMap, meta });
          })
        );
      } catch (e) {
        console.error("Admin dashboard fetch error:", e);
        toast.error(t("error.dataLoad"));
      } finally {
        setLoading(false);
      }
    };
    go();
  }, [emailList, endpoints, t]);

  // filter to selected month/year (same shape back)
  const filterChartAndTallyData = (data: LabeledData) => {
    if (!data || !data.records) return data;
    const filteredRecords = Object.keys(data.records).reduce<RecordsByEmail>((filtered, email) => {
      const emailData = data.records[email];
      const filteredDates = Object.keys(emailData).reduce<Record<string, any>>((acc, date) => {
        const [y, m] = date.split("-").map(Number);
        if (y === selectedYear && m === selectedMonth + 1) acc[date] = emailData[date];
        return acc;
      }, {});
      if (Object.keys(filteredDates).length > 0) filtered[email] = filteredDates;
      return filtered;
    }, {});
    return { ...data, records: filteredRecords };
  };

  // derived
  const filteredAmoliData = useMemo(
    () => filterChartAndTallyData(amoliData),
    [amoliData, selectedMonth, selectedYear]
  );

  // ---------- click aggregator ----------
  const openAggregatedModal = (type: "assistants" | "madrasa" | "school", dateKey: string) => {
    let items: any[] = [];
    if (type === "assistants") {
      const m = dayeData.meta?.assistants || {};
      emailList.forEach((email) => {
        const arr = m[email]?.[dateKey] || [];
        items = items.concat(arr);
      });
      setModalTitle(t("modalTitle.assistants"));
    } else if (type === "madrasa") {
      const m = soforData.meta?.madrasa || {};
      emailList.forEach((email) => {
        const arr = m[email]?.[dateKey] || [];
        items = items.concat(arr);
      });
      setModalTitle(t("modalTitle.madrasa"));
    } else if (type === "school") {
      const m = soforData.meta?.school || {};
      emailList.forEach((email) => {
        const arr = m[email]?.[dateKey] || [];
        items = items.concat(arr);
      });
      setModalTitle(t("modalTitle.school"));
    }
    setModalType(type);
    setModalDateKey(dateKey);
    setModalItems(items);
    if (items.length) setModalOpen(true);
  };

  // handlers passed to AdminTable
  const handleDayeCellClick = ({ dateKey, rowKey }: { dateKey: string; rowKey: string }) => {
    if (rowKey === "assistantsList" || rowKey === "assistants") {
      openAggregatedModal("assistants", dateKey);
    }
  };
  const handleSoforCellClick = ({ dateKey, rowKey }: { dateKey: string; rowKey: string }) => {
    if (rowKey === "madrasaVisitList") openAggregatedModal("madrasa", dateKey);
    if (rowKey === "schoolCollegeVisitList") openAggregatedModal("school", dateKey);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] overflow-y-auto">
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl space-y-4 lg:space-y-0 lg:space-x-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center lg:text-left">
          {t("welcome")},{" "}
          <span className="text-emerald-600">{session?.user?.name}</span>
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <button
            onClick={() => router.push("admin/comparison")}
            className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 focus:ring focus:ring-emerald-300 w-full sm:w-auto"
          >
            {t("dashboard.comparison")}
          </button>

          <div className="flex gap-3 items-center w-full md:w-auto">
            <input
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              placeholder={t("searchMonth")}
              className="w-full lg:w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500"
            />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full lg:w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {months
                .filter((m) => m.toLowerCase().includes(searchMonth.toLowerCase()))
                .map((m, index) => (
                  <option key={index} value={index}>{m}</option>
                ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full lg:w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grow grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-4 pt-2">
          <AmoliChartAdmin data={filteredAmoliData.records} emailList={emailList} />
          <TallyAdmin userData={filterChartAndTallyData(moktobData)} emails={emailList} title={t("moktob.title")} />
          <TallyAdmin userData={filterChartAndTallyData(dawatiData)} emails={emailList} title={t("dawati.title")} />
          <TallyAdmin userData={filterChartAndTallyData(dawatiMojlishData)} emails={emailList} title={t("dawatiMojlish.title")} />
          <TallyAdmin userData={filterChartAndTallyData(jamatData)} emails={emailList} title={t("jamat.title")} />
          <TallyAdmin userData={filterChartAndTallyData(dineFeraData)} emails={emailList} title={t("dineFera.title")} />
          <TallyAdmin userData={filterChartAndTallyData(talimData)} emails={emailList} title={t("talim.title")} />
          <TallyAdmin userData={filterChartAndTallyData(soforData)} emails={emailList} title={t("sofor.title")} />
          <TallyAdmin userData={filterChartAndTallyData(dayeData)} emails={emailList} title={t("daye.title")} />
        </div>
      </div>

      <div className="border border-[#155E75] lg:p-6 mt-10 rounded-xl ">
        <Tabs defaultValue="moktob" className="w-full p-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="Amolimusahaba">{t("dashboard.amoliMuhasaba")}</TabsTrigger>
            <TabsTrigger value="moktob">{t("dashboard.moktobSubject")}</TabsTrigger>
            <TabsTrigger value="talim">{t("dashboard.talimSubject")}</TabsTrigger>
            <TabsTrigger value="daye">{t("dashboard.dayiSubject")}</TabsTrigger>
            <TabsTrigger value="dawati">{t("dashboard.dawatiSubject")}</TabsTrigger>
            <TabsTrigger value="dawatimojlish">{t("dashboard.dawatiMojlish")}</TabsTrigger>
            <TabsTrigger value="jamat">{t("dashboard.jamatSubject")}</TabsTrigger>
            <TabsTrigger value="dinefera">{t("dashboard.dineFera")}</TabsTrigger>
            <TabsTrigger value="sofor">{t("dashboard.soforSubject")}</TabsTrigger>
          </TabsList>

          <TabsContent value="moktob">
            <AdminTable userData={moktobData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear} users={users} />
          </TabsContent>

          <TabsContent value="talim">
            <AdminTable userData={talimData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear} users={users} />
          </TabsContent>

          <TabsContent value="daye">
            <AdminTable
              userData={dayeData}
              emailList={emailList}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              clickableFields={["assistantsList", "assistants"]}
              onCellClick={handleDayeCellClick}
              users={users}
            />
          </TabsContent>

          <TabsContent value="dawati">
            <AdminTable userData={dawatiData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear} users={users} />
          </TabsContent>

          <TabsContent value="dawatimojlish">
            <AdminTable userData={dawatiMojlishData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear} users={users} />
          </TabsContent>

          <TabsContent value="jamat">
            <AdminTable userData={jamatData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear} users={users} />
          </TabsContent>

          <TabsContent value="dinefera">
            <AdminTable userData={dineFeraData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear} users={users} />
          </TabsContent>

          <TabsContent value="sofor">
            <AdminTable
              userData={soforData}
              emailList={emailList}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              clickableFields={["madrasaVisitList", "schoolCollegeVisitList"]}
              onCellClick={handleSoforCellClick}
              users={users}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Shared Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                {modalTitle} — {modalDateKey}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-6 space-y-4">
              {modalType === "assistants" ? (
                modalItems
                  .filter((item) => item && typeof item === 'object' && item.name)
                  .map((a: any, idx: number) => (
                    <div key={a.id || idx} className="rounded-xl border p-4 shadow-sm hover:shadow">
                      <div className="flex items-start justify-between">
                        <div className="text-base font-semibold">
                          {idx + 1}. {String(a.name || "")}
                        </div>
                        {a.email ? (
                          <a className="text-sm underline hover:text-blue-700" href={`mailto:${a.email}`}>
                            {String(a.email)}
                          </a>
                        ) : null}
                      </div>
                      <div className="mt-2 grid gap-1 text-sm text-gray-700">
                        <div><span className="font-medium">ফোন:</span> {String(a.phone || "")}</div>
                        <div><span className="font-medium">ঠিকানা:</span> {String(a.address || "")}</div>
                        <div><span className="font-medium">বিভাগ:</span> {String(a.division || "")}</div>
                        <div><span className="font-medium">জেলা:</span> {String(a.district || "")}</div>
                        <div><span className="font-medium">উপজেলা:</span> {String(a.upazila || "")}</div>
                        <div><span className="font-medium">ইউনিয়ন:</span> {String(a.union || "")}</div>
                        {a.description ? (
                          <div className="mt-1"><span className="font-medium">বিবরণ:</span> {String(a.description)}</div>
                        ) : null}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="space-y-2">
                  {modalItems.length === 0 ? (
                    <div className="text-gray-600">কোনো তথ্য পাওয়া যায়নি</div>
                  ) : (
                    modalItems
                      .filter((item) => typeof item === 'string')
                      .map((text: string, idx: number) => (
                        <div key={idx} className="rounded border p-3">{idx + 1}. {text}</div>
                      ))
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
