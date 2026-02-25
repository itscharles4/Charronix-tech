-- CreateTable
CREATE TABLE "timetable" (
    "id" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "period_time" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "teacher_name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CLASS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timetable_class_section_day_of_week_period_key" ON "timetable"("class", "section", "day_of_week", "period");
