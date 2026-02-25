
const API_BASE_URL = 'http://localhost:5000/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const authAPI = {
    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch auth profile');
        }
        return response.json();
    },
};

export const studentAPI = {
    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/students/me`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        return response.json();
    },
    getTimetable: async () => {
        const response = await fetch(`${API_BASE_URL}/timetable/my-timetable`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch timetable');
        }
        return response.json();
    },
    getAttendance: async (year: number, month: number) => {
        const response = await fetch(`${API_BASE_URL}/students/me/attendance?year=${year}&month=${month}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch attendance');
        }
        return response.json();
    },
    getNotifications: async (limit: number = 50) => {
        const response = await fetch(`${API_BASE_URL}/students/me/notifications?limit=${limit}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }
        return response.json();
    },
    getGrades: async (term?: string, academicYear?: string) => {
        const params = new URLSearchParams();
        if (term) params.append('term', term);
        if (academicYear) params.append('academicYear', academicYear);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/grades/my${query}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch grades');
        return response.json();
    },
    get: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${endpoint}`);
        }
        return response.json();
    },
};

export const teacherAPI = {
    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/teachers/me`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch teacher profile');
        }
        return response.json();
    },
    getStudents: async (cls?: string, section?: string) => {
        const params = cls && section ? `?class=${cls}&section=${section}` : '';
        const response = await fetch(`${API_BASE_URL}/teachers/my-students${params}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        return response.json();
    },
    markAttendance: async (data: { date: string; records: Array<{ studentId: string; status: string; remarks?: string }> }) => {
        const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },
    uploadMarks: async (data: { subject: string; term: string; academicYear: string; maxScore: number; records: Array<{ studentId: string; score: number }> }) => {
        const response = await fetch(`${API_BASE_URL}/grades/bulk`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },
};

export const parentAPI = {
    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/parents/me`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch parent profile');
        }
        return response.json();
    },
    getChildStats: async (studentId: string) => {
        const response = await fetch(`${API_BASE_URL}/parents/child/${studentId}/stats`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch child stats');
        }
        return response.json();
    },
};

export const complaintAPI = {
    create: async (data: { studentId: string; severity: string; description: string }) => {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },
    getMyRaised: async () => {
        const response = await fetch(`${API_BASE_URL}/complaints/my-raised`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch complaints');
        }
        return response.json();
    },
    getByStudent: async (studentId: string) => {
        const response = await fetch(`${API_BASE_URL}/complaints/student/${studentId}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch student complaints');
        }
        return response.json();
    },
};
