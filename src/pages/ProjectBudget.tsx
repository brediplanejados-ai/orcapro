import React, { useState } from 'react';
import type { Material, DirectLabor } from '../types';
import ThemeToggle from '../components/ThemeToggle';

const ProjectBudget: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([
        {
            id: '1',
            name: 'Painéis MDF 18mm',
            description: 'Branco Diamante - 2.75x1.85m',
            quantity: 4,
            unitValue: 380,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiJwCaHTLHybTq6ih-osk7d6gMLscU69F3kI-zZh7alsCqP_VpWraSDRaOb9a9FGSGp3V0OKZWJEeRfXCDBB8fJ89pgWrWbT0g1ySpX4eottyc_OiI3ThLmbibDkLVjP9tYp6zgvV4WCdIS0JycdJgP_8-C6tpA8q-0RmtgbAaS1ZJbTHSLhjumapnQeqjbcdLTB4UDYGcZn6jdhKUh7Lw3N4Ataxc2rgi8HcKAGknGOnH8NtxRptXh-qaK1J5k-sdAGaGmXSR6y37"
        },
        {
            id: '2',
            name: 'Ferragens e Acessórios',
            description: 'Dobradiças, Corrediças telescópicas',
            quantity: 24,
            unitValue: 12.5,
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZMHjsK66QNdRTmGLpx1dV89DdC2G2MWIIeJlfHIGrxKAvVusriBWGkKBvdaIy1e9we3_40u36ZJ9U94QIM5HulucI9zthBeZH89kQVEy_xdBSuH_z63OEUPpGVdPbb5_l3GB8s4UBK8v6mjT7jqzDrs91yV_-LMM_TcMhv5Gs-iTr7fhNLnufGaZfjSZkd8uURr2BVSLq2ErtSTee187jtiyNi24e7QdrBjH9IN5d1p4mPIslAFdL1zYF3P7g8pmeJvnU-Rp9ZvR3"
        },
    ]);

    const [labor, setLabor] = useState<DirectLabor[]>([
        { id: '1', role: 'Marceneiro Master', hourlyRate: 45, hoursPlanned: 32 },
        { id: '2', role: 'Auxiliar de Produção', hourlyRate: 20, hoursPlanned: 18 },
    ]);

    const [productionDays, setProductionDays] = useState(5);
    const [installationDays, setInstallationDays] = useState(2);
    const [taxesPerc, setTaxesPerc] = useState(8);
    const [profitPerc, setProfitPerc] = useState(35);

    const addMaterial = () => {
        const name = window.prompt('Nome do material:');
        if (!name) return;
        const valueStr = window.prompt('Valor unitário (R$):', '0');
        if (valueStr === null) return;

        const unitValue = parseFloat(valueStr.replace(/[R$\s.]/g, '').replace(',', '.'));
        if (isNaN(unitValue)) {
            alert('Valor inválido.');
            return;
        }

        setMaterials(prev => [...prev, {
            id: crypto.randomUUID(),
            name,
            description: 'Novo item',
            quantity: 1,
            unitValue,
            imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=150&q=80'
        }]);
    };

    const removeMaterial = (id: string) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    const addLabor = () => {
        const role = window.prompt('Mão de obra:');
        if (!role) return;
        const rateStr = window.prompt('Valor/Hora (R$):', '0');
        if (rateStr === null) return;

        const hourlyRate = parseFloat(rateStr.replace(/[R$\s.]/g, '').replace(',', '.'));
        if (isNaN(hourlyRate)) {
            alert('Valor inválido.');
            return;
        }

        setLabor(prev => [...prev, {
            id: crypto.randomUUID(),
            role,
            hourlyRate,
            hoursPlanned: 8
        }]);
    };

    const removeLabor = (id: string) => {
        setLabor(prev => prev.filter(l => l.id !== id));
    };

    const materialsSubtotal = materials.reduce((acc, curr) => acc + (curr.quantity * curr.unitValue), 0);
    const laborSubtotal = labor.reduce((acc, curr) => acc + (curr.hoursPlanned * curr.hourlyRate), 0);

    // Hypothetical structural cost per day (calculated from FixedCosts page usually)
    const structuralCostPerDay = 134.09; // Mocked for now
    const operationalSubtotal = (productionDays + installationDays) * structuralCostPerDay;

    const totalCost = materialsSubtotal + laborSubtotal + operationalSubtotal;

    // Selling Price Calculation: Cost / (1 - (Taxes + Profit))
    // Defensive check to avoid division by zero if taxes + profit >= 100%
    const totalPerc = (taxesPerc + profitPerc) / 100;
    const multiplier = totalPerc >= 1 ? 0.01 : 1 - totalPerc;
    const sellingPrice = totalCost / multiplier;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-background-dark/50">
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center p-4 justify-between max-w-6xl mx-auto w-full">
                    <div className="text-primary dark:text-gray-100 flex size-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all">
                        <span className="material-symbols-outlined font-black">arrow_back</span>
                    </div>
                    <h2 className="text-[#0e171b] dark:text-white text-xl font-black leading-tight tracking-tight flex-1 px-4 text-center">Novo Orçamento</h2>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>
                        <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-sm tracking-wide hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all">
                            SALVAR
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-44 px-4 pt-6">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

                        {/* Left Column: Materials and Labor */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Section 1: Materiais */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-black text-primary dark:text-white tracking-tight flex items-center gap-3">
                                        1. Materiais
                                        <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{materials.length}</span>
                                    </h2>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Subtotal Materiais</p>
                                        <span className="text-lg font-black text-primary px-2 py-1 rounded-lg">
                                            {formatCurrency(materialsSubtotal)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {materials.map((mat) => (
                                        <div key={mat.id} className="group flex flex-col gap-4 rounded-3xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-16 h-16 bg-center bg-no-repeat bg-cover rounded-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                                                    style={{ backgroundImage: `url("${mat.imageUrl}")` }}
                                                ></div>
                                                <div className="flex flex-col flex-1">
                                                    <p className="text-base font-black text-[#0e171b] dark:text-white leading-tight">{mat.name}</p>
                                                    <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-tighter">{mat.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <label className="flex flex-col flex-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Qtd (un)</p>
                                                    <input
                                                        className="w-full rounded-xl border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 px-4 py-3 text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                        type="number"
                                                        value={mat.quantity}
                                                        onChange={(e) => {
                                                            const newMats = materials.map(m => m.id === mat.id ? { ...m, quantity: Number(e.target.value) } : m);
                                                            setMaterials(newMats);
                                                        }}
                                                    />
                                                </label>
                                                <label className="flex flex-col flex-[2]">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Valor Unit (R$)</p>
                                                    <input
                                                        className="w-full rounded-xl border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 px-4 py-3 text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                        type="number"
                                                        value={mat.unitValue}
                                                        onChange={(e) => {
                                                            const newMats = materials.map(m => m.id === mat.id ? { ...m, unitValue: Number(e.target.value) } : m);
                                                            setMaterials(newMats);
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <button
                                                onClick={() => removeMaterial(mat.id)}
                                                className="w-full py-2.5 text-xs font-black text-red-500 flex items-center gap-2 justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/20"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                REMOVER
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addMaterial}
                                        className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 p-8 text-gray-400 hover:border-primary/50 hover:text-primary transition-all group min-h-[160px]"
                                    >
                                        <div className="size-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-3xl">add</span>
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest">Novo Material</span>
                                    </button>
                                </div>
                            </section>

                            {/* Section 2: Mão de Obra */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-black text-primary dark:text-white tracking-tight flex items-center gap-3">
                                        2. Mão de Obra
                                        <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{labor.length}</span>
                                    </h2>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Subtotal Mão de Obra</p>
                                        <span className="text-lg font-black text-primary px-2 py-1 rounded-lg">
                                            {formatCurrency(laborSubtotal)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {labor.map((lb) => (
                                            <div key={lb.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-primary/5 dark:bg-primary/20 text-primary flex items-center justify-center">
                                                        <span className="material-symbols-outlined">engineering</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-[#0e171b] dark:text-white uppercase tracking-tight">{lb.role}</p>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor/Hora: {formatCurrency(lb.hourlyRate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Horas Planejadas</p>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    const newLabor = labor.map(l => l.id === lb.id ? { ...l, hoursPlanned: Math.max(0, l.hoursPlanned - 1) } : l);
                                                                    setLabor(newLabor);
                                                                }}
                                                                className="size-8 rounded-xl bg-white dark:bg-gray-800 text-primary flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-primary hover:text-white transition-all"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">remove</span>
                                                            </button>
                                                            <span className="text-xl font-black min-w-[2rem] text-center">{lb.hoursPlanned}</span>
                                                            <button
                                                                onClick={() => {
                                                                    const newLabor = labor.map(l => l.id === lb.id ? { ...l, hoursPlanned: l.hoursPlanned + 1 } : l);
                                                                    setLabor(newLabor);
                                                                }}
                                                                className="size-8 rounded-xl bg-white dark:bg-gray-800 text-primary flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-primary hover:text-white transition-all"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">add</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeLabor(lb.id)}
                                                        className="size-10 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addLabor}
                                        className="w-full py-5 text-sm font-black text-primary flex items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-primary/20 transition-all border-t border-gray-50 dark:border-gray-700 uppercase tracking-widest"
                                    >
                                        <span className="material-symbols-outlined">add_circle</span>
                                        Adicionar Mão de Obra
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Operational Costs, Taxes and Totals */}
                        <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-8 sticky top-24">

                            {/* Section 3: Custo Operacional */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-black text-primary dark:text-white mb-5 flex items-center gap-2">
                                    <span className="material-symbols-outlined">schedule</span>
                                    Cronograma Projetado
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl flex flex-col items-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Produção</p>
                                        <div className="flex items-end gap-2 text-primary">
                                            <input
                                                className="w-16 h-12 p-0 text-center text-2xl font-black border-0 border-b-2 border-primary bg-transparent focus:ring-0"
                                                type="number"
                                                value={productionDays}
                                                onChange={(e) => setProductionDays(Number(e.target.value))}
                                            />
                                            <span className="text-xs font-bold pb-2">dias</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl flex flex-col items-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instalação</p>
                                        <div className="flex items-end gap-2 text-primary">
                                            <input
                                                className="w-16 h-12 p-0 text-center text-2xl font-black border-0 border-b-2 border-primary bg-transparent focus:ring-0"
                                                type="number"
                                                value={installationDays}
                                                onChange={(e) => setInstallationDays(Number(e.target.value))}
                                            />
                                            <span className="text-xs font-bold pb-2">dias</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/20 rounded-2xl flex justify-between items-center">
                                    <span className="text-xs font-black text-primary dark:text-blue-300 uppercase tracking-widest">Taxa Estrutural</span>
                                    <span className="text-base font-black text-primary dark:text-blue-300">{formatCurrency(operationalSubtotal)}</span>
                                </div>
                            </div>

                            {/* Section 4: Encargos e Lucro */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-black text-primary dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined">percent</span>
                                    Impostos & Margem
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end px-1">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Impostos e Taxas</p>
                                            <span className="text-xl font-black text-primary">{taxesPerc}%</span>
                                        </div>
                                        <input
                                            className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                            type="range"
                                            min="0" max="100"
                                            value={taxesPerc}
                                            onChange={(e) => setTaxesPerc(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end px-1">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Margem de Lucro Bruto</p>
                                            <span className="text-xl font-black text-primary">{profitPerc}%</span>
                                        </div>
                                        <input
                                            className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                            type="range"
                                            min="0" max="100"
                                            value={profitPerc}
                                            onChange={(e) => setProfitPerc(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Footer / Total Panel for Desktop */}
                            <div className="hidden lg:block">
                                <div className="bg-[#3D7A6C] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden transition-all hover:scale-[1.02]">
                                    <div className="relative z-10 flex flex-col gap-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Estimativa de Venda</span>
                                            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined">payments</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold opacity-60">R$</span>
                                            <h1 className="text-5xl font-black tracking-tight leading-none">
                                                {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(sellingPrice)}
                                            </h1>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <button className="bg-white text-[#3D7A6C] rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border-0 active:scale-95">
                                                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                                GERAR PDF
                                            </button>
                                            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-4 transition-all flex items-center justify-center border-0 active:scale-95">
                                                <span className="material-symbols-outlined">share</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute right-[-30px] bottom-[-30px] opacity-10">
                                        <span className="material-symbols-outlined text-[180px]">point_of_sale</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Footer */}
            <footer className="lg:hidden fixed bottom-[72px] left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-4 z-[90]">
                <div className="max-w-md mx-auto">
                    <div className="bg-[#3D7A6C] rounded-2xl p-5 text-white shadow-lg flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/70 text-[9px] font-black uppercase tracking-[0.15em]">Valor Final Projetado</span>
                            <span className="material-symbols-outlined text-white/40">trending_up</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold opacity-60">R$</span>
                            <h1 className="text-3xl font-black tracking-tight leading-none">
                                {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(sellingPrice)}
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-white text-[#3D7A6C] rounded-xl py-3.5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                                GERAR PDF
                            </button>
                            <button className="size-12 bg-white/20 rounded-xl flex items-center justify-center active:scale-95">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProjectBudget;
