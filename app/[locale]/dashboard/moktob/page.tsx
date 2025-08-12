"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabButton"
import { useSession } from "@/lib/auth-client"
import UniversalTableShow from "@/components/TableShow"
import MoktobBishoyForm from "@/components/MoktobBishoyForm"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

type RecordsByUserAndDate = {
  [email: string]: { [dateKey: string]: any }
}

/** Format a date to YYYY-MM-DD in Dhaka time (safe) */
function dhakaYMD(d: Date) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

const MoktobPage: React.FC = () => {
  const { data: session } = useSession()
  const userEmail = session?.user?.email ?? ""

  const [userData, setUserData] = React.useState<{ records: RecordsByUserAndDate; labelMap?: any }>({
    records: {},
  })
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear())

  const t = useTranslations("dashboard.UserDashboard.moktob");
  const common = useTranslations("common");

  const labelMap = React.useMemo(
    () => ({
      notunMoktobChalu: t("notunMoktobChalu"),
      totalMoktob: t("totalMoktob"),
      totalStudent: t("totalStudent"),
      obhibhabokConference: t("obhibhabokConference"),
      moktoThekeMadrasaAdmission: t("moktoThekeMadrasaAdmission"),
      notunBoyoskoShikkha: t("notunBoyoskoShikkha"),
      totalBoyoskoShikkha: t("totalBoyoskoShikkha"),
      boyoskoShikkhaOnshogrohon: t("boyoskoShikkhaOnshogrohon"),
      newMuslimeDinerFikir: t("newMuslimeDinerFikir"),
    }),
    []
  )

  React.useEffect(() => {
    if (!userEmail) {
      setUserData({ records: {}, labelMap })
      return
    }

    const ac = new AbortController()

    ;(async () => {
      try {
        const res = await fetch(`/api/moktob?email=${encodeURIComponent(userEmail)}`, {
          cache: "no-store",
          signal: ac.signal,
        })
        if (!res.ok) throw new Error("Failed to fetch records")

        const json = await res.json()
        const recordsArray: Array<any> = json.records || []

        const transformed: RecordsByUserAndDate = { [userEmail]: {} }

        recordsArray.forEach((record) => {
          // API now saves date === createdAt (same instant).
          // We still display by Dhaka calendar date.
          const dateKey = dhakaYMD(new Date(record.date))
          if (!dateKey) return

          transformed[userEmail][dateKey] = {
            notunMoktobChalu: record.notunMoktobChalu,
            totalMoktob: record.totalMoktob,
            totalStudent: record.totalStudent,
            obhibhabokConference: record.obhibhabokConference,
            moktoThekeMadrasaAdmission: record.moktoThekeMadrasaAdmission,
            notunBoyoskoShikkha: record.notunBoyoskoShikkha,
            totalBoyoskoShikkha: record.totalBoyoskoShikkha,
            boyoskoShikkhaOnshogrohon: record.boyoskoShikkhaOnshogrohon,
            newMuslimeDinerFikir: record.newMuslimeDinerFikir,
            editorContent: record.editorContent,
          }
        })

        setUserData({ records: transformed, labelMap })
      } catch (err: any) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Failed to fetch Moktob data:", err)
          toast.error(common("failedToFetchData"))
        }
      }
    })()

    return () => ac.abort()
  }, [userEmail, labelMap])

  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">{common("dataForm")}</TabsTrigger>
            <TabsTrigger value="report">{common("report")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dataForm">
          <div className="bg-gray-50 lg:rounded lg:shadow">
            <MoktobBishoyForm />
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className="bg-gray-50 rounded shadow">
            <UniversalTableShow
              userData={userData}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MoktobPage
