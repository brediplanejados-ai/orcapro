import React, { useState, useEffect } from 'react';
import type { FixedCost, Collaborator } from '../types';
import { supabase } from '../lib/supabase';

const FixedCosts: React.FC = () => {
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [workingDays, setWorkingDays] = useState(22);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Optional: Real-time subscription
        const fixedCostsSub = supabase.channel('fixed_costs_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fixed_costs' }, () => fetchData())
            .subscribe();

        const collaboratorsSub = supabase.channel('collaborators_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'collaborators' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(fixedCostsSub);
            supabase.removeChannel(collaboratorsSub);
        };
    }, []);

    const fetchData = async () => {
        try {
            const { data: costs } = await supabase.from('fixed_costs').select('*').order('created_at', { ascending: true });
            const { data: colabs } = await supabase.from('collaborators').select('*').order('created_at', { ascending: true });

            if (costs) setFixedCosts(costs);
            if (colabs) setCollaborators(colabs);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalFixedCosts = fixedCosts.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const totalPayroll = collaborators.reduce((acc, curr) => acc + (curr.salary || 0), 0);
    const totalMonthlyCost = totalFixedCosts + totalPayroll;
    const dailyCost = workingDays > 0 ? totalMonthlyCost / workingDays : 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const removeFixedCost = async (id: string) => {
        setFixedCosts(prev => prev.filter(item => item.id !== id));
        await supabase.from('fixed_costs').delete().eq('id', id);
    };

    const addFixedCost = async () => {
        const name = window.prompt('Nome do custo (ex: Aluguel):');
        if (!name) return;
        const valueStr = window.prompt('Valor mensal (R$):', '0');
        if (valueStr === null) return;

        const value = parseFloat(valueStr.replace(/[R$\s.]/g, '').replace(',', '.'));
        if (isNaN(value)) {
            alert('Valor inválido. Use números (ex: 1500,50)');
            return;
        }

        const newCost = {
            name,
            value,
            icon: 'payments'
        };

        const { data } = await supabase.from('fixed_costs').insert(newCost).select().single();
        if (data) {
            setFixedCosts(prev => [...prev, data]);
        }
    };

    const addCollaborator = async () => {
        const role = window.prompt('Cargo (ex: Marceneiro):');
        if (!role) return;
        const salaryStr = window.prompt('Salário mensal (R$):', '0');
        if (salaryStr === null) return;

        const salary = parseFloat(salaryStr.replace(/[R$\s.]/g, '').replace(',', '.'));
        if (isNaN(salary)) {
            alert('Valor inválido. Use números (ex: 2500)');
            return;
        }

        const newColab = {
            role,
            salary,
            hours_per_month: 220
        };

        const { data } = await supabase.from('collaborators').insert(newColab).select().single();
        if (data) {
            // Mapping from DB hours_per_month to UI hoursPerMonth
            const mapped = { ...data, hoursPerMonth: data.hours_per_month };
            setCollaborators(prev => [...prev, mapped]);
        }
    };

    const updateCollaborator = async (id: string, field: keyof Collaborator, value: string | number) => {
        let finalValue = value;
        if (field === 'salary' && typeof value === 'string') {
            finalValue = parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        }
        if (field === 'hoursPerMonth') {
            finalValue = Number(value) || 0;
        }

        setCollaborators(prev => prev.map(c => c.id === id ? { ...c, [field]: finalValue } : c));

        const dbField = field === 'hoursPerMonth' ? 'hours_per_month' : field;
        await supabase.from('collaborators').update({ [dbField]: finalValue }).eq('id', id);
    };

    const removeCollaborator = async (id: string) => {
        setCollaborators(prev => prev.filter(item => item.id !== id));
        await supabase.from('collaborators').delete().eq('id', id);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 pb-24 lg:pt-8">
            {/* TopAppBar - Mobile Only Header */}
            <div className="md:hidden sticky top-0 z-50 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md py-4 justify-between border-b border-gray-200 dark:border-gray-800 -mx-4 px-4">
                <div className="text-[#0e171b] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </div>
                <h2 className="text-[#0e171b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Configuração de Custos</h2>
                <div className="flex w-12 items-center justify-end">
                    <button className="flex items-center justify-center rounded-lg h-12 bg-transparent text-primary dark:text-white font-bold">
                        <span className="material-symbols-outlined">check_circle</span>
                    </button>
                </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-8 mt-6">
                {/* Left Column: Summary and Main Stats */}
                <div className="md:col-span-12 lg:col-span-4 space-y-6">
                    {/* Summary Header Card */}
                    <div className="p-6 rounded-3xl bg-primary text-white shadow-xl overflow-hidden relative min-h-[160px] flex flex-col justify-center">
                        <div className="relative z-10">
                            <p className="text-sm opacity-80 font-bold uppercase tracking-widest mb-2">Custo Operacional Mensal</p>
                            <h1 className="text-4xl lg:text-5xl font-black">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMonthlyCost)}
                            </h1>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                            <span className="material-symbols-outlined text-[120px]">calculate</span>
                        </div>
                    </div>

                    {/* Operational Metrics Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Métricas Operacionais
                        </h3>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Dias Úteis / Mês</label>
                                <div className="relative group">
                                    <input
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-2xl px-5 py-4 text-lg font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        type="number"
                                        value={workingDays}
                                        onChange={(e) => setWorkingDays(Number(e.target.value))}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">dias</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Custo Diário Calculado</label>
                                <div className="flex items-center h-[60px] px-6 bg-primary/5 dark:bg-primary/20 rounded-2xl text-primary dark:text-blue-300 font-black text-xl">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dailyCost)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Result Card - Desktop Version */}
                    <div className="hidden lg:flex p-8 bg-success-accent text-white rounded-3xl shadow-xl flex-col items-center justify-center text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Equilíbrio Mensal</p>
                        <div className="text-3xl font-black mb-6">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMonthlyCost)}
                        </div>
                        <p className="text-sm opacity-90 leading-relaxed font-medium">
                            Este é o faturamento mínimo necessário para cobrir seus custos fixos e folha.
                        </p>
                        <button className="mt-8 w-full py-5 bg-white text-success-accent font-black rounded-2xl shadow-lg active:scale-[0.95] transition-all hover:bg-gray-50 uppercase tracking-wider text-sm">
                            GERAR RELATÓRIO PDF
                        </button>
                    </div>
                </div>

                {/* Right Column: Custos and Colaboradores */}
                <div className="md:col-span-12 lg:col-span-8 space-y-8 mt-8 md:mt-0">
                    {/* Section 1: Custos Fixos */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                Custos Fixos
                                <span className="text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full">{fixedCosts.length}</span>
                            </h2>
                            <button
                                onClick={addFixedCost}
                                className="bg-primary text-white p-2 md:px-5 md:py-2.5 rounded-full md:rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
                            >
                                <span className="material-symbols-outlined">add</span>
                                <span className="hidden md:inline">Novo Custo</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fixedCosts.map((item) => (
                                <div key={item.id} className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="text-primary flex items-center justify-center rounded-2xl bg-primary/5 dark:bg-primary/20 shrink-0 size-14 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold leading-tight mb-1">{item.name}</p>
                                            <p className="text-lg font-black text-primary dark:text-blue-300">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFixedCost(item.id)}
                                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Colaboradores */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                Colaboradores
                                <span className="text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full">{collaborators.length}</span>
                            </h2>
                            <button
                                onClick={addCollaborator}
                                className="bg-primary text-white p-2 md:px-5 md:py-2.5 rounded-full md:rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
                            >
                                <span className="material-symbols-outlined">person_add</span>
                                <span className="hidden md:inline">Novo Colaborador</span>
                            </button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Cargo</th>
                                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Salário</th>
                                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">H/Mês</th>
                                            <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Valor/H</th>
                                            <th className="p-5 w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {collaborators.map((colab) => (
                                            <tr key={colab.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-5">
                                                    <input
                                                        className="bg-transparent border-0 font-bold text-[#0e171b] dark:text-white uppercase tracking-tight focus:ring-0 w-full"
                                                        value={colab.role}
                                                        onChange={(e) => updateCollaborator(colab.id, 'role', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-5">
                                                    <input
                                                        className="bg-transparent border-0 font-black text-primary dark:text-blue-300 focus:ring-0 w-full"
                                                        type="number"
                                                        value={colab.salary}
                                                        onChange={(e) => updateCollaborator(colab.id, 'salary', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-5 text-right">
                                                    <input
                                                        className="bg-transparent border-0 font-bold text-gray-500 text-right focus:ring-0 w-16"
                                                        type="number"
                                                        value={colab.hoursPerMonth}
                                                        onChange={(e) => updateCollaborator(colab.id, 'hoursPerMonth', e.target.value)}
                                                    />
                                                    <span className="text-xs text-gray-400 font-bold ml-1">h</span>
                                                </td>
                                                <td className="p-5 text-lg font-black text-success-accent text-right">
                                                    {formatCurrency(colab.salary / (colab.hoursPerMonth || 1))}
                                                </td>
                                                <td className="p-5 text-right">
                                                    <button
                                                        onClick={() => removeCollaborator(colab.id)}
                                                        className="text-gray-300 hover:text-red-500 p-2 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-success-accent/5 dark:bg-success-accent/10 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-success-accent uppercase tracking-widest leading-none mb-1">Total da Folha</span>
                                    <p className="text-2xl font-black text-success-accent">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPayroll)}
                                    </p>
                                </div>
                                <div className="size-12 bg-success-accent text-white rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tips and Mobile Result Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Instructional Card */}
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                            <div className="flex items-start gap-4">
                                <div className="size-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-3xl">lightbulb</span>
                                </div>
                                <div>
                                    <p className="text-lg font-black tracking-tight mb-1">Dica de Gestão</p>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed">Inclua custos variáveis pequenos como lixas e colas na média mensal para maior precisão.</p>
                                </div>
                            </div>
                        </div>

                        {/* Final Result Card - Mobile Version */}
                        <div className="lg:hidden p-6 bg-success-accent text-white rounded-3xl shadow-xl flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Equilíbrio Mensal</p>
                            <div className="text-4xl font-black mb-4">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMonthlyCost)}
                            </div>
                            <button className="w-full py-4 bg-white text-success-accent font-black rounded-2xl shadow-md active:scale-[0.98] transition-all uppercase tracking-wider text-xs">
                                GERAR RELATÓRIO PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FixedCosts;
