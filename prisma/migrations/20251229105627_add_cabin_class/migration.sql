-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlightSegment" (
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
    "cabinClass" TEXT NOT NULL DEFAULT 'Economy',
    "weight" TEXT,
    "returnWeight" TEXT,
    "baggageKg" INTEGER NOT NULL DEFAULT 23,
    "ticketCount" INTEGER NOT NULL DEFAULT 1,
    "stopoverTime" REAL,
    "returnStopoverTime" REAL,
    "supplier" TEXT,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "ticketPriceAdult" REAL NOT NULL DEFAULT 0,
    "ticketPriceChild" REAL NOT NULL DEFAULT 0,
    "ticketPriceInfant" REAL NOT NULL DEFAULT 0,
    "segmentTotal" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "FlightSegment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FlightSegment" ("airline", "arrivalDateTime", "baggageKg", "costPrice", "departureDateTime", "flightType", "fromAirport", "id", "notes", "quoteId", "returnAirline", "returnArrivalDateTime", "returnDepartureDateTime", "returnFromAirport", "returnStopoverAirport", "returnToAirport", "segmentTotal", "stopoverAirport", "supplier", "ticketCount", "ticketPriceAdult", "ticketPriceChild", "ticketPriceInfant", "toAirport") SELECT "airline", "arrivalDateTime", "baggageKg", "costPrice", "departureDateTime", "flightType", "fromAirport", "id", "notes", "quoteId", "returnAirline", "returnArrivalDateTime", "returnDepartureDateTime", "returnFromAirport", "returnStopoverAirport", "returnToAirport", "segmentTotal", "stopoverAirport", "supplier", "ticketCount", "ticketPriceAdult", "ticketPriceChild", "ticketPriceInfant", "toAirport" FROM "FlightSegment";
DROP TABLE "FlightSegment";
ALTER TABLE "new_FlightSegment" RENAME TO "FlightSegment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
