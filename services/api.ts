export const BASE_URL = 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

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

export const notificationAPI = {
    getAll: async (filters?: { category?: string; isRead?: boolean; limit?: number; offset?: number }) => {
        const params = new URLSearchParams();
        if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
        if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead));
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.offset) params.append('offset', String(filters.offset));
        const response = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
            headers: getHeaders(),
        });
        return response.json();
    },
    getUnreadCount: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
            headers: getHeaders(),
        });
        return response.json();
    },
    markRead: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: getHeaders(),
        });
        return response.json();
    },
    markAllRead: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: getHeaders(),
        });
        return response.json();
    },
    send: async (data: {
        targetType: 'ALL_STUDENTS' | 'SPECIFIC_STUDENT' | 'ALL_TEACHERS' | 'SPECIFIC_TEACHER';
        targetStudentId?: string;
        targetTeacherId?: string;
        title: string;
        message: string;
        category?: string;
        priority?: string;
        iconEmoji?: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/notifications/send`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },
    delete: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.json();
    },
    getSent: async (limit?: number, offset?: number) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', String(limit));
        if (offset) params.append('offset', String(offset));
        const response = await fetch(`${API_BASE_URL}/notifications/sent?${params.toString()}`, {
            headers: getHeaders(),
        });
        return response.json();
    },
    getTeachers: async () => {
        const response = await fetch(`${API_BASE_URL}/teachers`, {
            headers: getHeaders(),
        });
        return response.json();
    },
};

// ============================================
// FEE PAYMENT API
// ============================================
export const feeAPI = {
    /** Get student's fee records and summary */
    getStudentFees: async (studentId: string) => {
        const response = await fetch(`${API_BASE_URL}/fees/student/${studentId}`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    /** Initiate payment — creates gateway order */
    initiatePayment: async (data: {
        studentId: string;
        feeRecordIds: string[];
        paymentMethod: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/fees/initiate-payment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },

    /** Verify Razorpay payment signature and mark as complete */
    verifyPayment: async (data: {
        orderId: string;
        paymentId: string;
        signature: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/fees/verify-payment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },

    /** Get payment history for a student */
    getPaymentHistory: async (studentId: string) => {
        const response = await fetch(`${API_BASE_URL}/fees/payment-history/${studentId}`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    /** Admin: Create a fee structure */
    createFeeStructure: async (data: {
        feeType: string;
        class: string;
        academicYear: string;
        amount: number;
        dueDate: string;
        lateFee?: number;
        discount?: number;
        description?: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/fees/structure`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },

    /** Admin: List all fee structures */
    listFeeStructures: async () => {
        const response = await fetch(`${API_BASE_URL}/fees/structures`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    /** Admin: Get fee collection summary */
    getFeeSummary: async (academicYear = '2025-26') => {
        const response = await fetch(`${API_BASE_URL}/fees/summary?academicYear=${academicYear}`, {
            headers: getHeaders(),
        });
        return response.json();
    },
};

// ============================================
// ASSIGNMENT MANAGEMENT API
// ============================================
export const assignmentAPI = {
    /** Teacher: Create assignment */
    createAssignment: async (formData: FormData) => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/assignments`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });
        return response.json();
    },

    /** Teacher: Get my assignments */
    getTeacherAssignments: async () => {
        const response = await fetch(`${API_BASE_URL}/assignments/teacher`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    /** Student: Get my assignments */
    getStudentAssignments: async () => {
        const response = await fetch(`${API_BASE_URL}/assignments/student`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    /** Student: Submit assignment */
    submitAssignment: async (submissionId: string, formData: FormData) => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/assignments/submit/${submissionId}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });
        return response.json();
    },

    /** Teacher: Get assignment submissions */
    getAssignmentSubmissions: async (assignmentId: string) => {
        const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submissions`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    /** Teacher: Grade submission */
    gradeSubmission: async (
        submissionId: string,
        data: { marksObtained: number; feedback?: string }
    ) => {
        const response = await fetch(`${API_BASE_URL}/assignments/grade/${submissionId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    },

    /** Teacher: Delete assignment */
    deleteAssignment: async (assignmentId: string) => {
        const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.json();
    },
};

// ============================================
// ADMIN MANAGEMENT API
// ============================================
export const adminAPI = {
    /** Admin: Get all students */
    getAllStudents: async (filters?: { class?: string; section?: string; status?: string; search?: string; limit?: string }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }
        // Force high limit to fetch all students at once for the Admin dashboard view
        if (!params.has('limit')) {
            params.append('limit', '1000');
        }

        const response = await fetch(`${API_BASE_URL}/students?${params.toString()}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        return response.json();
    },

    /** Admin: Get detailed student profile */
    getStudentById: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch student details');
        return response.json();
    },

    /** Admin: Create new student */
    createStudent: async (data: {
        admissionNo: string;
        firstName: string;
        lastName: string;
        class: string;
        section: string;
        rollNo: number;
        parentName: string;
        parentPhone: string;
        parentEmail?: string;
        gender?: string;
        dateOfBirth?: string;
        bloodGroup?: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create student');
        return response.json();
    },

    /** Admin: Delete student */
    deleteStudent: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete student');
        return response.json();
    }
};

// ============================================
// TRANSPORT MANAGEMENT API
// ============================================
export const transportAPI = {
    /** Live Tracking */
    getPositions: async () => {
        const response = await fetch(`${API_BASE_URL}/transport/positions`, { headers: getHeaders() });
        return response.json();
    },

    /** Dashboard stats */
    getDashboard: async () => {
        const response = await fetch(`${API_BASE_URL}/transport/dashboard`, { headers: getHeaders() });
        return response.json();
    },

    /** Vehicles */
    getVehicles: async () => {
        const response = await fetch(`${API_BASE_URL}/transport/vehicles`, { headers: getHeaders() });
        return response.json();
    },
    createVehicle: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/transport/vehicles`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
        });
        return response.json();
    },
    updateVehicle: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/transport/vehicles/${id}`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
        });
        return response.json();
    },
    deleteVehicle: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/transport/vehicles/${id}`, {
            method: 'DELETE', headers: getHeaders(),
        });
        return response.json();
    },

    /** Drivers */
    getDrivers: async () => {
        const response = await fetch(`${API_BASE_URL}/transport/drivers`, { headers: getHeaders() });
        return response.json();
    },
    createDriver: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/transport/drivers`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
        });
        return response.json();
    },

    /** Routes */
    getRoutes: async () => {
        const response = await fetch(`${API_BASE_URL}/transport/routes`, { headers: getHeaders() });
        return response.json();
    },
    createRoute: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/transport/routes`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
        });
        return response.json();
    },
    updateRoute: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/transport/routes/${id}`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
        });
        return response.json();
    },
    deleteRoute: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/transport/routes/${id}`, {
            method: 'DELETE', headers: getHeaders(),
        });
        return response.json();
    },

    /** Student assignment */
    assignStudent: async (data: { studentId: string; routeId: string; stopId: string; feeAmount?: number }) => {
        const response = await fetch(`${API_BASE_URL}/transport/assign-student`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
        });
        return response.json();
    },
    unassignStudent: async (studentId: string) => {
        const response = await fetch(`${API_BASE_URL}/transport/unassign-student/${studentId}`, {
            method: 'DELETE', headers: getHeaders(),
        });
        return response.json();
    },

    /** Boarding logs */
    getBoardingLogs: async (filters?: { date?: string; vehicleId?: string; limit?: number }) => {
        const params = new URLSearchParams();
        if (filters?.date) params.append('date', filters.date);
        if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId);
        if (filters?.limit) params.append('limit', String(filters.limit));
        const response = await fetch(`${API_BASE_URL}/transport/boarding-logs?${params.toString()}`, {
            headers: getHeaders(),
        });
        return response.json();
    },
    logBoarding: async (data: { studentId: string; vehicleId: string; stopId?: string; type: string; scanMethod?: string }) => {
        const response = await fetch(`${API_BASE_URL}/transport/boarding-log`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
        });
        return response.json();
    },

    /** Student transport (parent view) */
    getStudentTransport: async (studentId: string) => {
        const response = await fetch(`${API_BASE_URL}/transport/student/${studentId}`, {
            headers: getHeaders(),
        });
        return response.json();
    },
};
