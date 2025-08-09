"use client"

import { useState, useCallback } from "react"
import { LeaveRequestForm } from "@/components/dashboard/leaves/leave-request-form"
import { UserLeaveTable } from "@/components/dashboard/leaves/user-leave-table"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"

export default function LeavesPage() {
  const { data: session, status } = useSession()
  const userEmail = session?.user?.email
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refetchTrigger, setRefetchTrigger] = useState(0) // State to trigger table refetch

  const refetchLeaveRequests = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  if (status === "loading") {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200">Leave Management</h1>
        <p className="text-lg text-muted-foreground">Loading user session...</p>
      </main>
    )
  }

  if (!userEmail) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200">Leave Management</h1>
        <p className="text-lg text-muted-foreground">Please log in to manage your leave requests.</p>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center p-4 md:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-6 drop-shadow-md">
        Your Leave Dashboard
      </h1>

      <div className="w-full flex justify-end mb-4">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-700 hover:bg-purple-800 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              <PlusIcon className="mr-2 h-5 w-5" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-lg shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-sky-600 to-cyan-700 text-white p-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold">Apply for Leave</DialogTitle>
              <DialogDescription className="text-purple-100">
                Fill out the form below to submit your leave request.
              </DialogDescription>
            </DialogHeader>
            <LeaveRequestForm
              userEmail={userEmail}
              onSubmissionSuccess={refetchLeaveRequests}
              onClose={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <UserLeaveTable userEmail={userEmail} refetch={refetchTrigger} />
    </main>
  )
}
