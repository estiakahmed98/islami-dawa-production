import GoogleCalendar from "@/components/CalendarComponent";
import { useTranslations } from "next-intl";

export default function CalendarPage() {
  const t = useTranslations("calendar.page");
  return (
    <div>
      <h2 className="font-semibold text-2xl flex justify-center mb-4">
        {t("title")}
      </h2>
      <GoogleCalendar />
    </div>
  );
}