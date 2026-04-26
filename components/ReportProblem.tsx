import React, { useState } from 'react';
import { Language, Report } from '../types';
import { Send, TriangleAlert, ArrowRight, CheckCircle } from 'lucide-react';

interface ReportProblemProps {
  onSubmit: (report: Omit<Report, 'id' | 'date' | 'isRead'>) => void;
  onBack: () => void;
  language: Language;
}

export const ReportProblem: React.FC<ReportProblemProps> = ({ onSubmit, onBack, language }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setIsSubmitted(true);
    setFormData({ name: '', contact: '', message: '' });
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('تم إرسال بلاغك بنجاح', 'Report Sent Successfully')}</h2>
        <p className="text-gray-500 mb-8 text-lg">
          {t('شكراً لتواصلك معنا. سنقوم بمراجعة المشكلة والعمل على حلها في أقرب وقت ممكن.', 'Thank you for contacting us. We will review the issue and work on resolving it as soon as possible.')}
        </p>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg"
        >
          {t('العودة للرئيسية', 'Return to Home')}
        </button>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="block w-full mt-4 text-gray-400 hover:text-gray-600 text-sm"
        >
          {t('إرسال بلاغ آخر', 'Send another report')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-emerald-600 mb-8 transition-colors group">
        <ArrowRight size={20} className={`transform group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
        <span>{t('العودة', 'Back')}</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-8 border-b border-gray-100">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4">
            <TriangleAlert size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('أبلغ عن مشكلة', 'Report a Problem')}</h1>
          <p className="text-gray-500">
            {t('نأسف لمواجهتك مشكلة. يرجى تزويدنا بالتفاصيل لنتمكن من مساعدتك.', 'We apologize for the inconvenience. Please provide details so we can assist you.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('الاسم', 'Name')}</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder={t('أدخل اسمك', 'Enter your name')}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('وسيلة التواصل (بريد إلكتروني أو هاتف)', 'Contact Info (Email or Phone)')}</label>
            <input
              required
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              dir="ltr"
              placeholder="+966..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('تفاصيل المشكلة', 'Problem Details')}</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none resize-none focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder={t('اشرح المشكلة التي واجهتك بالتفصيل...', 'Describe the issue you faced in detail...')}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-emerald-500/30 text-lg flex items-center justify-center gap-2 group"
          >
            <span>{t('إرسال البلاغ', 'Submit Report')}</span>
            <Send size={18} className={`transform transition-transform ${language === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
          </button>
        </form>
      </div>
    </div>
  );
};