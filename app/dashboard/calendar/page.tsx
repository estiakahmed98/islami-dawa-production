import GoogleCalendar from "@/components/CalendarComponent";

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="font-semibold text-2xl from-cyan-500 flex justify-center mb-4">
        কর্সূমচী দেখুন
      </h2>
      <GoogleCalendar />
    </div>
  );
}
