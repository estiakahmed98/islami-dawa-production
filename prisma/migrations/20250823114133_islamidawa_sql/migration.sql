ALTER TABLE "sessions" ADD COLUMN "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "activeDeviceId" TEXT,
ADD COLUMN "activeSessionId" TEXT,
ADD COLUMN "banExpires" INTEGER,
ADD COLUMN "banReason" TEXT,
ADD COLUMN "banned" BOOLEAN,
ADD COLUMN "note" TEXT,
ADD COLUMN "parent" TEXT,
ALTER COLUMN "role"
DROP NOT NULL,
ALTER COLUMN "division"
DROP NOT NULL,
ALTER COLUMN "district"
DROP NOT NULL,
ALTER COLUMN "area"
DROP NOT NULL,
ALTER COLUMN "upazila"
DROP NOT NULL,
ALTER COLUMN "union"
DROP NOT NULL,
ALTER COLUMN "phone"
DROP NOT NULL;

-- DropTable
DROP TABLE "AmoliMuhasabaData";

-- DropTable
DROP TABLE "DawatiBisoy";

-- DropTable
DROP TABLE "DawatiMojlish";

-- DropTable
DROP TABLE "DayeBisoy";

-- DropTable
DROP TABLE "DinerDikeFireche";

-- DropTable
DROP TABLE "JamatBisoy";

-- DropTable
DROP TABLE "MasterTableDawa";

-- DropTable
DROP TABLE "MoktobBisoy";

-- DropTable
DROP TABLE "SoforBisoy";

-- DropTable
DROP TABLE "TalimBisoy";

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "creator" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmoliMuhasaba" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tahajjud" INTEGER,
    "surah" TEXT,
    "ayat" TEXT,
    "zikir" TEXT,
    "ishraq" TEXT,
    "jamat" INTEGER,
    "sirat" TEXT,
    "Dua" TEXT,
    "ilm" TEXT,
    "tasbih" TEXT,
    "dayeeAmol" TEXT,
    "amoliSura" TEXT,
    "ayamroja" TEXT,
    "hijbulBahar" TEXT,
    "percentage" TEXT,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AmoliMuhasaba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DawatiBisoyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nonMuslimDawat" INTEGER NOT NULL DEFAULT 0,
    "murtadDawat" INTEGER NOT NULL DEFAULT 0,
    "alemderSatheyMojlish" INTEGER NOT NULL DEFAULT 0,
    "publicSatheyMojlish" INTEGER NOT NULL DEFAULT 0,
    "nonMuslimSaptahikGasht" INTEGER NOT NULL DEFAULT 0,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DawatiBisoyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DawatiMojlishRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dawatterGuruttoMojlish" INTEGER NOT NULL DEFAULT 0,
    "mojlisheOnshogrohon" INTEGER NOT NULL DEFAULT 0,
    "prosikkhonKormoshalaAyojon" INTEGER NOT NULL DEFAULT 0,
    "prosikkhonOnshogrohon" INTEGER NOT NULL DEFAULT 0,
    "jummahAlochona" INTEGER NOT NULL DEFAULT 0,
    "dhormoSova" INTEGER NOT NULL DEFAULT 0,
    "mashwaraPoint" INTEGER NOT NULL DEFAULT 0,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DawatiMojlishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamatBisoyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "jamatBerHoise" INTEGER NOT NULL DEFAULT 0,
    "jamatSathi" INTEGER NOT NULL DEFAULT 0,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JamatBisoyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DineFeraRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nonMuslimMuslimHoise" INTEGER NOT NULL DEFAULT 0,
    "murtadIslamFireche" INTEGER NOT NULL DEFAULT 0,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DineFeraRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable

CREATE TABLE "SoforBisoyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "madrasaVisit" INTEGER NOT NULL DEFAULT 0,
    "madrasaVisitList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "moktobVisit" INTEGER NOT NULL DEFAULT 0,
    "schoolCollegeVisit" INTEGER NOT NULL DEFAULT 0,
    "schoolCollegeVisitList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoforBisoyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalimBisoyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mohilaTalim" INTEGER NOT NULL DEFAULT 0,
    "mohilaOnshogrohon" INTEGER NOT NULL DEFAULT 0,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TalimBisoyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayeeBishoyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sohojogiDayeToiri" INTEGER NOT NULL DEFAULT 0,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DayeeBishoyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantDaee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT,
    "description" TEXT,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "union" TEXT NOT NULL,
    "dayeeBishoyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AssistantDaee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoktobBisoyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notunMoktobChalu" INTEGER NOT NULL DEFAULT 0,
    "totalMoktob" INTEGER NOT NULL DEFAULT 0,
    "totalStudent" INTEGER NOT NULL DEFAULT 0,
    "obhibhabokConference" INTEGER NOT NULL DEFAULT 0,
    "moktoThekeMadrasaAdmission" INTEGER NOT NULL DEFAULT 0,
    "notunBoyoskoShikkha" INTEGER NOT NULL DEFAULT 0,
    "totalBoyoskoShikkha" INTEGER NOT NULL DEFAULT 0,
    "boyoskoShikkhaOnshogrohon" INTEGER NOT NULL DEFAULT 0,
    "newMuslimeDinerFikir" INTEGER NOT NULL DEFAULT 0,
    "editorContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MoktobBisoyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "division" TEXT,
    "district" TEXT,
    "upazila" TEXT,
    "union" TEXT,
    "creatorRole" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "union" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "editedOnce" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EditRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_googleEventId_key" ON "CalendarEvent" ("googleEventId");

