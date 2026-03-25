import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { transportAPI } from '../services/api';

const BANGALORE = { lat: 12.9716, lng: 77.5946 };
const BUS_COLORS = ['#6D28D9', '#065F46', '#92400E', '#B45309', '#BE185D'];

export function LiveTrackingMap() {
    const [buses, setBuses] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => {
        const load = () => {
            transportAPI.getPositions().then((res: any) => {
                if (res.success) setBuses(res.data);
            }).catch(console.error);
        };
        load();
        const t = setInterval(load, 2000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[600px] animate-fadeIn">
            {/* Sidebar */}
            <div className="w-full lg:w-72 flex flex-col gap-3 overflow-y-auto pr-2 custom-scroll">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Live Fleet Status</h3>
                {buses.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        Fetching locations...
                    </div>
                )}
                {buses.map((bus, i) => {
                    const isSelected = selected?.id === bus.id;
                    const color = BUS_COLORS[i % BUS_COLORS.length];
                    return (
                        <div
                            key={bus.id}
                            onClick={() => setSelected(bus)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all ${isSelected
                                ? 'bg-slate-50 dark:bg-slate-800 shadow-md transform scale-[1.02]'
                                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm'
                                }`}
                            style={{ border: isSelected ? `2px solid ${color}` : '1px solid var(--tw-prose-hr, #e5e7eb)' }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                    {bus.registrationNo}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    {bus.speed} km/h
                                </div>
                            </div>
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">{bus.routeName}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 flex items-center justify-between">
                                <span>Driver: {bus.driverName}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Map */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative">
                <Map
                    defaultCenter={BANGALORE}
                    defaultZoom={12}
                    mapId="DEMO_MAP_ID"
                    gestureHandling={'greedy'}
                >
                    {buses.map((bus, i) => (
                        <AdvancedMarker
                            key={bus.id}
                            position={{ lat: bus.lat, lng: bus.lng }}
                            onClick={() => setSelected(bus)}
                        >
                            <Pin
                                background={BUS_COLORS[i % BUS_COLORS.length]}
                                borderColor={'white'}
                                glyphColor={'white'}
                            />
                        </AdvancedMarker>
                    ))}
                    {selected && (
                        <InfoWindow
                            position={{ lat: selected.lat, lng: selected.lng }}
                            onCloseClick={() => setSelected(null)}
                            pixelOffset={[0, -10]}
                        >
                            <div className="p-1 px-2 text-slate-800">
                                <div className="font-black text-sm mb-1">{selected.registrationNo}</div>
                                <div className="text-xs font-bold text-slate-500 mb-2">{selected.routeName}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                    <span className="text-slate-400 uppercase font-bold text-[9px]">Driver</span>
                                    <span className="font-medium text-right">{selected.driverName}</span>
                                    <span className="text-slate-400 uppercase font-bold text-[9px]">Speed</span>
                                    <span className="font-medium text-emerald-600 text-right">{selected.speed} km/h</span>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </div>
    );
}
