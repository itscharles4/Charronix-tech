# Charronix School Management System — Manual Test Cases

| TEST CASE NAME | TEST CASE DESCRIPTION | P | STEP NAME | STEP DESCRIPTION | TEST DATA | EXPECTED RESULT |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01_Auth_Login_Verify admin login** | This test case validates the login functionality for the Admin role with valid credentials. | P0 | Step 1 | Navigate to the login page of Charronix. | URL: http://localhost:3000 | Login page should be displayed with fields for ID and Password. |
| | | | Step 2 | Enter valid Admin Login ID and Password. | ID: `900001`<br>Pass: `Admin@1234` | The system should authenticate and redirect to the Principal/Admin Dashboard. |
| **TC02_Attendance_Marking_Teacher** | This test case verifies that a teacher can successfully mark attendance for a student. | P0 | Step 1 | Login as Teacher. | ID: `100001`<br>Pass: `Teacher@1234` | Teacher dashboard should display the list of assigned classes (e.g., 10-A). |
| | | | Step 2 | Select a class and mark a student as "Present". | Student: Rahul Khan<br>Status: Present | The database should update the record, and the UI should reflect the status change. |
| **TC03_Academics_GradeEntry_Teacher** | This test case ensures teachers can enter exam grades for students. | P1 | Step 1 | Navigate to the "Academics" or "Grades" section in the Teacher portal. | | Grade entry table should appear for the selected subject (e.g., Mathematics). |
| | | | Step 2 | Enter marks for a student and click "Save". | Student: Rahul Khan<br>Marks: 85 | Success message "Grades updated" should appear; PDF export button should be enabled. |
| **TC04_AI_Assistant_StudentQuery** | This test case validates the AI Insight functionality for students. | P1 | Step 1 | Login as Student and open the AI Chatbot portal. | ID: `24BIT0522`<br>Pass: `Student@1234` | AI interface with history should be visible. |
| | | | Step 2 | Type a query about "attendance percentage". | Query: "Show my attendance summary" | AI should respond with the correct attendance stats fetched from the system. |
| **TC06_Student_Profile_Verification** | This test casc validates that student details are correctly displayed in the profile section. | P1 | Step 1 | Login as Student and navigate to "Profile". | ID: `24BIT0522` | Profile should show Name: Rahul Khan, Class: 1-A, Admission: ADM2024522. |
| **TC07_Auth_Invalid_Login** | This test case verifies that login fails with incorrect password for a valid ID. | P0 | Step 1 | Enter valid Admin ID and "WrongPassword". | ID: `900001`<br>Pass: `Wrong` | System should show "Invalid credentials" error message. |
| **TC08_Auth_RBAC_Restriction** | This test case ensures Role-Based Access Control blocks students from Admin routes. | P0 | Step 1 | Login as Student. | ID: `24BIT0522` | Student successfully logs in to Student portal. |
| | | | Step 2 | Manually type `/admin` or `/principal` in URL. | URL suffix: `/admin` | System should redirect to "Access Denied" or back to Student dashboard. |
| **TC09_Timetable_View_Teacher** | This test case validates that the teacher can view their personal timetable for the week. | P1 | Step 1 | Login as Teacher and navigate to "Timetable". | ID: `100001` | A clean grid showing Mathematics/Physics classes for the current week should be displayed. |
| **TC10_AI_History_Persistence** | This test case ensures AI chat history is saved and fetched on reload. | P2 | Step 1 | Send a message to AI, then logout and log back in. | Query: "Hello AI" | Previous message "Hello AI" and response should be visible in chat history. |
| **TC11_Academics_Report_Export** | This test case verifies the PDF generation for student report cards. | P1 | Step 1 | Navigate to Academics > Reports in Student portal. | | "Download Report Card (PDF)" button should be visible. |
| | | | Step 2 | Click on Download button. | | A PDF file should be generated containing correct grades and attendance stats. |
| **TC12_UI_Mobile_Responsiveness** | This test case validates the dashboard layout on smaller screens. | P2 | Step 1 | Open the dashboard on a mobile browser or emulate mobile view. | Resolution: 375x812 | Sidebar should collapse into a hamburger menu; charts should resize correctly. |
| **TC13_Admin_Teacher_Creation** | This test case verifies that the Admin can add a new teacher to the system. | P1 | Step 1 | Navigate to "Teacher Management" > "Add New". | | "Add Teacher" form should be displayed. |
| | | | Step 2 | Fill in details (EMP031, Nitin Menon) and click "Create". | Name: Nitin Menon<br>ID: EMP031 | System should create the user and generate a default password. |
| **TC14_Admin_Student_Deactivation** | This test case ensures Admins can deactivate a student account. | P1 | Step 1 | Find a student in the list and click "Deactivate". | ID: `24BIT0522` | Status should change to "INACTIVE", and the student should no longer be able to login. |
| **TC15_Admin_System_Settings** | This test case checks if system-wide settings can be updated. | P2 | Step 1 | Navigate to Settings > School Info. | | Current school information should be editable. |
| | | | Step 2 | Update "School Name" and click "Save". | Name: "Charronix High" | The new name should reflect on the login page and reports. |
| **TC16_Attendance_SMS_Alert** | This test case verifies that an SMS alert is triggered when a student is marked absent. | P0 | Step 1 | Mark a student as "Absent". | Student: Rahul Khan | System should flag `sms_notification_sent: true` in the database. |
| **TC17_Attendance_Filter_ByDate** | This test case validates filtering of attendance records by date. | P2 | Step 1 | Use the date picker to select a specific date range. | Range: 2026-03-01 to 2026-03-07 | Only attendance records for the selected week should be shown. |
| **TC18_Academics_GPA_Calculation** | This test case ensures the GPA is correctly calculated based on scores. | P1 | Step 1 | Input scores for all subjects in a term. | Math: 90, Sci: 80 | GPA should be updated automatically in the student's academic profile. |
| **TC19_Parent_Fee_Portal_View** | This test case validates that parents can see outstanding fee records. | P0 | Step 1 | Login as Parent and navigate to "Fees". | ID: `200006` | A list of Pending, Paid, and Overdue fees should be displayed. |
| **TC20_Parent_Fee_Payment_Online** | This test case verifies the online payment flow via integrated gateway. | P0 | Step 1 | Select a pending fee and click "Pay Now". | Amount: 5000 | Gateway (Razorpay/Stripe) interface should appear. |
| | | | Step 2 | Complete the transaction. | | Status should update to "COMPLETED" and a receipt number should be generated. |
| **TC21_Parent_Medical_Info_View** | This test case checks if parents can view their child's medical alerts. | P2 | Step 1 | Navigate to "Medical Records" in Parent portal. | | Allergies and emergency contacts should be correctly displayed. |
| **TC22_Teacher_Assignment_Post** | This test case verifies that teachers can post assignments with attachments. | P1 | Step 1 | Navigate to "Assignments" > "Create New". | | Assignment form with file upload should be visible. |
| | | | Step 2 | Upload a PDF and click "Post to Class". | File: HW.pdf | Assignment should appear on student dashboards for that class. |
| **TC23_Student_Assignment_Submission** | This test case ensures students can submit their work online. | P1 | Step 1 | Open a pending assignment and upload the solution. | | File should be uploaded successfully. |
| | | | Step 2 | Click "Submit". | | Status should change to "SUBMITTED" with a timestamp. |
| **TC24_Teacher_Grade_Assignment** | This test case validates the grading of submitted assignments. | P1 | Step 1 | Teacher selects a student submission and enters a mark. | Score: 18/20 | Student should receive a notification with the grade. |
| **TC25_Communication_Notice_Exam** | This test case verifies the posting of high-priority exam notices. | P1 | Step 1 | Create a notice with Type "EXAM" and Priority "HIGH". | Title: "Midterm Schedule" | Notice should be pinned to the top of the notice board with a distinct UI highlight. |
| **TC26_Complaint_Parent_File** | This test case ensures parents can file formal complaints. | P2 | Step 1 | Fill in the complaint form and select severity "HIGH". | Category: Transport | A unique tracking ID should be provided to the parent. |
| **TC27_Admin_Resolve_Complaint** | This test case validates the complaint resolution workflow. | P2 | Step 1 | Admin marks a complaint as "RESOLVED" and adds a note. | Note: "Issue fixed" | Parent should see the status update in their portal. |
| **TC28_Achievement_Student_Sports** | This test case verifies that student achievements can be recorded. | P2 | Step 1 | Navigate to Student Profile > Achievements > Add. | Title: "100m Dash Gold" | Achievement should show up in the student's digital portfolio. |
| **TC29_Medical_Allergy_Update** | This test case checks updating student medical records. | P2 | Step 1 | Update "Allergies" field in Medical Info. | Entry: "Peanuts" | System should trigger an alert for class teachers in the dashboard. |
| **TC30_AI_Principal_Insight** | This test case validates AI-driven performance trends for the Principal. | P1 | Step 1 | Ask AI about "Overall school performance this term". | | AI should generate a summary based on attendance and grade averages. |
| **TC31_AI_Timetable_Suggestion** | This test case checks if AI can suggest timetable improvements. | P2 | Step 1 | Request AI to "Optimize class 10-A timetable". | | AI should suggest shifts to resolve teacher load conflicts. |
| **TC32_Timetable_Conflict_Check** | This test case ensures the system prevents teacher over-scheduling. | P1 | Step 1 | Try to assign a teacher to two different classes at the same period. | Period 1, Day 1 | System should block the action with "Teacher Conflict" error. |
| **TC33_Timetable_Export_PDF** | This test case verifies PDF export for schedules. | P1 | Step 1 | Click "Export to PDF" on the Timetable view. | | A clear, formatted PDF of the weekly schedule should be downloaded. |
| **TC34_Audit_Logs_Monitoring** | This test case ensures critical actions are logged for security. | P0 | Step 1 | Change a student's grade as a Teacher. | | Audit log should record the User ID, Action, and Previous/New Value. |
| **TC35_Auth_Session_Timeout** | This test case checks automatic logout for inactive sessions. | P2 | Step 1 | Leave the application idle for the specified timeout period. | Timeout: 30 mins | System should redirect to the login page with "Session Expired". |
| **TC36_File_Upload_Limit** | This test case validates file size restrictions for uploads. | P2 | Step 1 | Try to upload a file larger than the configured limit. | Size: 10MB | System should show "File too large (Max 5MB)" error. |
| **TC37_Auth_Password_Reset** | This test case verifies the password recovery workflow. | P1 | Step 1 | Click "Forgot Password" and enter email. | | Password reset link should be sent to the registered email. |
| **TC38_Notification_Mark_As_Read** | This test case validates notification management. | P2 | Step 1 | Click on a new notification in the bell icon. | | Notification should be marked as read and the counter should decrement. |
| **TC39_Search_Global_Student** | This test case ensures the global search works across modules. | P2 | Step 1 | Enter a student name in the global search bar. | Name: "Rahul" | Results should show the student's profile link and quick actions. |
| **TC40_System_Backup_Verification** | This test case validates that manual database backups work. | P0 | Step 1 | Trigger a manual database export from the Admin panel. | | A valid SQL/JSON backup file should be generated for download. |

---

### 📝 Instructions for Word Document:
To convert this to a Word document:
1.  **Copy** the table above.
2.  **Paste** it into a new Microsoft Word document.
3.  Word will automatically format it as a table. Use "AutoFit to Window" for better layout.

