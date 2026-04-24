import React, { useState } from 'react';
import { Order, Language, OrderStatus } from '../types';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface TrackOrderProps {
  onBack: () => void;
  language: Language;
}

export const TrackOrder: React.FC<TrackOrderProps> = ({ onBack, language }) => {
  const [orderId, setOrderId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = orderId.trim();
    if (!trimmedId) return;

    setIsLoading(true);
    setError('');
    setSearchedOrder(null);

    try {
      // First try fetching by document ID
      let orderDoc = await getDoc(doc(db, 'orders', trimmedId));
      
      if (orderDoc.exists()) {
        const orderData = orderDoc.data() as Order;
        setSearchedOrder({ ...orderData, id: orderDoc.id });
      } else {
        // Fallback: search for a document where field 'id' matches the input
        // This is useful if orders were created with auto-IDs but have the numeric ID as a field
        const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
        const q = query(collection(db, 'orders'), where('id', '==', trimmedId), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const orderData = doc.data() as Order;
          setSearchedOrder({ ...orderData, id: doc.id });
        } else {
          setError(t('لم يتم العثور على طلب بهذا الرقم. يرجى التحقق والمحاولة مرة أخرى.', 'Order not found. Please check the ID and try again.'));
        }
      }
    } catch (err) {
      console.error("Order tracking error:", err);
      setError(t('حدث خطأ أثناء البحث عن الطلب. يرجى المحاولة لاحقاً.', 'An error occurred while searching for the order. Please try again later.'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return t('قيد الانتظار', 'Pending');
      case 'processing': return t('جاري التجهيز', 'Processing');
      case 'shipped': return t('تم الشحن', 'Shipped');
      case 'delivered': return t('تم التوصيل', 'Delivered');
      case 'cancelled': return t('ملغي', 'Cancelled');
      default: return status;
    }
  };

  const currentStep = searchedOrder ? getStatusStep(searchedOrder.status) : 0;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-emerald-600 mb-8 transition-colors group">
        <ArrowRight size={20} className={`transform group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
        <span>{t('العودة للرئيسية', 'Back to Home')}</span>
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{t('تتبع طلبك', 'Track Your Order')}</h1>
        <p className="text-gray-500">{t('أدخل رقم الطلب لمعرفة حالته الحالية', 'Enter your order ID to check its current status')}</p>
      </div>

      {/* Search Box */}
      <div className="max-w-md mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative flex shadow-lg rounded-xl overflow-hidden">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder={t('رقم الطلب (مثال: 1234567)', 'Order ID (e.g., 1234567)')}
            className="flex-1 px-6 py-4 bg-white border-none outline-none text-gray-900"
            dir="ltr"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 text-white px-8 font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4 font-medium animate-in fade-in slide-in-from-top-2">{error}</p>}
      </div>

      {/* Result */}
      {searchedOrder && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <span className="text-sm text-gray-500 block mb-1">{t('رقم الطلب', 'Order ID')}</span>
              <span className="text-xl font-bold text-gray-900 font-mono">#{searchedOrder.id}</span>
            </div>
            <div className="text-end">
              <span className="text-sm text-gray-500 block mb-1">{t('تاريخ الطلب', 'Order Date')}</span>
              <span className="font-medium text-gray-900">{new Date(searchedOrder.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-8">
            {searchedOrder.status === 'cancelled' ? (
               <div className="flex flex-col items-center justify-center text-red-500 py-8">
                  <XCircle size={64} className="mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{t('تم إلغاء الطلب', 'Order Cancelled')}</h3>
                  <p className="text-gray-500">{t('يرجى التواصل مع خدمة العملاء للمزيد من التفاصيل', 'Please contact support for more details')}</p>
               </div>
            ) : (
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block"></div>
                
                {/* Steps */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                  
                  {/* Step 1: Pending */}
                  <div className={`flex flex-row md:flex-col items-center gap-4 md:gap-2 ${currentStep >= 1 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${currentStep >= 1 ? 'bg-white border-emerald-600 shadow-lg scale-110' : 'bg-gray-50 border-gray-200'}`}>
                      <Clock size={20} />
                    </div>
                    <div className="text-start md:text-center">
                      <p className="font-bold text-sm md:text-base">{t('قيد المراجعة', 'Pending')}</p>
                      <p className="text-xs text-gray-400 hidden md:block">{t('تم استلام الطلب', 'Order Received')}</p>
                    </div>
                  </div>

                  {/* Step 2: Processing */}
                  <div className={`flex flex-row md:flex-col items-center gap-4 md:gap-2 ${currentStep >= 2 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${currentStep >= 2 ? 'bg-white border-emerald-600 shadow-lg scale-110' : 'bg-gray-50 border-gray-200'}`}>
                      <Package size={20} />
                    </div>
                    <div className="text-start md:text-center">
                      <p className="font-bold text-sm md:text-base">{t('جاري التجهيز', 'Processing')}</p>
                      <p className="text-xs text-gray-400 hidden md:block">{t('يتم تجهيز المنتجات', 'Packing Items')}</p>
                    </div>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className={`flex flex-row md:flex-col items-center gap-4 md:gap-2 ${currentStep >= 3 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${currentStep >= 3 ? 'bg-white border-emerald-600 shadow-lg scale-110' : 'bg-gray-50 border-gray-200'}`}>
                      <Truck size={20} />
                    </div>
                    <div className="text-start md:text-center">
                      <p className="font-bold text-sm md:text-base">{t('تم الشحن', 'Shipped')}</p>
                      <p className="text-xs text-gray-400 hidden md:block">{t('في الطريق إليك', 'On the way')}</p>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className={`flex flex-row md:flex-col items-center gap-4 md:gap-2 ${currentStep >= 4 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${currentStep >= 4 ? 'bg-white border-emerald-600 shadow-lg scale-110' : 'bg-gray-50 border-gray-200'}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div className="text-start md:text-center">
                      <p className="font-bold text-sm md:text-base">{t('تم التوصيل', 'Delivered')}</p>
                      <p className="text-xs text-gray-400 hidden md:block">{t('استمتع بمشترياتك', 'Enjoy your items')}</p>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-6 border-t border-gray-100">
             <h3 className="font-bold text-gray-900 mb-4">{t('ملخص الطلب', 'Order Summary')}</h3>
             <div className="space-y-3">
               {searchedOrder.items.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-gray-500">{item.quantity} x {item.price}</p>
                    </div>
                 </div>
               ))}
             </div>
             <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center font-bold">
               <span>{t('المجموع الكلي', 'Total Amount')}</span>
               <span className="text-emerald-600 text-lg">{searchedOrder.totalAmount.toFixed(2)}</span>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};