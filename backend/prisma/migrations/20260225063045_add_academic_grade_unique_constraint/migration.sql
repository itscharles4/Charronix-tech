/*
  Warnings:

  - A unique constraint covering the columns `[student_id,subject,term,academic_year]` on the table `academic_grades` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "academic_grades_student_id_subject_term_academic_year_key" ON "academic_grades"("student_id", "subject", "term", "academic_year");
