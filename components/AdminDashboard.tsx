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

// ----------------- Types -----------------
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  markaz?: string;
}
type RecordsByEmail = Record<string, Record<string, any>>;
type LabeledData = {
  records: RecordsByEmail;
  labelMap: Record<string, string>;
  // NEW: store raw arrays for modals
  meta?: {
    assistants?: Record<string, Record<string, any[]>>;          // [email][date] -> Assistant[]
    madrasa?: Record<string, Record<string, string[]>>;           // [email][date] -> string[]
    school?: Record<string, Record<string, string[]>>;            // [email][date] -> string[]
  };
};

// ----------------- Helpers -----------------
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
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

const getParentEmail = (user: User, users: User[]): string | null => {
  let parentUser: User | undefined;
  switch (user.role) {
    case "divisionadmin":
      parentUser = users.find((u) => u.role === "centraladmin");
      break;
    case "markazadmin":
      parentUser = users.find((u) => u.role === "divisionadmin" && u.division === user.division)
        || users.find((u) => u.role === "centraladmin");
      break;
    case "daye":
      parentUser = users.find((u) => u.role === "markazadmin" && u.markaz === user.markaz)
        || users.find((u) => u.role === "centraladmin");
      break;
    default:
      return null;
  }
  return parentUser ? parentUser.email : null;
};

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
  const [modalType, setModalType] = useState<"assistants"|"madrasa"|"school" | null>(null);
  const [modalItems, setModalItems] = useState<any[]>([]);

  // ---------- fetch users ----------
  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch users");
        const usersData: User[] = await res.json();
        setUsers(usersData);
      } catch (e) {
        console.error(e);
        toast.error("Users লোড করতে সমস্যা হয়েছে");
      }
    };
    go();
  }, []);

  // ---------- compute emailList ----------
  useEffect(() => {
    if (!userEmail || !users.length) return;

    const loggedIn = users.find((u) => u.email === userEmail);
    if (!loggedIn) return;

    let collected: string[] = [loggedIn.email];

    const findChildEmails = (parentEmail: string) => {
      users.forEach((u) => {
        if (getParentEmail(u, users) === parentEmail) {
          collected.push(u.email);
          findChildEmails(u.email);
        }
      });
    };
    findChildEmails(loggedIn.email);

    const includeDayeByScope = (scope: Partial<User>) => {
      const dayeEmails = users
        .filter((u) => u.role === "daye" && Object.entries(scope).every(([k, v]) => (u as any)[k] === v))
        .map((u) => u.email);
      collected = [...new Set([...collected, ...dayeEmails])];
    };

    if (loggedIn.role === "unionadmin") includeDayeByScope({ union: loggedIn.union });
    else if (loggedIn.role === "upozilaadmin") includeDayeByScope({ upazila: loggedIn.upazila });
    else if (loggedIn.role === "districtadmin") includeDayeByScope({ district: loggedIn.district });
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
            if (getParentEmail(u, users) === parentEmail) {
              selEmails.push(u.email);
              findChild(u.email);
            }
          });
        };
        findChild(chosen.email);

        if (chosen.role === "unionadmin") selEmails = [...new Set([...selEmails, ...users.filter((u) => u.role==="daye" && u.union===chosen.union).map((u)=>u.email)])];
        else if (chosen.role === "upozilaadmin") selEmails = [...new Set([...selEmails, ...users.filter((u) => u.role==="daye" && u.upazila===chosen.upazila).map((u)=>u.email)])];
        else if (chosen.role === "districtadmin") selEmails = [...new Set([...selEmails, ...users.filter((u) => u.role==="daye" && u.district===chosen.district).map((u)=>u.email)])];
        else if (chosen.role === "divisionadmin") selEmails = [...new Set([...selEmails, ...users.filter((u) => u.role==="daye" && u.division===chosen.division).map((u)=>u.email)])];
        else if (chosen.role === "centraladmin") selEmails = [...new Set([...selEmails, ...users.filter((u)=>u.role==="daye").map((u)=>u.email)])];

        setEmailList(selEmails);
      } else {
        setEmailList([selectedUser]);
      }
    } else {
      setEmailList(collected);
    }
  }, [selectedUser, users, userEmail]);

  // ---------- endpoints ----------
  const endpoints = useMemo(
    () => [
      {
        key: "amoli",
        url: "/api/amoli",
        setter: setAmoliData,
        labelMap: {
          tahajjud: "তাহাজ্জুদ", surah: "সুরা", ayat: "আয়াত", zikir: "যিকির",
          ishraq: "ইশরাক/আওয়াবীন/চাশ্ত", jamat: "জামাত", sirat: "সিরাত", Dua: "দোয়া",
          ilm: "ইলম", tasbih: "তাসবীহ", dayeeAmol: "দায়ী আমল", amoliSura: "আমলি সুরা",
          ayamroja: "আইয়ামে রোজা", hijbulBahar: "হিজবুল বাহার",
        },
      },
      {
        key: "moktob",
        url: "/api/moktob",
        setter: setMoktobData,
        labelMap: {
          notunMoktobChalu: "নতুন মক্তব চালু হয়েছে", totalMoktob: "মোট মক্তব",
          totalStudent: "মোট ছাত্র-ছাত্রী", obhibhabokConference: "অভিভাবক কনফারেন্স হয়েছে",
          moktoThekeMadrasaAdmission: "মক্তব থেকে মাদ্রাসায় ভর্তি হয়েছে",
          notunBoyoskoShikkha: "নতুন বয়স্ক শিক্ষা", totalBoyoskoShikkha: "মোট বয়স্ক শিক্ষা",
          boyoskoShikkhaOnshogrohon: "বয়স্ক শিক্ষায় অংশগ্রহণ", newMuslimeDinerFikir: "নতুন মুসলিমদের ফিকির",
        },
      },
      {
        key: "talim",
        url: "/api/talim",
        setter: setTalimData,
        labelMap: { mohilaTalim: "মহিলাদের তালিম হয়েছে", mohilaOnshogrohon: "মহিলাদের অংশগ্রহণ" },
      },
      {
        key: "daye",
        url: "/api/dayi",
        setter: setDayeData,
        labelMap: { sohojogiDayeToiri: "সহযোগী দায়ী তৈরি হয়েছে", assistantsList: "সহযোগী দায়ীর তালিকা" },
      },
      {
        key: "dawati",
        url: "/api/dawati",
        setter: setDawatiData,
        labelMap: {
          nonMuslimDawat: "অমুসলিমদের দাওয়াত", murtadDawat: "মুরতাদদের দাওয়াত",
          alemderSatheyMojlish: "আলেমদের সাথে মজলিশ", publicSatheyMojlish: "পাবলিকের সাথে মজলিশ",
          nonMuslimSaptahikGasht: "অমুসলিমদের সাথে সাপ্তাহিক গাশ্ত",
        },
      },
      {
        key: "dawatimojlish",
        url: "/api/dawatimojlish",
        setter: setDawatiMojlishData,
        labelMap: {
          dawatterGuruttoMojlish: "দাওয়াতের গুরুত্ব মজলিশ", mojlisheOnshogrohon: "মজলিশে অংশগ্রহণ",
          prosikkhonKormoshalaAyojon: "প্রশিক্ষণ কর্মশালা আয়োজন", prosikkhonOnshogrohon: "প্রশিক্ষণে অংশগ্রহণ",
          jummahAlochona: "জুম্মার আলোচনা", dhormoSova: "ধর্ম সংসভা", mashwaraPoint: "মাশওয়ারা পয়েন্ট",
        },
      },
      {
        key: "jamat",
        url: "/api/jamat",
        setter: setJamatData,
        labelMap: { jamatBerHoise: "জামাত বের হয়েছে", jamatSathi: "জামাত সাথী" },
      },
      {
        key: "dinefera",
        url: "/api/dinefera",
        setter: setDineFeraData,
        labelMap: { nonMuslimMuslimHoise: "অমুসলিম মুসলিম হয়েছে", murtadIslamFireche: "মুরতাদ ইসলামে ফিরেছে" },
      },
      {
        key: "sofor",
        url: "/api/soforbisoy",
        setter: setSoforData,
        labelMap: {
          moktobVisit: "চলমান মক্তব পরিদর্শন হয়েছে",
          madrasaVisit: "মাদ্রাসা সফর হয়েছে",
          schoolCollegeVisit: "স্কুল/কলেজ সফর হয়েছে",
          madrasaVisitList: "মাদ্রাসার তালিকা",
          schoolCollegeVisitList: "স্কুল/কলেজ তালিকা",
        },
      },
    ],
    []
  );

  // merge helper + collect meta
  const mergeEmailRecords = (
    acc: RecordsByEmail,
    email: string,
    rawRecords: any[],
    meta: LabeledData["meta"],
    key: string
  ) => {
    if (!acc[email]) acc[email] = {};
    rawRecords.forEach((rec) => {
      const dateKey = dhakaYMD(new Date(rec.date));
      const copy = { ...rec };

      // keep raw arrays in meta for modal use
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

      // prettify for table cells (HTML strings)
      if (copy.madrasaVisitList) copy.madrasaVisitList = toNumberedHTML(copy.madrasaVisitList);
      if (copy.schoolCollegeVisitList) copy.schoolCollegeVisitList = toNumberedHTML(copy.schoolCollegeVisitList);
      if (copy.assistants) {
        copy.assistants = toNumberedHTML((copy.assistants as any[]).map((a) => `${a.name} (${a.phone})`));
        copy.assistantsList = copy.assistants; // expose as list row if needed
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
            // meta holder for this endpoint
            const meta: LabeledData["meta"] = {};

            const perEmailResults = await Promise.all(
              emailList.map(async (email) => {
                try {
                  const res = await fetch(`${ep.url}?email=${encodeURIComponent(email)}`, { cache: "no-store" });
                  if (!res.ok) throw new Error(`Failed ${ep.key} for ${email}`);
                  const json = await res.json();
                  const records = Array.isArray(json.records) ? json.records : [];
                  return { email, records };
                } catch (e) {
                  console.error(`Error fetching ${ep.key} for ${email}:`, e);
                  toast.error(`ডেটা লোড সমস্যা: ${ep.key} (${email})`);
                  return { email, records: [] as any[] };
                }
              })
            );

            const merged: RecordsByEmail = {};
            perEmailResults.forEach(({ email, records }) =>
              mergeEmailRecords(merged, email, records, meta, ep.key)
            );

            ep.setter({ records: merged, labelMap: ep.labelMap, meta });
          })
        );
      } catch (e) {
        console.error("Admin dashboard fetch error:", e);
        toast.error("ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };
    go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailList]);

  // filter to selected month/year (same shape back)
  const filterChartAndTallyData = (data: LabeledData) => {
    if (!data || !data.records) return data;
    const filteredRecords = Object.keys(data.records).reduce<RecordsByEmail>(
      (filtered, email) => {
        const emailData = data.records[email];
        const filteredDates = Object.keys(emailData).reduce<Record<string, any>>(
          (acc, date) => {
            const [y, m] = date.split("-").map(Number);
            if (y === selectedYear && m === selectedMonth + 1) acc[date] = emailData[date];
            return acc;
          },
          {}
        );
        if (Object.keys(filteredDates).length > 0) filtered[email] = filteredDates;
        return filtered;
      },
      {}
    );
    return { ...data, records: filteredRecords };
  };

  // derived
  const filteredAmoliData = useMemo(
    () => filterChartAndTallyData(amoliData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amoliData, selectedMonth, selectedYear]
  );

  // ---------- click aggregator ----------
  const openAggregatedModal = (type: "assistants"|"madrasa"|"school", dateKey: string) => {
    let items: any[] = [];
    if (type === "assistants") {
      const m = dayeData.meta?.assistants || {};
      emailList.forEach((email) => {
        const arr = m[email]?.[dateKey] || [];
        items = items.concat(arr);
      });
      setModalTitle("সহযোগী দায়ীর তথ্য");
    } else if (type === "madrasa") {
      const m = soforData.meta?.madrasa || {};
      emailList.forEach((email) => {
        const arr = m[email]?.[dateKey] || [];
        items = items.concat(arr);
      });
      setModalTitle("মাদ্রাসার তালিকা");
    } else if (type === "school") {
      const m = soforData.meta?.school || {};
      emailList.forEach((email) => {
        const arr = m[email]?.[dateKey] || [];
        items = items.concat(arr);
      });
      setModalTitle("স্কুল/কলেজ তালিকা");
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
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl space-y-4 lg:space-y-0 lg:space-x-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center lg:text-left">
          স্বাগতম, <span className="text-emerald-600">{session?.user?.name}</span>
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <button
            onClick={() => router.push("admin/comparison")}
            className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 focus:ring focus:ring-emerald-300 w-full sm:w-auto"
          >
            📊 তুলনা দেখুন
          </button>

          <div className="flex gap-3 items-center w-full md:w-auto">
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
          <TallyAdmin userData={filterChartAndTallyData(moktobData)} emails={emailList} title="মক্তব বিষয়" />
          <TallyAdmin userData={filterChartAndTallyData(dawatiData)} emails={emailList} title="দাওয়াতি বিষয়" />
          <TallyAdmin userData={filterChartAndTallyData(dawatiMojlishData)} emails={emailList} title="দাওয়াতি মজলিশ" />
          <TallyAdmin userData={filterChartAndTallyData(jamatData)} emails={emailList} title="জামাত বিষয়" />
          <TallyAdmin userData={filterChartAndTallyData(dineFeraData)} emails={emailList} title="দ্বীনে ফিরে এসেছে" />
          <TallyAdmin userData={filterChartAndTallyData(talimData)} emails={emailList} title="মহিলাদের তালিম বিষয়" />
          <TallyAdmin userData={filterChartAndTallyData(soforData)} emails={emailList} title="সফর বিষয়" />
          <TallyAdmin userData={filterChartAndTallyData(dayeData)} emails={emailList} title="সহযোগী দায়ী বিষয" />
        </div>
      </div>

      <div className="border border-[#155E75] lg:p-6 mt-10 rounded-xl overflow-y-auto">
        <Tabs defaultValue="moktob" className="w-full p-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="moktob">মক্তব বিষয়</TabsTrigger>
            <TabsTrigger value="talim">মহিলাদের তালিম</TabsTrigger>
            <TabsTrigger value="daye">সহযোগী দায়ী বিষয</TabsTrigger>
            <TabsTrigger value="dawati">দাওয়াতি বিষয়</TabsTrigger>
            <TabsTrigger value="dawatimojlish">দাওয়াতি মজলিশ</TabsTrigger>
            <TabsTrigger value="jamat">জামাত বিষয়</TabsTrigger>
            <TabsTrigger value="dinefera">দ্বীনে ফিরে এসেছে</TabsTrigger>
            <TabsTrigger value="sofor">সফর বিষয়</TabsTrigger>
          </TabsList>

          <TabsContent value="moktob">
            <AdminTable userData={moktobData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
          </TabsContent>

          <TabsContent value="talim">
            <AdminTable userData={talimData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
          </TabsContent>

          <TabsContent value="daye">
            <AdminTable
              userData={dayeData}
              emailList={emailList}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              clickableFields={["assistantsList","assistants"]}
              onCellClick={handleDayeCellClick}
            />
          </TabsContent>

          <TabsContent value="dawati">
            <AdminTable userData={dawatiData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
          </TabsContent>

          <TabsContent value="dawatimojlish">
            <AdminTable userData={dawatiMojlishData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
          </TabsContent>

          <TabsContent value="jamat">
            <AdminTable userData={jamatData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
          </TabsContent>

          <TabsContent value="dinefera">
            <AdminTable userData={dineFeraData} emailList={emailList} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
          </TabsContent>

          <TabsContent value="sofor">
            <AdminTable
              userData={soforData}
              emailList={emailList}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              clickableFields={["madrasaVisitList","schoolCollegeVisitList"]}
              onCellClick={handleSoforCellClick}
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
                modalItems.map((a: any, idx: number) => (
                  <div key={a.id || idx} className="rounded-xl border p-4 shadow-sm hover:shadow">
                    <div className="flex items-start justify-between">
                      <div className="text-base font-semibold">
                        {idx + 1}. {a.name || "-"}
                      </div>
                      {a.email ? (
                        <a className="text-sm underline hover:text-blue-700" href={`mailto:${a.email}`}>
                          {a.email}
                        </a>
                      ) : null}
                    </div>
                    <div className="mt-2 grid gap-1 text-sm text-gray-700">
                      <div><span className="font-medium">ফোন:</span> {a.phone || "-"}</div>
                      <div><span className="font-medium">ঠিকানা:</span> {a.address || "-"}</div>
                      <div><span className="font-medium">বিভাগ:</span> {a.division || "-"}</div>
                      <div><span className="font-medium">জেলা:</span> {a.district || "-"}</div>
                      <div><span className="font-medium">উপজেলা:</span> {a.upazila || "-"}</div>
                      <div><span className="font-medium">ইউনিয়ন:</span> {a.union || "-"}</div>
                      {a.description ? (
                        <div className="mt-1"><span className="font-medium">বিবরণ:</span> {a.description}</div>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {modalItems.length === 0 ? (
                    <div className="text-gray-600">কোনো তথ্য পাওয়া যায়নি</div>
                  ) : (
                    modalItems.map((text: string, idx: number) => (
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
