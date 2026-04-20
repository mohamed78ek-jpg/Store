import React, { useState } from 'react';
import { ShieldCheck, Thermometer, Droplet, UserCheck, CheckCircle2, AlertCircle, Info, Stethoscope } from 'lucide-react';
import { Language } from '../types';

interface HealthControlProps {
  language: Language;
}

export const HealthControl: React.FC<HealthControlProps> = ({ language }) => {
  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const [measures, setMeasures] = useState([
    { id: 1, titleAr: 'تعقيم المنتجات', titleEn: 'Product Sterilization', status: 'optimal', lastCheck: '1h ago', icon: <Droplet className="text-blue-500" /> },
    { id: 2, titleAr: 'فحص حرارة الموظفين', titleEn: 'Staff Temp Check', status: 'safe', lastCheck: '30m ago', icon: <Thermometer className="text-orange-500" /> },
    { id: 3, titleAr: 'شهادة الجودة الصحية', titleEn: 'Health Quality Certificate', status: 'valid', lastCheck: '2 days ago', icon: <ShieldCheck className="text-emerald-500" /> },
    { id: 4, titleAr: 'بروتوكول التسليم الآمن', titleEn: 'Safe Delivery Protocol', status: 'active', lastCheck: 'Always', icon: <UserCheck className="text-purple-500" /> },
  ]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-gray-100 bg-emerald-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={24} className="text-emerald-600" />
          {t('نظام التحكم الصحي والوقائي', 'Health & Safety Control System')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('رصد وتتبع معايير السلامة ضد الفيروسات وضمان جودة البيئة الصحية للمتجر.', 'Monitoring and tracking safety standards against viruses and ensuring a healthy environment for the store.')}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-600 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-200">
            <div>
              <div className="text-emerald-100 text-sm font-medium mb-1">{t('الحالة العامة', 'Overall Status')}</div>
              <div className="text-3xl font-bold">{t('آمن ومثالي', 'Safe & Optimal')}</div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-gray-200">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">{t('آخر تحديث للنظام', 'System Last Audit')}</div>
              <div className="text-3xl font-bold">{new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Info size={32} />
            </div>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-4">{t('مؤشرات السلامة الحيوية', 'Biometric Safety Indicators')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {measures.map((m) => (
            <div key={m.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {m.icon}
                </div>
                <span className="text-[10px] font-bold uppercase py-1 px-2 rounded-full bg-emerald-100 text-emerald-700">
                  {m.status}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{t(m.titleAr, m.titleEn)}</h4>
              <p className="text-[11px] text-gray-400">{t('آخر فحص:', 'Last check:')} {m.lastCheck}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 items-start">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-bold text-yellow-800 mb-1">{t('تنبيه وقائي', 'Precautionary Alert')}</h4>
            <p className="text-xs text-yellow-700 leading-relaxed">
              {t('جميع الشحنات تخضع لعملية تعقيم بالأشعة فوق البنفسجية قبل التغليف النهائي لضمان خلوها من أي فيروسات أو ميكروبات.', 'All shipments undergo UV sterilization before final packaging to ensure they are free from any viruses or microbes.')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Stethoscope className="text-emerald-600" size={18} />
            <span className="text-xs font-bold text-gray-600">{t('مدعوم بشهادة ISO 27001 الصحية', 'Certified by Health ISO 27001')}</span>
        </div>
        <button className="text-xs text-emerald-600 font-bold hover:underline">
          {t('عرض التقارير التفصيلية', 'View Detailed Reports')}
        </button>
      </div>
    </div>
  );
};
