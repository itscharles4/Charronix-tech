import React, { useState, useEffect, useRef } from 'react';
import {
    QrCode, Users, CheckCircle2, AlertTriangle, Search,
    ArrowUpCircle, ArrowDownCircle, Loader2, ScanLine
} from 'lucide-react';
import { transportAPI } from '../services/api';

interface BoardingScannerProps {
    routes: any[];
    vehicles: any[];
}

export const BoardingScanner: React.FC<BoardingScannerProps> = ({ routes, vehicles }) => {
    const [mode, setMode] = useState<'manual' | 'qr'>('manual');
    const [boardingType, setBoardingType] = useState<'BOARDING' | 'DROPPING'>('BOARDING');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [lastAction, setLastAction] = useState<{ name: string; type: string; success: boolean } | null>(null);
    const [loadingStudent, setLoadingStudent] = useState<string | null>(null);
    const [qrInput, setQrInput] = useState('');
    const [qrError, setQrError] = useState('');
    const qrInputRef = useRef<HTMLInputElement>(null);

    // Load all assigned students from all routes
    useEffect(() => {
        const allStudents: any[] = [];
        for (const route of routes) {
            for (const st of (route.studentTransports || [])) {
                if (st.student) {
                    allStudents.push({
                        ...st.student,
                        routeId: route.id,
                        routeName: route.name,
                        stopId: st.stopId || st.stop?.id,
                        stopName: st.stop?.stopName || '—',
                        vehicleId: route.vehicle?.id,
                        vehicleReg: route.vehicle?.registrationNo,
                        qrCode: st.qrCode,
                    });
                }
            }
        }
        setStudents(allStudents);
        setFilteredStudents(allStudents);
    }, [routes]);

    useEffect(() => {
        const q = searchQuery.toLowerCase();
        if (!q) {
            setFilteredStudents(students);
            return;
        }
        setFilteredStudents(students.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
            s.admissionNo?.toLowerCase().includes(q) ||
            s.class?.toLowerCase().includes(q) ||
            s.routeName?.toLowerCase().includes(q)
        ));
    }, [searchQuery, students]);

    // Auto-focus QR input when in QR mode
    useEffect(() => {
        if (mode === 'qr') {
            setTimeout(() => qrInputRef.current?.focus(), 200);
        }
    }, [mode]);

    const markBoarding = async (student: any, method: 'QR_CODE' | 'MANUAL') => {
        const vehicleId = selectedVehicle || student.vehicleId;
        if (!vehicleId) {
            setLastAction({ name: student.firstName, type: 'ERROR', success: false });
            return;
        }
        setLoadingStudent(student.id);
        try {
            const res = await transportAPI.logBoarding({
                studentId: student.id,
                vehicleId,
                stopId: student.stopId,
                type: boardingType,
                scanMethod: method,
            });
            const success = res.success || res.data;
            setLastAction({ name: `${student.firstName} ${student.lastName}`, type: boardingType, success: !!success });
        } catch {
            setLastAction({ name: `${student.firstName} ${student.lastName}`, type: boardingType, success: false });
        } finally {
            setLoadingStudent(null);
            setTimeout(() => setLastAction(null), 3500);
        }
    };

    const handleQrSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setQrError('');
        const code = qrInput.trim();
        if (!code) return;

        const student = students.find(s => s.qrCode === code || s.admissionNo === code);
        if (!student) {
            setQrError(`QR Code / ID "${code}" not found in any route.`);
            setQrInput('');
            qrInputRef.current?.focus();
            return;
        }
        setQrInput('');
        qrInputRef.current?.focus();
        await markBoarding(student, 'QR_CODE');
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-slate-900 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-white font-black text-xl flex items-center gap-2">
                        <ScanLine size={22} className="text-indigo-400" />
                        Boarding Scanner
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Mark students as boarded or dropped from school transport</p>
                </div>
                {/* Mode selector */}
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setMode('manual')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${mode === 'manual' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <Users size={15} /> Manual
                    </button>
                    <button onClick={() => setMode('qr')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${mode === 'qr' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <QrCode size={15} /> QR Scan
                    </button>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Boarding type toggle */}
                <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-100 gap-1">
                    <button onClick={() => setBoardingType('BOARDING')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${boardingType === 'BOARDING' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <ArrowUpCircle size={15} /> Boarding
                    </button>
                    <button onClick={() => setBoardingType('DROPPING')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${boardingType === 'DROPPING' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <ArrowDownCircle size={15} /> Dropping
                    </button>
                </div>

                {/* Vehicle selector */}
                <select
                    value={selectedVehicle}
                    onChange={e => setSelectedVehicle(e.target.value)}
                    className="px-4 py-2.5 rounded-full border border-slate-200 text-sm font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                >
                    <option value="">🚌 Auto-detect vehicle from route</option>
                    {vehicles.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.registrationNo} ({v.type})</option>
                    ))}
                </select>
            </div>

            {/* Status Feedback Banner */}
            {lastAction && (
                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold animate-fadeIn ${lastAction.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    {lastAction.success
                        ? <><CheckCircle2 size={18} className="text-emerald-600" /> {lastAction.name} marked as <span className="uppercase">{lastAction.type === 'BOARDING' ? '🟢 BOARDED' : '🔵 DROPPED'}</span> successfully!</>
                        : <><AlertTriangle size={18} className="text-red-500" /> Failed to log {lastAction.name}. Please check vehicle assignment and try again.</>
                    }
                </div>
            )}

            {/* QR Scan Mode */}
            {mode === 'qr' && (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <QrCode size={48} className="text-indigo-500" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-black text-slate-800">Scan Student QR Code</h3>
                        <p className="text-slate-400 text-sm mt-1">Point your barcode scanner at the student's ID card, or type the admission number</p>
                    </div>
                    <form onSubmit={handleQrSubmit} className="w-full max-w-md flex gap-2">
                        <input
                            ref={qrInputRef}
                            value={qrInput}
                            onChange={e => setQrInput(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-300 focus:outline-none focus:border-indigo-500 text-center font-mono font-bold tracking-widest text-slate-800"
                            placeholder="Scan or type QR code / Admission No..."
                            autoComplete="off"
                        />
                        <button type="submit" className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            ✓ Mark
                        </button>
                    </form>
                    {qrError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 px-4 py-3 rounded-xl w-full max-w-md">
                            <AlertTriangle size={16} /> {qrError}
                        </div>
                    )}
                    <p className="text-[11px] text-slate-400 font-medium">
                        Currently marking as: <span className={`font-black uppercase ${boardingType === 'BOARDING' ? 'text-emerald-600' : 'text-blue-600'}`}>{boardingType === 'BOARDING' ? '🟢 BOARDED' : '🔵 DROPPED'}</span>
                    </p>
                </div>
            )}

            {/* Manual Mode */}
            {mode === 'manual' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Search bar */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                            <Search size={16} className="text-slate-400 shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                placeholder="Search by student name, admission no, class, or route..."
                            />
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider text-left">
                                <tr>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Class</th>
                                    <th className="px-4 py-3">Route</th>
                                    <th className="px-4 py-3">Stop</th>
                                    <th className="px-4 py-3">Vehicle</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                            <Users size={28} className="mx-auto mb-2 opacity-30" />
                                            {students.length === 0 ? 'No students are assigned to any route' : 'No students match your search'}
                                        </td>
                                    </tr>
                                ) : filteredStudents.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                                                {s.firstName?.[0]}{s.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{s.firstName} {s.lastName}</p>
                                                <p className="text-[10px] text-slate-400">{s.admissionNo}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{s.class}-{s.section}</td>
                                        <td className="px-4 py-3 text-indigo-600 font-semibold">{s.routeName}</td>
                                        <td className="px-4 py-3 text-slate-500">{s.stopName}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{s.vehicleReg || '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => markBoarding(s, 'MANUAL')}
                                                disabled={loadingStudent === s.id}
                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all hover:shadow-md active:scale-95 ${
                                                    loadingStudent === s.id
                                                        ? 'bg-slate-300 cursor-not-allowed'
                                                        : boardingType === 'BOARDING'
                                                            ? 'bg-emerald-500 hover:bg-emerald-600'
                                                            : 'bg-blue-500 hover:bg-blue-600'
                                                }`}
                                            >
                                                {loadingStudent === s.id
                                                    ? <Loader2 size={14} className="animate-spin" />
                                                    : boardingType === 'BOARDING' ? '🟢 Mark Boarded' : '🔵 Mark Dropped'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
