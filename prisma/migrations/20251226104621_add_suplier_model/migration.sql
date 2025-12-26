-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Sales',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastQuoteDate" DATETIME
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerId" INTEGER,
    "travelersCountAdults" INTEGER NOT NULL DEFAULT 1,
    "travelersCountChildren" INTEGER NOT NULL DEFAULT 0,
    "travelersCountInfants" INTEGER NOT NULL DEFAULT 0,
    "destination" TEXT,
    "notesInternal" TEXT,
    "notesCustomer" TEXT,
    "totalFlights" REAL NOT NULL DEFAULT 0,
    "totalHotels" REAL NOT NULL DEFAULT 0,
    "totalServices" REAL NOT NULL DEFAULT 0,
    "markup" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "sentTo" TEXT,
    "lastSendStatus" TEXT,
    "lastSendError" TEXT,
    "approvedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdByUserId" INTEGER NOT NULL,
    "sentByUserId" INTEGER,
    CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quote_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlightSegment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "fromAirport" TEXT NOT NULL,
    "toAirport" TEXT NOT NULL,
    "stopoverAirport" TEXT,
    "departureDateTime" DATETIME,
    "arrivalDateTime" DATETIME,
    "returnFromAirport" TEXT,
    "returnToAirport" TEXT,
    "returnStopoverAirport" TEXT,
    "returnDepartureDateTime" DATETIME,
    "returnArrivalDateTime" DATETIME,
    "returnAirline" TEXT,
    "airline" TEXT NOT NULL,
    "flightType" TEXT NOT NULL DEFAULT 'OneWay',
    "baggageKg" INTEGER NOT NULL DEFAULT 23,
    "ticketCount" INTEGER NOT NULL DEFAULT 1,
    "supplier" TEXT,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "ticketPriceAdult" REAL NOT NULL DEFAULT 0,
    "ticketPriceChild" REAL NOT NULL DEFAULT 0,
    "ticketPriceInfant" REAL NOT NULL DEFAULT 0,
    "segmentTotal" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "FlightSegment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HotelStay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "hotelStars" INTEGER NOT NULL DEFAULT 3,
    "checkInDate" DATETIME,
    "checkOutDate" DATETIME,
    "roomType" TEXT,
    "mealPlan" TEXT,
    "roomCount" INTEGER NOT NULL DEFAULT 1,
    "roomPricePerNight" REAL NOT NULL DEFAULT 0,
    "nights" INTEGER NOT NULL DEFAULT 1,
    "supplier" TEXT,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "stayTotal" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "HotelStay_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceDetails" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "serviceTotal" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "QuoteService_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceCatalog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "defaultUnitPrice" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "quoteId" INTEGER,
    "userId" INTEGER NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Airport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "cityAr" TEXT NOT NULL,
    "cityEn" TEXT NOT NULL,
    "countryAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Airline" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 3,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_code_key" ON "Airport"("code");

-- CreateIndex
CREATE INDEX "Airport_code_idx" ON "Airport"("code");

-- CreateIndex
CREATE INDEX "Airport_cityAr_idx" ON "Airport"("cityAr");

-- CreateIndex
CREATE INDEX "Airport_cityEn_idx" ON "Airport"("cityEn");

-- CreateIndex
CREATE UNIQUE INDEX "Airline_code_key" ON "Airline"("code");

-- CreateIndex
CREATE INDEX "Airline_code_idx" ON "Airline"("code");

-- CreateIndex
CREATE INDEX "Airline_nameAr_idx" ON "Airline"("nameAr");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_nameAr_idx" ON "Country"("nameAr");

-- CreateIndex
CREATE INDEX "Hotel_name_idx" ON "Hotel"("name");

-- CreateIndex
CREATE INDEX "Hotel_city_idx" ON "Hotel"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_name_city_key" ON "Hotel"("name", "city");
