
import React, { useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { ApiEvent, ApiArticle, ApiAuthor, ApiExpert, Category } from '../../types';

interface DashboardTabProps {
    events: ApiEvent[];
    articles: ApiArticle[];
    authors: ApiAuthor[];
    experts: ApiExpert[];
    categories: Category[];
    totals?: {
        events: number;
        articles: number;
        experts: number;
        authors: number;
    };
    loading: boolean;
}

const StatCard: React.FC<{ label: string; value: number | string; icon: string; colorClass: string }> = ({ label, value, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 transition-all hover:shadow-md">
        <div className={`w-16 h-16 rounded-xl ${colorClass} flex items-center justify-center text-3xl shadow-inner`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <h4 className="text-3xl font-black text-clinical-charcoal">{value}</h4>
        </div>
    </div>
);

const ProgressBar: React.FC<{ label: string; percentage: number; colorClass: string; count: number }> = ({ label, percentage, colorClass, count }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
            <span className="text-gray-600">{label}</span>
            <span className="text-med-tech-blue">{count}</span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-50">
            <div className={`h-full ${colorClass} transition-all duration-1000 ease-out`} style={{ width: `${Math.max(percentage, 5)}%` }}></div>
        </div>
    </div>
);

const DashboardTab: React.FC<DashboardTabProps> = ({ events, articles, authors, experts, categories, totals, loading }) => {
    const { t } = useLocalization();

    const stats = useMemo(() => ({
        eventsCount: totals?.events ?? events.length,
        articlesCount: totals?.articles ?? articles.length,
        authorsCount: totals?.authors ?? authors.length,
        expertsCount: totals?.experts ?? experts.length,
        totalEvaluations: experts.reduce((sum, e) => sum + (e.number_of_events || 0), 0),
        avgExperience: experts.length > 0 ? (experts.reduce((sum, e) => sum + (e.years_of_experience || 0), 0) / experts.length).toFixed(1) : 0
    }), [events, articles, authors, experts, totals]);

    const articlesByCategory = useMemo(() => {
        return categories.map(cat => {
            const count = articles.filter(a => Number(a.category_id) === cat.id).length;
            const percentage = articles.length > 0 ? (count / articles.length) * 100 : 0;
            return { name: cat.name_en, count, percentage };
        }).sort((a, b) => b.count - a.count);
    }, [categories, articles]);

    const eventsByYear = useMemo(() => {
        const years: Record<string, number> = {};
        events.forEach(e => {
            // Robust year extraction: look for 4 digits starting with 20 (e.g. 2024, 2025)
            // This handles localized strings like "25 أكتوبر 2025" or ISO strings
            const match = e.date_of_happening?.match(/\b(20\d{2})\b/);
            const year = match ? match[1] : null;
            
            if (year) {
                years[year] = (years[year] || 0) + 1;
            } else {
                // Fallback for very old entries or different formats
                const fallbackYear = new Date(e.date_of_happening).getFullYear().toString();
                if (fallbackYear !== "NaN") {
                    years[fallbackYear] = (years[fallbackYear] || 0) + 1;
                }
            }
        });
        // Sort years ascending for the chart
        return Object.entries(years).sort((a, b) => a[0].localeCompare(b[0]));
    }, [events]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 border-4 border-med-tech-blue/20 border-t-med-tech-blue rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold animate-pulse">{t({ar: 'جاري توليد الإحصائيات...', en: 'Generating statistics...'})}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            {/* Top Bar Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label={t({ar: 'المؤتمرات', en: 'Conferences'})} value={stats.eventsCount} icon="🗓️" colorClass="bg-blue-50 text-blue-600" />
                <StatCard label={t({ar: 'المقالات', en: 'Articles'})} value={stats.articlesCount} icon="📝" colorClass="bg-green-50 text-green-600" />
                <StatCard label={t({ar: 'الخبراء', en: 'Experts'})} value={stats.expertsCount} icon="👨‍⚕️" colorClass="bg-indigo-50 text-indigo-600" />
                <StatCard label={t({ar: 'المؤلفون', en: 'Authors'})} value={stats.authorsCount} icon="✍️" colorClass="bg-orange-50 text-orange-600" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Articles by Category Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-med-blue flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-med-vital-green rounded-full"></span>
                            {t({ar: 'توزيع المقالات حسب التصنيف', en: 'Articles by Category'})}
                        </h3>
                        <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">{t({ar: 'بيانات حية', en: 'Live Data'})}</span>
                    </div>
                    <div className="space-y-6">
                        {articlesByCategory.slice(0, 5).map((cat, idx) => (
                            <ProgressBar 
                                key={idx} 
                                label={cat.name} 
                                count={cat.count} 
                                percentage={cat.percentage} 
                                colorClass="bg-med-tech-blue" 
                            />
                        ))}
                        {articlesByCategory.length === 0 && <p className="text-center text-gray-400 py-10 italic">{t({ar: 'لا توجد بيانات متاحة', en: 'No data available'})}</p>}
                    </div>
                </div>

                {/* Team Stats Summary */}
                <div className="bg-med-tech-blue text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div>
                        <h3 className="text-xl font-bold mb-6 font-arabic">{t({ar: 'ملخص الفريق العلمي', en: 'Scientific Team Summary'})}</h3>
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">🧠</div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-blue-200">{t({ar: 'متوسط سنوات الخبرة', en: 'Avg Years of Experience'})}</div>
                                    <div className="text-2xl font-black">{stats.avgExperience}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">🏆</div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-blue-200">{t({ar: 'إجمالي المؤتمرات المقيمة', en: 'Total Conferences Evaluated'})}</div>
                                    <div className="text-2xl font-black">{stats.totalEvaluations}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/20 flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{t({ar: 'فريق MedPulse المتخصص', en: 'MedPulse Expert Network'})}</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Events by Year Bar Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-med-blue mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-med-tech-blue rounded-full"></span>
                        {t({ar: 'نمو المؤتمرات سنوياً', en: 'Annual Conference Growth'})}
                    </h3>
                    <div className="flex items-end gap-6 h-48 px-4">
                        {eventsByYear.map(([year, count]) => {
                            const maxHeight = Math.max(...eventsByYear.map(e => e[1]));
                            const height = (count / maxHeight) * 100;
                            return (
                                <div key={year} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                                    <div className="w-full bg-gray-50 rounded-t-xl relative group" style={{ height: '80%' }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-med-tech-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {count} {t({ar: 'مؤتمر', en: 'Conferences'})}
                                        </div>
                                        <div 
                                            className="absolute bottom-0 left-0 bg-med-tech-blue w-full rounded-t-xl transition-all duration-700 ease-out hover:brightness-110" 
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 rotate-45 md:rotate-0 mt-2">{year}</span>
                                </div>
                            );
                        })}
                        {eventsByYear.length === 0 && <div className="flex-1 text-center py-20 text-gray-300 italic">{t({ar: 'لا توجد مؤتمرات مسجلة', en: 'No registered conferences'})}</div>}
                    </div>
                </div>

                {/* Recent Activity Mini-Feed */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-med-blue mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-orange-400 rounded-full"></span>
                        {t({ar: 'أحدث الإضافات', en: 'Recent Additions'})}
                    </h3>
                    <div className="space-y-4">
                        {events.slice(0, 3).map(e => (
                            <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-default">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-xl">🗓️</span>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-800 truncate">{e.title_en}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{t({ar: 'مؤتمر', en: 'Conference'})}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-med-tech-blue px-2 py-1 bg-white border border-gray-200 rounded-lg">{e.date_of_happening}</span>
                            </div>
                        ))}
                        {articles.slice(0, 2).map(a => (
                            <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-default">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-xl">📝</span>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-800 truncate">{a.title_en}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{t({ar: 'مقال', en: 'Article'})}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default DashboardTab;
