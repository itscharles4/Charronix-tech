const axios = require('axios');

async function verifyBackend() {
    console.log('🔍 Starting Backend Verification...');
    const BASE_URL = 'http://localhost:5000/api/v1';

    try {
        // 1. Login as a student (24BIT0612 - Aarav Desai, Class 10-A)
        console.log('🔑 Logging in as Aarav Desai (10-A)...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: '24BIT0612',
            password: 'Student@1234'
        });

        const token = loginRes.data.data.accessToken;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login successful');

        // 2. Test /students/me
        console.log('📄 Fetching student profile (/students/me)...');
        const profileRes = await axios.get(`${BASE_URL}/students/me`, { headers });
        const student = profileRes.data.data;

        console.log(`✅ Profile: ${student.firstName} ${student.lastName} (Class ${student.class}-${student.section})`);
        console.log(`✅ Grades Found: ${student.grades?.length || 0}`);
        console.log(`✅ Achievements Found: ${student.achievementCount || 0}`);
        console.log(`✅ Notices Found: ${student.notices?.length || 0}`);

        if ((student.grades?.length || 0) < 5) console.warn('⚠️ Warning: Expected at least 5 grades');
        if ((student.achievementCount || 0) < 2) console.warn('⚠️ Warning: Expected at least 2 achievements');

        // 3. Test /timetable/my-timetable
        console.log('⏰ Fetching timetable (/timetable/my-timetable)...');
        const timetableRes = await axios.get(`${BASE_URL}/timetable/my-timetable`, { headers });
        const timetable = timetableRes.data.data;

        console.log(`✅ Timetable Entries Found: ${timetable.length}`);

        const monP1 = timetable.find(e => e.dayOfWeek === 'MON' && e.period === 1);
        if (monP1) {
            console.log(`✅ Sample Entry: MON P1 -> ${monP1.subject} (${monP1.teacherName})`);
        } else {
            console.warn('⚠️ Warning: No MON P1 entry found for Class 10-A');
        }

        console.log('🎉 Backend Verification COMPLETE!');
    } catch (err) {
        console.error('❌ Verification FAILED:');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}

verifyBackend();
