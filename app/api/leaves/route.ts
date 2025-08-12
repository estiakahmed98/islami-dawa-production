import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import * as Yup from "yup"

/** ---------- Validation (POST payload) ---------- */
const validationSchema = Yup.object({
  email: Yup.string().email().required("Email is required"),
  name: Yup.string().optional(),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^01[3-9]\d{8}$/, "Please enter a valid Bangladesh phone number"),
  leaveType: Yup.string().required("Leave Type is required"),
  from: Yup.date().required("Start Date is required"),
  to: Yup.date().required("End Date is required"),
  reason: Yup.string().required("Reason is required"),
})

function toDateOnlyISO(d: Date) {
  // normalize to UTC midnight (date-only)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    const status = searchParams.get("status") || undefined
    const fromDateStr = searchParams.get("fromDate")
    const toDateStr = searchParams.get("toDate")

    const where: any = {}

    if (email) {
      const user = await prisma.users.findUnique({
        where: { email },
        select: { id: true },
      })
      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 })
      }
      where.userId = user.id
    }

    if (status) where.status = status

    // Inclusive window overlap: [fromParam, toParam] ∩ [req.fromDate, req.toDate]
    if (fromDateStr || toDateStr) {
      const fromDate = fromDateStr ? toDateOnlyISO(new Date(fromDateStr)) : undefined
      const toDate = toDateStr ? toDateOnlyISO(new Date(toDateStr)) : undefined

      where.AND = [fromDate && { toDate: { gte: fromDate } }, toDate && { fromDate: { lte: toDate } }].filter(Boolean)
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { requestDate: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({ leaveRequests }, { status: 200 })
  } catch (err) {
    console.error("GET /api/leaves error:", err)
    return NextResponse.json({ error: "Failed to fetch leave requests." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await validationSchema.validate(body, { abortEarly: false })

    const { email, name, phone, leaveType, from, to, reason } = body

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    const fromDate = toDateOnlyISO(new Date(from))
    const toDate = toDateOnlyISO(new Date(to))

    // Calculate days automatically
    const timeDiff = Math.abs(toDate.getTime() - fromDate.getTime())
    const days = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1 // +1 for inclusive days

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: user.id,
        leaveType,
        fromDate,
        toDate,
        days, // Calculated automatically
        reason,
        status: "pending", // Default status for new requests
        approvedBy: null, // No one has approved yet
        phone,
        name,
      },
    })

    return NextResponse.json({ message: "Leave added successfully", leave }, { status: 201 })
  } catch (error: any) {
    if (error instanceof Yup.ValidationError) {
      const errors = error.inner.reduce((acc: Record<string, string>, e) => {
        if (e.path) acc[e.path] = e.message
        return acc
      }, {})
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }
    console.error("POST /api/leaves error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id,
      email, // Used for ownership verification
      name,
      phone,
      leaveType,
      from,
      to,
      days, // Can be manually overridden by admin or if it's part of update
      reason,
      approvedBy,
      status,
      rejectionReason, // New field for rejection reason
    } = body


    // right after destructuring and before building `data`
if (status === "rejected") {
  if (!rejectionReason || !rejectionReason.trim()) {
    return NextResponse.json(
      { error: "Rejection reason is required when rejecting a leave." },
      { status: 400 }
    );
  }
}


    if (!id || !email) {
      return NextResponse.json({ error: "Both id and email are required." }, { status: 400 })
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

    const existing = await prisma.leaveRequest.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Leave not found for this user." }, { status: 404 })
    }

    const data: any = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (leaveType !== undefined) data.leaveType = leaveType
    if (from !== undefined) data.fromDate = toDateOnlyISO(new Date(from))
    if (to !== undefined) data.toDate = toDateOnlyISO(new Date(to))
    // If days is provided in the update, use it, otherwise it remains as is in DB
    if (days !== undefined) data.days = days
    if (reason !== undefined) data.reason = reason
    if (approvedBy !== undefined) data.approvedBy = approvedBy
    if (status !== undefined) data.status = status

    // when building `data`
if (rejectionReason !== undefined) {
  // normalize to trimmed string or null
  const normalized = typeof rejectionReason === "string" ? rejectionReason.trim() : null;
  data.rejectionReason = normalized && status === "rejected" ? normalized : null;
}

// optionally: if status changes away from rejected and no explicit reason sent, clear it
if (status && status !== "rejected" && rejectionReason === undefined) {
  data.rejectionReason = null;
}

    await prisma.leaveRequest.update({ where: { id }, data })

    return NextResponse.json({ message: "Leave updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("PUT /api/leaves error:", error)
    return NextResponse.json({ error: "Failed to update leave." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, email } = await req.json()

    if (!id || !email) {
      return NextResponse.json({ error: "Both id and email are required." }, { status: 400 })
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

    const existing = await prisma.leaveRequest.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Leave not found for this user." }, { status: 404 })
    }

    await prisma.leaveRequest.delete({ where: { id } })

    return NextResponse.json({ message: "Leave deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("DELETE /api/leaves error:", error)
    return NextResponse.json({ error: "Failed to delete leave." }, { status: 500 })
  }
}
