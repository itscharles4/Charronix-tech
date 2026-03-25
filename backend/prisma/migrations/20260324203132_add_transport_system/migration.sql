-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BUS', 'VAN', 'CAR');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('DIESEL', 'CNG', 'ELECTRIC', 'PETROL');

-- CreateEnum
CREATE TYPE "PickupType" AS ENUM ('BOTH', 'MORNING_ONLY', 'EVENING_ONLY');

-- CreateEnum
CREATE TYPE "BoardingType" AS ENUM ('BOARDING', 'DEBOARDING');

-- CreateEnum
CREATE TYPE "ScanMethod" AS ENUM ('QR_CODE', 'MANUAL');

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "license_no" TEXT NOT NULL,
    "license_expiry" TIMESTAMP(3) NOT NULL,
    "medical_expiry" TIMESTAMP(3) NOT NULL,
    "police_verified" BOOLEAN NOT NULL DEFAULT false,
    "photo_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "registration_no" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "insurance_no" TEXT,
    "insurance_expiry" TIMESTAMP(3),
    "permit_expiry" TIMESTAMP(3),
    "fitness_expiry" TIMESTAMP(3),
    "gps_device_id" TEXT,
    "fuelType" "FuelType" NOT NULL DEFAULT 'DIESEL',
    "odometer_reading" INTEGER NOT NULL DEFAULT 0,
    "last_service_date" TIMESTAMP(3),
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "driver_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "stop_name" TEXT NOT NULL,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "sequence" INTEGER NOT NULL,
    "morning_arrival" TEXT,
    "evening_arrival" TEXT,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_transports" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "stop_id" TEXT NOT NULL,
    "qr_code" TEXT,
    "fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pickup_type" "PickupType" NOT NULL DEFAULT 'BOTH',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boarding_logs" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "stop_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "BoardingType" NOT NULL,
    "scan_method" "ScanMethod" NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "boarding_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_license_no_key" ON "drivers"("license_no");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registration_no_key" ON "vehicles"("registration_no");

-- CreateIndex
CREATE INDEX "route_stops_route_id_idx" ON "route_stops"("route_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_transports_student_id_key" ON "student_transports"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_transports_qr_code_key" ON "student_transports"("qr_code");

-- CreateIndex
CREATE INDEX "student_transports_route_id_idx" ON "student_transports"("route_id");

-- CreateIndex
CREATE INDEX "boarding_logs_student_id_timestamp_idx" ON "boarding_logs"("student_id", "timestamp");

-- CreateIndex
CREATE INDEX "boarding_logs_vehicle_id_timestamp_idx" ON "boarding_logs"("vehicle_id", "timestamp");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transports" ADD CONSTRAINT "student_transports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transports" ADD CONSTRAINT "student_transports_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transports" ADD CONSTRAINT "student_transports_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "route_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarding_logs" ADD CONSTRAINT "boarding_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarding_logs" ADD CONSTRAINT "boarding_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boarding_logs" ADD CONSTRAINT "boarding_logs_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "route_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
