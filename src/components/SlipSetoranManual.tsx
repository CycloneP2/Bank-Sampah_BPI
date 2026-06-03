import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import type { JenisSampah } from '@/types';
import { API_URL } from '@/lib/api';

export const SlipSetoranManual: React.FC = () => {
    const [wasteTypes, setWasteTypes] = useState<JenisSampah[]>([]);
    const [data, setData] = useState<Record<string, { harga: string, kg: string, sub: string }>>({});
    const [nama, setNama] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toLocaleDateString('id-ID'));

    useEffect(() => {
        // Fetch real data from API
        fetch(`${API_URL}/sampah.php`)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    setWasteTypes(res.data);
                    const initialData: Record<string, { harga: string, kg: string, sub: string }> = {};
                    res.data.forEach((sampah: JenisSampah) => {
                        initialData[sampah.id] = {
                            harga: sampah.hargaBeli.toString(),
                            kg: '',
                            sub: ''
                        };
                    });
                    setData(initialData);
                }
            })
            .catch(err => console.error('Gagal mengambil data sampah:', err));
    }, []);

    const handleInput = (id: string, field: 'kg', value: string) => {
        setData((prev) => {
            const current = prev[id] || { harga: '0', kg: '', sub: '' };
            const updated = { ...current, [field]: value };
            
            const h = parseFloat(updated.harga) || 0;
            const k = parseFloat(updated.kg) || 0;
            updated.sub = k > 0 ? (h * k).toString() : '';
            
            return { ...prev, [id]: updated };
        });
    };

    const calculateTotal = () => {
        let total = 0;
        Object.values(data).forEach(item => {
            total += parseFloat(item.sub) || 0;
        });
        return total > 0 ? total.toLocaleString('id-ID') : '0';
    };

    const renderHeader = (title: string) => (
        <div className="flex text-[9px] font-bold border-b border-black">
            <div className="flex-1 py-0.5 px-2 bg-black text-white uppercase tracking-wider">{title}</div>
            <div className="w-[45px] text-center py-0.5 border-l border-black bg-white text-black">Harga</div>
            <div className="w-[30px] text-center py-0.5 border-l border-black bg-white text-black">Kg</div>
            <div className="w-[60px] text-center py-0.5 border-l border-black bg-white text-black">Sub Total</div>
        </div>
    );

    const renderTable = (prefix: string, title: string) => {
        const items = wasteTypes
            .filter(s => s.id.startsWith(prefix))
            .sort((a, b) => a.id.localeCompare(b.id));
        
        return (
            <div className="border border-black flex flex-col w-full bg-white mb-2">
                {renderHeader(title)}
                {items.map((item, idx) => {
                    const rowData = data[item.id] || { harga: '0', kg: '', sub: '' };
                    return (
                        <div key={item.id} className="flex border-b border-black text-[8px] h-[17px] items-center">
                            <div className="w-5 text-center border-r border-black shrink-0 font-mono">{(idx + 1).toString().padStart(2, '0')}</div>
                            <div className="flex-1 px-1 border-r border-black truncate uppercase font-semibold">{item.nama}</div>
                            <div className="w-[45px] text-center border-r border-black font-mono">
                                {rowData.harga ? parseFloat(rowData.harga).toLocaleString('id-ID') : '0'}
                            </div>
                            <div className="w-[30px] border-r border-black h-full">
                                <input 
                                    type="text" 
                                    className="w-full h-full text-center outline-none bg-blue-50/10 font-bold focus:bg-yellow-50 print:bg-transparent" 
                                    value={rowData.kg}
                                    onChange={(e) => handleInput(item.id, 'kg', e.target.value)}
                                />
                            </div>
                            <div className="w-[60px] h-full flex items-center justify-end pr-1 font-mono font-bold bg-gray-50/50">
                                {rowData.sub ? parseFloat(rowData.sub).toLocaleString('id-ID') : ''}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSlip = (isDuplicate = false) => {
        return (
            <div className="bg-white p-4 w-full font-sans relative select-none">
                {/* Main Grid Layout - 3 Columns */}
                <div className="grid grid-cols-[1.1fr_1fr_1.1fr] gap-4">
                    
                    {/* Left Column - PLASTIK */}
                    <div className="flex flex-col">
                        {renderTable('PL', 'PLASTIK - PL')}
                    </div>

                    {/* Middle Column - Branding + KERTAS & LOGAM */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-center gap-3 mb-3 pt-1">
                            <img src="/logopat.png" className="w-10 h-10 object-contain" alt="Logo PAT" />
                            <div className="text-left">
                                <h2 className="text-sm font-black text-black leading-none uppercase">BANK SAMPAH</h2>
                                <h2 className="text-xs font-bold text-green-700 leading-none">BPI LESTARI</h2>
                            </div>
                        </div>

                        {renderTable('KK', 'KERTAS - KK')}
                        {renderTable('LO', 'LOGAM - LO')}
                    </div>

                    {/* Right Column - Info + KACA & LL + TOTAL */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                {isDuplicate ? 'ARSIP' : 'NASABAH'}
                            </span>
                            <h3 className="text-xs font-black text-black uppercase tracking-tight">SLIP SETORAN SAMPAH</h3>
                        </div>

                        {/* Info Section */}
                        <div className="border border-black mb-2 bg-white text-[8px]">
                            <div className="flex border-b border-black">
                                <div className="w-20 bg-gray-50 px-2 py-0.5 font-black border-r border-black uppercase text-[7px] flex items-center">Tanggal :</div>
                                <div className="flex-1 px-2 py-0.5">
                                    <input type="text" className="w-full outline-none font-bold bg-transparent" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex">
                                <div className="w-20 bg-gray-50 px-2 py-0.5 font-black border-r border-black uppercase text-[7px] flex items-center">Nama Nasabah :</div>
                                <div className="flex-1 px-2 py-0.5">
                                    <input type="text" className="w-full outline-none font-bold bg-transparent" value={nama} onChange={(e) => setNama(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {renderTable('KC', 'KACA - KC')}
                        {renderTable('LL', 'SAMPAH LAIN - LL')}

                        {/* Grand Total */}
                        <div className="mt-auto border-2 border-black flex items-center bg-white h-8">
                            <div className="flex-1 text-right pr-3 font-black uppercase text-[9px] tracking-wider bg-gray-50 h-full flex items-center justify-end">TOTAL RP</div>
                            <div className="w-[100px] h-full border-l-2 border-black flex items-center bg-white">
                                <input 
                                    type="text" 
                                    className="w-full text-center font-black text-base outline-none bg-transparent" 
                                    value={calculateTotal()}
                                    readOnly 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-2 border-t border-black pt-1 flex justify-between items-center px-1">
                    <p className="text-[7px] font-bold text-gray-800">
                        <span className="font-black italic">Bank Sampah BPI Lestari</span> Bukit Pamulang Indah C11/6. RT 001 RW 004 Pamulang Timur, Kota Tangerang Selatan - 
                        <span className="text-blue-700 ml-1">https://s.id/BPILestari</span>
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full max-w-[1240px] mx-auto bg-gray-100 p-6 min-h-screen">
            {/* Control Panel */}
            <div className="print:hidden bg-white p-6 rounded-3xl shadow-xl border border-gray-200 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-[#0F3D2E]">Cetak Slip Setoran</h1>
                    <p className="text-sm text-[#2A6B52] mt-1">Gunakan template dual-copy ini untuk bukti setoran manual nasabah.</p>
                </div>
                <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-2 bg-[#0F3D2E] hover:bg-black text-white px-8 py-3 rounded-2xl font-bold text-base transition-all shadow-lg active:scale-95"
                >
                    <Printer className="w-5 h-5" />
                    CETAK SEKARANG
                </button>
            </div>

            {/* Printable Area */}
            <div className="print-container bg-white p-6 shadow-2xl mx-auto w-full max-w-[900px] border border-gray-200 rounded-3xl flex flex-col gap-4">
                <style>{`
                    @media print {
                        @page { size: portrait; margin: 3mm; }
                        body * { visibility: hidden; }
                        .print-container, .print-container * { visibility: visible; }
                        .print-container { position: absolute; left: 0; top: 0; width: 100%; height: 100%; border: none !important; padding: 0 !important; margin: 0 !important; }
                    }
                `}</style>
                
                {renderSlip(false)}
                
                <div className="border-b-2 border-dashed border-gray-300 w-full my-1 relative print:my-0">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 border border-gray-300 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest print:hidden">
                        Garis Potong
                    </div>
                </div>

                {renderSlip(true)}
            </div>
        </div>
    );
};
