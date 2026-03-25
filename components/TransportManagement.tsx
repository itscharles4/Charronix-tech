import React, { useState, useEffect } from 'react';
import {
    Bus, Truck, MapPin, Users, Shield, Fuel, Gauge, Clock,
    ChevronDown, UserCheck, QrCode, AlertTriangle, CheckCircle2,
    Loader2, RefreshCw, Phone, Navigation, Route as RouteIcon, Map as MapIcon
} from 'lucide-react';
import { transportAPI } from '../services/api';
import { LiveTrackingMap } from './LiveTrackingMap';

interface TransportManagementProps {
    isDarkMode: boolean;
}

const TransportManagement: React.FC<TransportManagementProps> = ({ isDarkMode }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'routes' | 'boarding' | 'live'>('overview');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [boardingLogs, setBoardingLogs] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dashRes, vehRes, routeRes, logRes, driverRes] = await Promise.all([
                transportAPI.getDashboard(),
                transportAPI.getVehicles(),
                transportAPI.getRoutes(),
                transportAPI.getBoardingLogs({ limit: 50 }),
                transportAPI.getDrivers(),
            ]);
            if (dashRes.success) setDashboardData(dashRes.data);
            if (vehRes.success) setVehicles(vehRes.data);
            if (routeRes.success) setRoutes(routeRes.data);
            if (logRes.success) setBoardingLogs(logRes.data);
            if (driverRes.success) setDrivers(driverRes.data);
        } catch (err) {
            console.error('Failed to load transport data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
                <p className="font-semibold text-slate-500">Loading Transport Data...</p>
            </div>
        );
    }

    // Colors mapping to screenshots
    const colorMap = [
        'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
        'bg-cyan-500', 'bg-orange-500', 'bg-pink-500'
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total Vehicles', value: dashboardData?.totalVehicles || 0, icon: Bus, color: colorMap[0] },
                    { label: 'Active Vehicles', value: dashboardData?.activeVehicles || 0, icon: CheckCircle2, color: colorMap[1] },
                    { label: 'Active Routes', value: dashboardData?.totalRoutes || 0, icon: RouteIcon, color: colorMap[2] },
                    { label: 'Students Using', value: dashboardData?.totalStudentsTransport || 0, icon: Users, color: colorMap[3] },
                    { label: 'Total Drivers', value: dashboardData?.totalDrivers || 0, icon: UserCheck, color: colorMap[4] },
                    { label: "Today's Boardings", value: dashboardData?.todayBoardings || 0, icon: QrCode, color: colorMap[5] },
                ].map((stat, i) => (
                    <div key={i} className={`${stat.color} rounded-2xl p-4 text-white hover:-translate-y-1 transition-transform`}>
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-8">
                            <stat.icon size={16} />
                        </div>
                        <h3 className="text-4xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-xs font-semibold uppercase opacity-90">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <QrCode size={20} className="text-indigo-600" />
                        Today's Boarding Activity
                    </h3>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                        {dashboardData?.todayBoardings || 0} EVENTS
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold text-left">
                            <tr>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Class</th>
                                <th className="px-4 py-3">Vehicle</th>
                                <th className="px-4 py-3">Stop</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Method</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(dashboardData?.recentBoardings?.length || 0) === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                                        <Bus size={32} className="mx-auto mb-2 opacity-30" />
                                        NO BOARDING EVENTS TODAY
                                    </td>
                                </tr>
                            ) : (
                                dashboardData?.recentBoardings.map((log: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">{log.student?.firstName} {log.student?.lastName}</td>
                                        <td className="px-4 py-3">{log.student?.class}-{log.student?.section}</td>
                                        <td className="px-4 py-3 font-medium">{log.vehicle?.registrationNo}</td>
                                        <td className="px-4 py-3">{log.stop?.stopName || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${log.type === 'BOARDING' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {log.type === 'BOARDING' ? '🟢 BOARDED' : '🔵 DROPPED'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 text-[10px] uppercase font-black ${log.scanMethod === 'QR_CODE' ? 'text-purple-600' : 'text-amber-500'}`}>
                                                {log.scanMethod === 'QR_CODE' ? <><QrCode size={12} /> QR</> : <><UserCheck size={12} /> MANUAL</>}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderFleet = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((v: any) => (
                    <div key={v.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-3 items-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${v.type === 'BUS' ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                                    {v.type === 'BUS' ? <Bus size={24} /> : <Truck size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 uppercase tracking-wide">{v.registrationNo}</h4>
                                    <p className="text-xs text-slate-500 uppercase">{v.manufacturer} {v.model} • {v.year}</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold tracking-wider">
                                {v.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">CAPACITY</p>
                                <p className="font-semibold text-slate-700 flex items-center gap-2"><Users size={16} className="text-indigo-400" /> {v.capacity}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">FUEL TYPE</p>
                                <p className="font-semibold text-slate-700 flex items-center gap-2"><Fuel size={16} className="text-amber-500" /> {v.fuelType}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ODOMETER</p>
                                <p className="font-semibold text-slate-700 flex items-center gap-2"><Gauge size={16} className="text-emerald-500" /> {(v.odometerReading / 1000).toFixed(1)}k</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">GPS DEVICE</p>
                                <p className="font-semibold text-slate-700 flex items-center gap-2"><Navigation size={16} className="text-purple-500" /> {v.gpsDeviceId || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Insurance</span>
                                <span className="text-slate-700 font-semibold">{v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Fitness</span>
                                <span className="text-slate-700 font-semibold">{v.fitnessExpiry ? new Date(v.fitnessExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Permit</span>
                                <span className="text-slate-700 font-semibold">{v.permitExpiry ? new Date(v.permitExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</span>
                            </div>
                        </div>

                        {v.driver && (
                            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-indigo-500 text-white flex justify-center items-center font-bold">{v.driver.name[0]}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{v.driver.name}</p>
                                    <p className="text-[10px] uppercase text-slate-500">DRIVER • {v.driver.phone}</p>
                                </div>
                                {v.driver.policeVerified && <Shield size={16} className="text-emerald-500" />}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck size={20} className="text-orange-500" />
                        Driver Registry
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold text-left tracking-wider">
                            <tr>
                                <th className="px-4 py-3">DRIVER NAME</th>
                                <th className="px-4 py-3">PHONE</th>
                                <th className="px-4 py-3">LICENSE NO</th>
                                <th className="px-4 py-3">LICENSE EXPIRY</th>
                                <th className="px-4 py-3">MEDICAL EXPIRY</th>
                                <th className="px-4 py-3 text-center">VERIFIED</th>
                                <th className="px-4 py-3">VEHICLES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {drivers.map((d: any) => (
                                <tr key={d.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4 font-semibold text-slate-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center text-[10px]">{d.name[0]}</div>
                                        {d.name}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 flex items-center gap-1"><Phone size={14} className="text-slate-400" /> {d.phone}</td>
                                    <td className="px-4 py-4 font-mono text-xs">{d.licenseNo}</td>
                                    <td className="px-4 py-4 font-semibold">{new Date(d.licenseExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                                    <td className="px-4 py-4 font-semibold">{new Date(d.medicalExpiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                                    <td className="px-4 py-4 text-center">{d.policeVerified ? <Shield size={16} className="text-emerald-500 mx-auto" /> : <AlertTriangle size={16} className="text-red-400 mx-auto" />}</td>
                                    <td className="px-4 py-4 text-slate-500">{d.vehicles?.map((v: any) => v.registrationNo).join(', ') || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderRoutes = () => (
        <div className="space-y-4">
            {routes.map((route: any) => {
                const isExpanded = expandedRoute === route.id;
                const studentCount = route.studentTransports?.length || 0;

                return (
                    <div key={route.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <button
                            onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                                    <RouteIcon size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-800 text-lg">{route.name}</h4>
                                    <p className="text-xs text-slate-500">{route.stops?.length || 0} stops • {studentCount} students</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                {route.vehicle && (
                                    <div className="text-right hidden md:block">
                                        <p className="font-bold text-slate-700">{route.vehicle.registrationNo}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{route.vehicle.driver?.name || 'NO DRIVER'}</p>
                                    </div>
                                )}
                                <div className="w-20 hidden sm:block">
                                    <div className="flex justify-between text-[10px] text-emerald-500 font-bold mb-1">
                                        <span>{route.vehicle ? Math.round((studentCount / route.vehicle.capacity) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${route.vehicle ? Math.min((studentCount / route.vehicle.capacity) * 100, 100) : 0}%` }} />
                                    </div>
                                </div>
                                <ChevronDown size={20} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="border-t border-slate-100 p-6">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">STOP SEQUENCE</h5>
                                <div className="space-y-0">
                                    {(route.stops || []).map((stop: any, i: number) => {
                                        const stopsAtStop = route.studentTransports?.filter((st: any) => st.stop?.stopName === stop.stopName) || [];
                                        return (
                                            <div key={stop.id} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    {i < route.stops.length - 1 && <div className="w-px h-12 bg-indigo-100" />}
                                                </div>
                                                <div className="pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-800">{stop.stopName}</p>
                                                        {stop.landmark && <span className="text-[10px] text-slate-400 font-medium">(Near {stop.landmark})</span>}
                                                    </div>
                                                    <div className="flex gap-3 mt-1 items-center">
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> AM: {stop.morningArrival || '—'}</span>
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> PM: {stop.eveningArrival || '—'}</span>
                                                        {stopsAtStop.length > 0 && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold text-[9px]">{stopsAtStop.length} students</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderBoarding = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <QrCode size={20} className="text-indigo-600" />
                    Boarding History
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] tracking-wider uppercase font-bold text-left">
                        <tr>
                            <th className="px-4 py-3">Date & Time</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Class</th>
                            <th className="px-4 py-3">Vehicle</th>
                            <th className="px-4 py-3">Stop</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Method</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {boardingLogs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <QrCode size={32} className="mx-auto mb-2 opacity-30" />
                                    NO BOARDING LOGS FOUND
                                </td>
                            </tr>
                        ) : (
                            boardingLogs.map((log: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-xs">
                                        <p className="font-semibold text-slate-700">{new Date(log.timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</p>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">{log.student?.firstName} {log.student?.lastName}</td>
                                    <td className="px-4 py-3">{log.student?.class}-{log.student?.section}</td>
                                    <td className="px-4 py-3 font-medium">{log.vehicle?.registrationNo}</td>
                                    <td className="px-4 py-3">{log.stop?.stopName || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${log.type === 'BOARDING' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {log.type === 'BOARDING' ? '🟢 BOARDED' : '🔵 DROPPED'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        {log.scanMethod === 'QR_CODE' ? <span className="text-purple-600 flex items-center gap-1"><QrCode size={12} /> QR</span> : <span className="text-slate-500 flex items-center gap-1"><UserCheck size={12} /> MANUAL</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen">
            <div className="bg-slate-900 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                        <Bus size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Transport Management</h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">Fleet tracking • Route planning • Student boarding</p>
                    </div>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100 flex overflow-x-auto gap-1">
                {[
                    { id: 'overview', label: 'Overview', icon: Gauge },
                    { id: 'fleet', label: 'Fleet & Drivers', icon: Bus },
                    { id: 'routes', label: 'Routes', icon: MapPin },
                    { id: 'boarding', label: 'Boarding Log', icon: QrCode },
                    { id: 'live', label: 'Live Tracking', icon: MapIcon },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex whitespace-nowrap items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'fleet' && renderFleet()}
            {activeTab === 'routes' && renderRoutes()}
            {activeTab === 'boarding' && renderBoarding()}
            {activeTab === 'live' && <LiveTrackingMap />}
        </div>
    );
};

export default TransportManagement;
