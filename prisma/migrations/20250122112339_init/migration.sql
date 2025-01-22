-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "union" TEXT NOT NULL,
    "markaz" TEXT,
    "phone" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterTableDawa" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "tunion" TEXT NOT NULL,
    "markaz" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tahajjud" TEXT,
    "ayat" TEXT,
    "zikir" TEXT,
    "ishraq" TEXT,
    "jamat" TEXT,
    "sirat" TEXT,
    "Dua" TEXT,
    "ilm" TEXT,
    "tasbih" TEXT,
    "dayeeAmol" TEXT,
    "amoliSura" TEXT,
    "ayamroja" TEXT,
    "hijbulBahar" TEXT,
    "nonMuslimDawat" INTEGER,
    "murtadDawat" INTEGER,
    "alemderSatheyMojlish" INTEGER,
    "publicSatheyMojlish" INTEGER,
    "nonMuslimSaptahikGasht" INTEGER,
    "dawatterGuruttoMojlish" INTEGER,
    "mojlisheOnshogrohon" INTEGER,
    "prosikkhonKormoshalaAyojon" INTEGER,
    "prosikkhonOnshogrohon" INTEGER,
    "jummahAlochona" INTEGER,
    "dhormoSova" INTEGER,
    "mashwaraPoint" INTEGER,
    "jamatBerHoise" INTEGER,
    "jamatSathi" INTEGER,
    "madrasaVisit" INTEGER,
    "moktobVisit" INTEGER,
    "schoolCollegeVisit" INTEGER,
    "sohojogiDayeToiri" INTEGER,
    "nonMuslimMuslimHoise" INTEGER,
    "murtadIslamFireche" INTEGER,
    "notunMoktobChalu" INTEGER,
    "totalMoktob" INTEGER,
    "totalStudent" INTEGER,
    "obhibhabokConference" INTEGER,
    "moktoThekeMadrasaAdmission" INTEGER,
    "notunBoyoskoShikkha" INTEGER,
    "totalBoyoskoShikkha" INTEGER,
    "boyoskoShikkhaOnshogrohon" INTEGER,
    "newMuslimeDinerFikir" INTEGER,
    "mohilaTalim" INTEGER,
    "mohilaOnshogrohon" INTEGER,

    CONSTRAINT "MasterTableDawa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmoliMuhasabaData" (
    "id" SERIAL NOT NULL,
    "tahajjud" TEXT NOT NULL,
    "ayat" TEXT NOT NULL,
    "zikir" TEXT NOT NULL,
    "ishraq" TEXT NOT NULL,
    "jamat" TEXT NOT NULL,
    "sirat" TEXT NOT NULL,
    "Dua" TEXT NOT NULL,
    "ilm" TEXT NOT NULL,
    "tasbih" TEXT NOT NULL,
    "dayeeAmol" TEXT NOT NULL,
    "amoliSura" TEXT NOT NULL,
    "ayamroja" TEXT NOT NULL,
    "hijbulBahar" TEXT NOT NULL,

    CONSTRAINT "AmoliMuhasabaData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DawatiBisoy" (
    "id" SERIAL NOT NULL,
    "nonMuslimDawat" INTEGER NOT NULL,
    "murtadDawat" INTEGER NOT NULL,
    "alemderSatheyMojlish" INTEGER NOT NULL,
    "publicSatheyMojlish" INTEGER NOT NULL,
    "nonMuslimSaptahikGasht" INTEGER NOT NULL,

    CONSTRAINT "DawatiBisoy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DawatiMojlish" (
    "id" SERIAL NOT NULL,
    "dawatterGuruttoMojlish" INTEGER NOT NULL,
    "mojlisheOnshogrohon" INTEGER NOT NULL,
    "prosikkhonKormoshalaAyojon" INTEGER NOT NULL,
    "prosikkhonOnshogrohon" INTEGER NOT NULL,
    "jummahAlochona" INTEGER NOT NULL,
    "dhormoSova" INTEGER NOT NULL,
    "mashwaraPoint" INTEGER NOT NULL,

    CONSTRAINT "DawatiMojlish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamatBisoy" (
    "id" SERIAL NOT NULL,
    "jamatBerHoise" INTEGER NOT NULL,
    "jamatSathi" INTEGER NOT NULL,

    CONSTRAINT "JamatBisoy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoforBisoy" (
    "id" SERIAL NOT NULL,
    "madrasaVisit" INTEGER NOT NULL,
    "moktobVisit" INTEGER NOT NULL,
    "schoolCollegeVisit" INTEGER NOT NULL,

    CONSTRAINT "SoforBisoy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayeBisoy" (
    "id" SERIAL NOT NULL,
    "sohojogiDayeToiri" INTEGER NOT NULL,

    CONSTRAINT "DayeBisoy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DinerDikeFireche" (
    "id" SERIAL NOT NULL,
    "nonMuslimMuslimHoise" INTEGER NOT NULL,
    "murtadIslamFireche" INTEGER NOT NULL,

    CONSTRAINT "DinerDikeFireche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoktobBisoy" (
    "id" SERIAL NOT NULL,
    "notunMoktobChalu" INTEGER NOT NULL,
    "totalMoktob" INTEGER NOT NULL,
    "totalStudent" INTEGER NOT NULL,
    "obhibhabokConference" INTEGER NOT NULL,
    "moktoThekeMadrasaAdmission" INTEGER NOT NULL,
    "notunBoyoskoShikkha" INTEGER NOT NULL,
    "totalBoyoskoShikkha" INTEGER NOT NULL,
    "boyoskoShikkhaOnshogrohon" INTEGER NOT NULL,
    "newMuslimeDinerFikir" INTEGER NOT NULL,

    CONSTRAINT "MoktobBisoy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalimBisoy" (
    "id" SERIAL NOT NULL,
    "mohilaTalim" INTEGER NOT NULL,
    "mohilaOnshogrohon" INTEGER NOT NULL,

    CONSTRAINT "TalimBisoy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MasterTableDawa_email_key" ON "MasterTableDawa"("email");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
