-- ============================================
-- CHARRONIX SCHOOL MANAGEMENT SYSTEM
-- TEST DATA INSERTION SCRIPT - PHASE 2
-- Date: February 22, 2026
-- ============================================

-- Set timezone
SET timezone = 'UTC';

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- ============================================
-- 1. INSERT USERS
-- ============================================

-- Admin User
INSERT INTO users (id, email, password_hash, role, login_id, is_active, created_at, updated_at)
VALUES (
  'user-admin-001',
  'admin@charronix.school',
  '$2b$12$examplehash11111111111111111111111111111111111111111111111',
  'ADMIN',
  'ADMIN001',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Principal User
INSERT INTO users (id, email, password_hash, role, login_id, is_active, created_at, updated_at)
VALUES (
  'user-principal-001',
  'principal@charronix.school',
  '$2b$12$examplehash22222222222222222222222222222222222222222222222',
  'PRINCIPAL',
  'PRIN001',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Teachers
INSERT INTO users (id, email, password_hash, role, login_id, is_active, created_at, updated_at)
VALUES
  ('user-teacher-001', 'teacher1@charronix.school', '$2b$12$examplehash33333333333333333333333333333333333333333333333', 'TEACHER', 'TCH001', true, NOW(), NOW()),
  ('user-teacher-002', 'teacher2@charronix.school', '$2b$12$examplehash44444444444444444444444444444444444444444444444', 'TEACHER', 'TCH002', true, NOW(), NOW()),
  ('user-teacher-003', 'teacher3@charronix.school', '$2b$12$examplehash55555555555555555555555555555555555555555555555', 'TEACHER', 'TCH003', true, NOW(), NOW()),
  ('user-teacher-004', 'teacher4@charronix.school', '$2b$12$examplehash66666666666666666666666666666666666666666666666', 'TEACHER', 'TCH004', true, NOW(), NOW()),
  ('user-teacher-005', 'teacher5@charronix.school', '$2b$12$examplehash77777777777777777777777777777777777777777777777', 'TEACHER', 'TCH005', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Students
INSERT INTO users (id, email, password_hash, role, login_id, is_active, created_at, updated_at)
VALUES
  ('user-student-001', 'nisha.rao@charronix.school', '$2b$12$examplehash88888888888888888888888888888888888888888888888', 'STUDENT', 'STU001', true, NOW(), NOW()),
  ('user-student-002', 'diya.verma@charronix.school', '$2b$12$examplehash99999999999999999999999999999999999999999999999', 'STUDENT', 'STU002', true, NOW(), NOW()),
  ('user-student-003', 'arjun.kumar@charronix.school', '$2b$12$examplehashaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'STUDENT', 'STU003', true, NOW(), NOW()),
  ('user-student-004', 'priya.singh@charronix.school', '$2b$12$examplehashbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'STUDENT', 'STU004', true, NOW(), NOW()),
  ('user-student-005', 'rahul.patel@charronix.school', '$2b$12$examplehashcccccccccccccccccccccccccccccccccccccccccccccc', 'STUDENT', 'STU005', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. INSERT TEACHERS
-- ============================================

INSERT INTO teachers (id, user_id, employee_id, first_name, last_name, phone, email, qualification, date_of_joining, is_class_teacher_of, status, created_at, updated_at)
VALUES
  ('teacher-001', 'user-teacher-001', 'EMP001', 'Priya', 'Iyer', '9876543210', 'teacher1@charronix.school', 'M.Sc Physics', '2023-06-01', '10-A', 'ACTIVE', NOW(), NOW()),
  ('teacher-002', 'user-teacher-002', 'EMP002', 'Rajesh', 'Kumar', '9876543211', 'teacher2@charronix.school', 'M.Sc Mathematics', '2023-06-01', NULL, 'ACTIVE', NOW(), NOW()),
  ('teacher-003', 'user-teacher-003', 'EMP003', 'Anjali', 'Sharma', '9876543212', 'teacher3@charronix.school', 'M.A English', '2023-09-01', NULL, 'ACTIVE', NOW(), NOW()),
  ('teacher-004', 'user-teacher-004', 'EMP004', 'Vikram', 'Singh', '9876543213', 'teacher4@charronix.school', 'B.Sc Chemistry', '2023-09-01', '10-B', 'ACTIVE', NOW(), NOW()),
  ('teacher-005', 'user-teacher-005', 'EMP005', 'Deepa', 'Nair', '9876543214', 'teacher5@charronix.school', 'M.Com Commerce', '2024-01-15', NULL, 'ACTIVE', NOW(), NOW())
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================
-- 3. INSERT STUDENTS
-- ============================================

INSERT INTO students (id, user_id, admission_no, first_name, last_name, date_of_birth, gender, class, section, roll_no, parent_name, parent_phone, parent_email, status, blood_group, total_present, total_absent, attendance_percentage, created_at, updated_at)
VALUES
  ('student-001', 'user-student-001', 'ADM2024001', 'Nisha', 'Rao', '2010-03-15', 'Female', '10', 'A', 1, 'Rajesh Rao', '9812345678', 'rajesh.rao@email.com', 'ACTIVE', 'O+', 45, 5, 90.0, NOW(), NOW()),
  ('student-002', 'user-student-002', 'ADM2024002', 'Diya', 'Verma', '2010-05-22', 'Female', '10', 'A', 2, 'Amit Verma', '9812345679', 'amit.verma@email.com', 'ACTIVE', 'B+', 43, 7, 86.0, NOW(), NOW()),
  ('student-003', 'user-student-003', 'ADM2024003', 'Arjun', 'Kumar', '2010-07-11', 'Male', '10', 'B', 3, 'Vikram Kumar', '9812345680', 'vikram.kumar@email.com', 'ACTIVE', 'A+', 40, 10, 80.0, NOW(), NOW()),
  ('student-004', 'user-student-004', 'ADM2024004', 'Priya', 'Singh', '2010-02-28', 'Female', '10', 'B', 4, 'Suresh Singh', '9812345681', 'suresh.singh@email.com', 'ACTIVE', 'AB+', 38, 12, 76.0, NOW(), NOW()),
  ('student-005', 'user-student-005', 'ADM2024005', 'Rahul', 'Patel', '2010-09-19', 'Male', '10', 'A', 5, 'Nitin Patel', '9812345682', 'nitin.patel@email.com', 'ACTIVE', 'O-', 42, 8, 84.0, NOW(), NOW())
ON CONFLICT (admission_no) DO NOTHING;

-- ============================================
-- 4. INSERT MEDICAL INFO
-- ============================================

INSERT INTO medical_info (id, student_id, blood_group, allergies, chronic_conditions, last_checkup, emergency_contact, notes, updated_at)
VALUES
  ('med-001', 'student-001', 'O+', ARRAY['Peanuts'], ARRAY[]::text[], NOW()::date, '9812345678', 'Healthy', NOW()),
  ('med-002', 'student-002', 'B+', ARRAY[]::text[], ARRAY[]::text[], NOW()::date, '9812345679', 'Regular checkups', NOW()),
  ('med-003', 'student-003', 'A+', ARRAY['Milk'], ARRAY['Asthma']::text[], NOW()::date, '9812345680', 'Asthma inhaler available', NOW()),
  ('med-004', 'student-004', 'AB+', ARRAY[]::text[], ARRAY[]::text[], NOW()::date, '9812345681', 'Healthy', NOW()),
  ('med-005', 'student-005', 'O-', ARRAY['Eggs'], ARRAY[]::text[], NOW()::date, '9812345682', 'Healthy', NOW())
ON CONFLICT (student_id) DO NOTHING;

-- ============================================
-- 5. INSERT ACADEMIC GRADES
-- ============================================

INSERT INTO academic_grades (id, student_id, subject, score, max_score, grade, term, academic_year, entered_by, created_at)
VALUES
  -- Nisha Rao Grades
  ('grade-001', 'student-001', 'History', 75, 100, 'B+', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-002', 'student-001', 'English', 94, 100, 'A+', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-003', 'student-001', 'Chemistry', 89, 100, 'A', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-004', 'student-001', 'Physics', 73, 100, 'B+', 'Term 1', '2025-26', 'teacher-001', NOW()),
  ('grade-005', 'student-001', 'Mathematics', 73, 100, 'B+', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-006', 'student-001', 'Hindi', 82, 100, 'A', 'Term 1', '2025-26', 'teacher-005', NOW()),
  
  -- Diya Verma Grades
  ('grade-007', 'student-002', 'History', 68, 100, 'B', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-008', 'student-002', 'English', 85, 100, 'A', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-009', 'student-002', 'Chemistry', 78, 100, 'B+', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-010', 'student-002', 'Physics', 81, 100, 'A', 'Term 1', '2025-26', 'teacher-001', NOW()),
  ('grade-011', 'student-002', 'Mathematics', 88, 100, 'A', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-012', 'student-002', 'Hindi', 76, 100, 'B+', 'Term 1', '2025-26', 'teacher-005', NOW()),
  
  -- Arjun Kumar Grades
  ('grade-013', 'student-003', 'History', 72, 100, 'B+', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-014', 'student-003', 'English', 79, 100, 'B+', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-015', 'student-003', 'Chemistry', 65, 100, 'B', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-016', 'student-003', 'Physics', 70, 100, 'B', 'Term 1', '2025-26', 'teacher-001', NOW()),
  ('grade-017', 'student-003', 'Mathematics', 75, 100, 'B+', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-018', 'student-003', 'Hindi', 68, 100, 'B', 'Term 1', '2025-26', 'teacher-005', NOW()),
  
  -- Priya Singh Grades
  ('grade-019', 'student-004', 'History', 70, 100, 'B', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-020', 'student-004', 'English', 82, 100, 'A', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-021', 'student-004', 'Chemistry', 72, 100, 'B+', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-022', 'student-004', 'Physics', 66, 100, 'B', 'Term 1', '2025-26', 'teacher-001', NOW()),
  ('grade-023', 'student-004', 'Mathematics', 74, 100, 'B+', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-024', 'student-004', 'Hindi', 80, 100, 'A', 'Term 1', '2025-26', 'teacher-005', NOW()),
  
  -- Rahul Patel Grades
  ('grade-025', 'student-005', 'History', 77, 100, 'B+', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-026', 'student-005', 'English', 84, 100, 'A', 'Term 1', '2025-26', 'teacher-003', NOW()),
  ('grade-027', 'student-005', 'Chemistry', 80, 100, 'A', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-028', 'student-005', 'Physics', 78, 100, 'B+', 'Term 1', '2025-26', 'teacher-001', NOW()),
  ('grade-029', 'student-005', 'Mathematics', 82, 100, 'A', 'Term 1', '2025-26', 'teacher-002', NOW()),
  ('grade-030', 'student-005', 'Hindi', 79, 100, 'B+', 'Term 1', '2025-26', 'teacher-005', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. INSERT ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (id, student_id, title, date, category, description, created_at)
VALUES
  ('ach-001', 'student-001', 'Perfect Attendance', '2025-12-31'::date, 'Academic', 'Achieved 100% attendance in December', NOW()),
  ('ach-002', 'student-001', 'Math Olympiad Participant', '2025-11-15'::date, 'Academic', 'Participated in District Math Olympiad', NOW()),
  ('ach-003', 'student-002', 'Debate Team Captain', '2025-10-20'::date, 'Cultural', 'Led school debate team to victory', NOW()),
  ('ach-004', 'student-002', 'Merit Scholarship', '2025-09-01'::date, 'Academic', 'Awarded merit scholarship for excellence', NOW()),
  ('ach-005', 'student-003', 'Sports Excellence', '2025-12-15'::date, 'Sports', 'Won gold in 100m sprint', NOW()),
  ('ach-006', 'student-003', 'Student Council Member', '2025-08-01'::date, 'Behavior', 'Elected to student council', NOW()),
  ('ach-007', 'student-004', 'Science Club Member', '2025-07-15'::date, 'Academic', 'Active member of school science club', NOW()),
  ('ach-008', 'student-005', 'Perfect Attendance', '2025-12-31'::date, 'Academic', 'Achieved 100% attendance in December', NOW()),
  ('ach-009', 'student-005', 'Art Exhibition Participant', '2025-11-01'::date, 'Cultural', 'Showcased artwork in school exhibition', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. INSERT NOTICES
-- ============================================

INSERT INTO notices (id, title, message, target, date, author, type, priority, expires_at, created_by, created_at)
VALUES
  ('notice-001', 'Mid-Term Exam Schedule Released', 'Examinations from Feb 24 - Mar 10, 2026. See notice board for details.', 'CLASS 10', NOW()::date, 'Principal', 'EXAM', 'HIGH', (NOW() + INTERVAL '30 days'), 'user-principal-001', NOW()),
  ('notice-002', 'School Republic Day Celebration', 'All students must wear school uniform. Flag hoisting at 8:00 AM.', 'SCHOOL', NOW()::date, 'Principal', 'EVENT', 'NORMAL', (NOW() + INTERVAL '7 days'), 'user-principal-001', NOW()),
  ('notice-003', 'Winter Vacation Extended', 'Vacation extended by 2 days due to weather. Reopen on Jan 8, 2026.', 'SCHOOL', NOW()::date, 'Administration', 'GENERAL', 'NORMAL', (NOW() + INTERVAL '60 days'), 'user-principal-001', NOW()),
  ('notice-004', 'Parent-Teacher Meeting', 'PTM scheduled for Feb 28, 2026. Time: 2:00 PM - 4:00 PM in school hall.', 'CLASS 10', NOW()::date, 'Class Teacher', 'EVENT', 'NORMAL', (NOW() + INTERVAL '10 days'), 'user-principal-001', NOW()),
  ('notice-005', 'Library Membership Drive', 'New members welcome. Register at library during lunch time.', 'SCHOOL', NOW()::date, 'Librarian', 'GENERAL', 'LOW', (NOW() + INTERVAL '14 days'), 'user-principal-001', NOW()),
  ('notice-006', 'Science Fair 2026', 'Science fair on Mar 20. Register projects by Mar 1. 2-3 members per group.', 'SCHOOL', NOW()::date, 'Science Dept', 'EVENT', 'HIGH', (NOW() + INTERVAL '30 days'), 'user-principal-001', NOW()),
  ('notice-007', 'Fee Remittance Notice', 'School fee for Feb 2026 due by Feb 15. Submit to office.', 'CLASS 10', NOW()::date, 'Finance', 'GENERAL', 'URGENT', (NOW() + INTERVAL '3 days'), 'user-principal-001', NOW()),
  ('notice-008', 'Sports Day Announcement', 'Annual sports day on Mar 15. All students participate. House points awarded.', 'SCHOOL', NOW()::date, 'Sports Head', 'EVENT', 'NORMAL', (NOW() + INTERVAL '25 days'), 'user-principal-001', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. INSERT NOTIFICATIONS
-- ============================================

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
VALUES
  -- Nisha Rao Notifications
  ('notif-001', 'user-student-001', 'Mid-Term Exam Schedule Released', 'Exam schedule for Term 1 has been published. Check timetable for details.', 'INFO', false, NOW()),
  ('notif-002', 'user-student-001', 'Assignment Due Reminder', 'Mathematics assignment due on Feb 24. Topic: Calculus', 'WARNING', false, NOW() - INTERVAL '1 day'),
  ('notif-003', 'user-student-001', 'Achievement Unlocked', 'Congratulations! Perfect Attendance badge earned!', 'SUCCESS', true, NOW() - INTERVAL '7 days'),
  ('notif-004', 'user-student-001', 'Parent-Teacher Meeting', 'PTM scheduled for Feb 28, 10:00 AM in school hall.', 'INFO', true, NOW() - INTERVAL '14 days'),
  ('notif-005', 'user-student-001', 'Low Attendance Alert', 'Your attendance is below 75% warning threshold.', 'WARNING', true, NOW() - INTERVAL '30 days'),
  
  -- Diya Verma Notifications
  ('notif-006', 'user-student-002', 'Science Project Submission', 'Submit science project by Mar 1 for Science Fair.', 'WARNING', false, NOW()),
  ('notif-007', 'user-student-002', 'Grades Published', 'Term 1 grades are now available in student portal.', 'SUCCESS', false, NOW() - INTERVAL '1 day'),
  ('notif-008', 'user-student-002', 'Library Book Due', 'Return library books by Feb 25. Reminders only.', 'INFO', true, NOW() - INTERVAL '5 days'),
  ('notif-009', 'user-student-002', 'Sports Day Registration', 'Register for sports day by Mar 5. Multiple events available.', 'INFO', true, NOW() - INTERVAL '15 days'),
  ('notif-010', 'user-student-002', 'Debate Club Meeting', 'First meeting of debate club on Feb 22 at 4 PM.', 'INFO', true, NOW() - INTERVAL '20 days'),
  
  -- Arjun Kumar Notifications
  ('notif-011', 'user-student-003', 'Physics Practical Exam', 'Physics practical exam on Mar 10. Lab access available from 3-5 PM.', 'WARNING', false, NOW()),
  ('notif-012', 'user-student-003', 'Field Trip Announcement', 'Biology field trip to botanical garden on Mar 5.', 'INFO', false, NOW() - INTERVAL '2 days'),
  ('notif-013', 'user-student-003', 'Attendance Below Target', 'Your attendance is at 80%. Try to maintain above 85%.', 'WARNING', true, NOW() - INTERVAL '3 days'),
  ('notif-014', 'user-student-003', 'Class Timings Changed', 'Class timings changed for Feb 22. Check notice board.', 'INFO', true, NOW() - INTERVAL '10 days'),
  
  -- Priya Singh Notifications
  ('notif-015', 'user-student-004', 'Exam Results Updated', 'Your exam results are ready for download.', 'SUCCESS', false, NOW()),
  ('notif-016', 'user-student-004', 'Scholarship Opportunity', 'Merit scholarship applications open. Apply by Mar 1.', 'INFO', false, NOW() - INTERVAL '1 day'),
  ('notif-017', 'user-student-004', 'Club Activities', 'Art club meeting on Feb 24. All interested students welcome.', 'INFO', true, NOW() - INTERVAL '8 days'),
  
  -- Rahul Patel Notifications
  ('notif-018', 'user-student-005', 'Perfect Attendance Bonus', 'Congratulations on maintaining 100% attendance!', 'SUCCESS', false, NOW()),
  ('notif-019', 'user-student-005', 'Magazine Submission', 'School magazine looking for contributions. Deadline Mar 1.', 'INFO', false, NOW() - INTERVAL '2 days'),
  ('notif-020', 'user-student-005', 'Sports Practice Schedule', 'Cricket team practice on Tue & Thu from 4-5 PM.', 'INFO', true, NOW() - INTERVAL '12 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. INSERT ATTENDANCE RECORDS (FEBRUARY 2026)
-- ============================================

INSERT INTO attendance (id, student_id, date, status, marked_by, remarks, created_at)
VALUES
  -- Nisha Rao (student-001) - 22 days
  ('att-nisha-001', 'student-001', '2026-02-01'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-002', 'student-001', '2026-02-02'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-003', 'student-001', '2026-02-03'::date, 'ABSENT', 'teacher-001', 'Sick', NOW()),
  ('att-nisha-004', 'student-001', '2026-02-04'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-005', 'student-001', '2026-02-05'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-006', 'student-001', '2026-02-06'::date, 'LATE', 'teacher-001', '8:15 AM', NOW()),
  ('att-nisha-007', 'student-001', '2026-02-09'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-008', 'student-001', '2026-02-10'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-009', 'student-001', '2026-02-11'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-010', 'student-001', '2026-02-12'::date, 'ABSENT', 'teacher-001', 'Medical leave', NOW()),
  ('att-nisha-011', 'student-001', '2026-02-13'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-012', 'student-001', '2026-02-16'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-013', 'student-001', '2026-02-17'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-014', 'student-001', '2026-02-18'::date, 'LATE', 'teacher-001', '8:30 AM', NOW()),
  ('att-nisha-015', 'student-001', '2026-02-19'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-016', 'student-001', '2026-02-20'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-017', 'student-001', '2026-02-23'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-018', 'student-001', '2026-02-24'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-019', 'student-001', '2026-02-25'::date, 'LEAVE', 'teacher-001', 'Family event', NOW()),
  ('att-nisha-020', 'student-001', '2026-02-26'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-021', 'student-001', '2026-02-27'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-nisha-022', 'student-001', '2026-02-28'::date, 'PRESENT', 'teacher-001', '-', NOW()),

  -- Diya Verma (student-002)
  ('att-diya-001', 'student-002', '2026-02-01'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-002', 'student-002', '2026-02-02'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-003', 'student-002', '2026-02-03'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-004', 'student-002', '2026-02-04'::date, 'LATE', 'teacher-002', '8:20 AM', NOW()),
  ('att-diya-005', 'student-002', '2026-02-05'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-006', 'student-002', '2026-02-06'::date, 'ABSENT', 'teacher-002', 'Permission', NOW()),
  ('att-diya-007', 'student-002', '2026-02-09'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-008', 'student-002', '2026-02-10'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-009', 'student-002', '2026-02-11'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-010', 'student-002', '2026-02-12'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-011', 'student-002', '2026-02-13'::date, 'ABSENT', 'teacher-002', 'Not well', NOW()),
  ('att-diya-012', 'student-002', '2026-02-16'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-013', 'student-002', '2026-02-17'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-014', 'student-002', '2026-02-18'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-015', 'student-002', '2026-02-19'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-016', 'student-002', '2026-02-20'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-017', 'student-002', '2026-02-23'::date, 'LATE', 'teacher-002', '8:25 AM', NOW()),
  ('att-diya-018', 'student-002', '2026-02-24'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-019', 'student-002', '2026-02-25'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-020', 'student-002', '2026-02-26'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-021', 'student-002', '2026-02-27'::date, 'PRESENT', 'teacher-002', '-', NOW()),
  ('att-diya-022', 'student-002', '2026-02-28'::date, 'PRESENT', 'teacher-002', '-', NOW()),

  -- Arjun Kumar (student-003)
  ('att-arjun-001', 'student-003', '2026-02-01'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-002', 'student-003', '2026-02-02'::date, 'ABSENT', 'teacher-004', 'Unwell', NOW()),
  ('att-arjun-003', 'student-003', '2026-02-03'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-004', 'student-003', '2026-02-04'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-005', 'student-003', '2026-02-05'::date, 'ABSENT', 'teacher-004', 'Not feeling well', NOW()),
  ('att-arjun-006', 'student-003', '2026-02-06'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-007', 'student-003', '2026-02-09'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-008', 'student-003', '2026-02-10'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-009', 'student-003', '2026-02-11'::date, 'ABSENT', 'teacher-004', 'Medical', NOW()),
  ('att-arjun-010', 'student-003', '2026-02-12'::date, 'LATE', 'teacher-004', '8:40 AM', NOW()),
  ('att-arjun-011', 'student-003', '2026-02-13'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-012', 'student-003', '2026-02-16'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-013', 'student-003', '2026-02-17'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-014', 'student-003', '2026-02-18'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-015', 'student-003', '2026-02-19'::date, 'ABSENT', 'teacher-004', 'Family work', NOW()),
  ('att-arjun-016', 'student-003', '2026-02-20'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-017', 'student-003', '2026-02-23'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-018', 'student-003', '2026-02-24'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-019', 'student-003', '2026-02-25'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-020', 'student-003', '2026-02-26'::date, 'LATE', 'teacher-004', '8:35 AM', NOW()),
  ('att-arjun-021', 'student-003', '2026-02-27'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-arjun-022', 'student-003', '2026-02-28'::date, 'PRESENT', 'teacher-004', '-', NOW()),

  -- Priya Singh (student-004)
  ('att-priya-001', 'student-004', '2026-02-01'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-002', 'student-004', '2026-02-02'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-003', 'student-004', '2026-02-03'::date, 'ABSENT', 'teacher-004', 'Medical', NOW()),
  ('att-priya-004', 'student-004', '2026-02-04'::date, 'ABSENT', 'teacher-004', 'Sick leave', NOW()),
  ('att-priya-005', 'student-004', '2026-02-05'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-006', 'student-004', '2026-02-06'::date, 'LATE', 'teacher-004', '8:30 AM', NOW()),
  ('att-priya-007', 'student-004', '2026-02-09'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-008', 'student-004', '2026-02-10'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-009', 'student-004', '2026-02-11'::date, 'ABSENT', 'teacher-004', 'Family event', NOW()),
  ('att-priya-010', 'student-004', '2026-02-12'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-011', 'student-004', '2026-02-13'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-012', 'student-004', '2026-02-16'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-013', 'student-004', '2026-02-17'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-014', 'student-004', '2026-02-18'::date, 'ABSENT', 'teacher-004', 'Not feeling', NOW()),
  ('att-priya-015', 'student-004', '2026-02-19'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-016', 'student-004', '2026-02-20'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-017', 'student-004', '2026-02-23'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-018', 'student-004', '2026-02-24'::date, 'LATE', 'teacher-004', '8:15 AM', NOW()),
  ('att-priya-019', 'student-004', '2026-02-25'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-020', 'student-004', '2026-02-26'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-021', 'student-004', '2026-02-27'::date, 'PRESENT', 'teacher-004', '-', NOW()),
  ('att-priya-022', 'student-004', '2026-02-28'::date, 'PRESENT', 'teacher-004', '-', NOW()),

  -- Rahul Patel (student-005)
  ('att-rahul-001', 'student-005', '2026-02-01'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-002', 'student-005', '2026-02-02'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-003', 'student-005', '2026-02-03'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-004', 'student-005', '2026-02-04'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-005', 'student-005', '2026-02-05'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-006', 'student-005', '2026-02-06'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-007', 'student-005', '2026-02-09'::date, 'LATE', 'teacher-001', '8:25 AM', NOW()),
  ('att-rahul-008', 'student-005', '2026-02-10'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-009', 'student-005', '2026-02-11'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-010', 'student-005', '2026-02-12'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-011', 'student-005', '2026-02-13'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-012', 'student-005', '2026-02-16'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-013', 'student-005', '2026-02-17'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-014', 'student-005', '2026-02-18'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-015', 'student-005', '2026-02-19'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-016', 'student-005', '2026-02-20'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-017', 'student-005', '2026-02-23'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-018', 'student-005', '2026-02-24'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-019', 'student-005', '2026-02-25'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-020', 'student-005', '2026-02-26'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-021', 'student-005', '2026-02-27'::date, 'PRESENT', 'teacher-001', '-', NOW()),
  ('att-rahul-022', 'student-005', '2026-02-28'::date, 'PRESENT', 'teacher-001', '-', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. INSERT COMMUNICATION LOGS
-- ============================================

INSERT INTO communication_logs (id, student_id, date, type, note, author, created_at)
VALUES
  ('comm-001', 'student-001', NOW()::date, 'SMS', 'Attendance reminder', 'System', NOW()),
  ('comm-002', 'student-002', NOW()::date, 'Meeting', 'Parent teacher meeting', 'Priya Iyer', NOW()),
  ('comm-003', 'student-003', (NOW() - INTERVAL '1 day')::date, 'SMS', 'Low attendance alert', 'System', NOW()),
  ('comm-004', 'student-004', (NOW() - INTERVAL '2 days')::date, 'Call', 'Follow-up on grades', 'School', NOW()),
  ('comm-005', 'student-005', (NOW() - INTERVAL '5 days')::date, 'SMS', 'Congratulations on perfect attendance', 'System', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- Re-enable foreign key constraints
-- ============================================

SET session_replication_role = 'origin';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show final counts
SELECT 'Users' as entity, COUNT(*) FROM users
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'Academic Grades', COUNT(*) FROM academic_grades
UNION ALL
SELECT 'Achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'Notices', COUNT(*) FROM notices
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Attendance Records', COUNT(*) FROM attendance
UNION ALL
SELECT 'Communication Logs', COUNT(*) FROM communication_logs;