-- CreateIndex
CREATE INDEX "AmoliMuhasaba_userId_idx" ON "AmoliMuhasaba" ("userId");

-- CreateIndex
CREATE INDEX "AmoliMuhasaba_date_idx" ON "AmoliMuhasaba" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "AmoliMuhasaba_userId_date_key" ON "AmoliMuhasaba" ("userId", "date");

-- CreateIndex
CREATE INDEX "DawatiBisoyRecord_userId_idx" ON "DawatiBisoyRecord" ("userId");

-- CreateIndex
CREATE INDEX "DawatiBisoyRecord_date_idx" ON "DawatiBisoyRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "DawatiBisoyRecord_userId_date_key" ON "DawatiBisoyRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "DawatiMojlishRecord_userId_idx" ON "DawatiMojlishRecord" ("userId");

-- CreateIndex
CREATE INDEX "DawatiMojlishRecord_date_idx" ON "DawatiMojlishRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "DawatiMojlishRecord_userId_date_key" ON "DawatiMojlishRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "JamatBisoyRecord_userId_idx" ON "JamatBisoyRecord" ("userId");

-- CreateIndex
CREATE INDEX "JamatBisoyRecord_date_idx" ON "JamatBisoyRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "JamatBisoyRecord_userId_date_key" ON "JamatBisoyRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "DineFeraRecord_userId_idx" ON "DineFeraRecord" ("userId");

-- CreateIndex
CREATE INDEX "DineFeraRecord_date_idx" ON "DineFeraRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "DineFeraRecord_userId_date_key" ON "DineFeraRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "SoforBisoyRecord_userId_idx" ON "SoforBisoyRecord" ("userId");

-- CreateIndex
CREATE INDEX "SoforBisoyRecord_date_idx" ON "SoforBisoyRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "SoforBisoyRecord_userId_date_key" ON "SoforBisoyRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "TalimBisoyRecord_userId_idx" ON "TalimBisoyRecord" ("userId");

-- CreateIndex
CREATE INDEX "TalimBisoyRecord_date_idx" ON "TalimBisoyRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "TalimBisoyRecord_userId_date_key" ON "TalimBisoyRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "DayeeBishoyRecord_userId_idx" ON "DayeeBishoyRecord" ("userId");

-- CreateIndex
CREATE INDEX "DayeeBishoyRecord_date_idx" ON "DayeeBishoyRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "DayeeBishoyRecord_userId_date_key" ON "DayeeBishoyRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "AssistantDaee_dayeeBishoyId_idx" ON "AssistantDaee" ("dayeeBishoyId");

-- CreateIndex
CREATE INDEX "MoktobBisoyRecord_userId_idx" ON "MoktobBisoyRecord" ("userId");

-- CreateIndex
CREATE INDEX "MoktobBisoyRecord_date_idx" ON "MoktobBisoyRecord" ("date");

-- CreateIndex
CREATE UNIQUE INDEX "MoktobBisoyRecord_userId_date_key" ON "MoktobBisoyRecord" ("userId", "date");

-- CreateIndex
CREATE INDEX "LeaveRequest_userId_idx" ON "LeaveRequest" ("userId");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest" ("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_requestDate_idx" ON "LeaveRequest" ("requestDate");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task" ("userId");

-- CreateIndex
CREATE INDEX "Task_date_idx" ON "Task" ("date");

-- CreateIndex
CREATE INDEX "Task_visibility_idx" ON "Task" ("visibility");

-- CreateIndex
CREATE INDEX "Task_division_district_upazila_union_idx" ON "Task" (
    "division",
    "district",
    "upazila",
    "union"
);

-- CreateIndex
CREATE INDEX "EditRequest_userId_idx" ON "EditRequest" ("userId");

-- CreateIndex
CREATE INDEX "EditRequest_email_idx" ON "EditRequest" ("email");

-- CreateIndex
CREATE INDEX "EditRequest_status_idx" ON "EditRequest" ("status");

-- CreateIndex
CREATE INDEX "EditRequest_date_idx" ON "EditRequest" ("date");

-- AddForeignKey
ALTER TABLE "CalendarEvent"
ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmoliMuhasaba"
ADD CONSTRAINT "AmoliMuhasaba_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DawatiBisoyRecord"
ADD CONSTRAINT "DawatiBisoyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DawatiMojlishRecord"
ADD CONSTRAINT "DawatiMojlishRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamatBisoyRecord"
ADD CONSTRAINT "JamatBisoyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DineFeraRecord"
ADD CONSTRAINT "DineFeraRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoforBisoyRecord"
ADD CONSTRAINT "SoforBisoyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalimBisoyRecord"
ADD CONSTRAINT "TalimBisoyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayeeBishoyRecord"
ADD CONSTRAINT "DayeeBishoyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantDaee"
ADD CONSTRAINT "AssistantDaee_dayeeBishoyId_fkey" FOREIGN KEY ("dayeeBishoyId") REFERENCES "DayeeBishoyRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoktobBisoyRecord"
ADD CONSTRAINT "MoktobBisoyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest"
ADD CONSTRAINT "LeaveRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task"
ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditRequest"
ADD CONSTRAINT "EditRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;