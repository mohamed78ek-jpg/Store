import React, { useState } from 'react';
import { Eye, EyeOff, Plus, Trash2, LogOut, Package, ShieldCheck, ChevronDown, Megaphone, ShoppingBag, Phone, MapPin, Mail, User, FileText, X, Download, List, PlusCircle, Image as ImageIcon, Upload, MonitorPlay, Banknote, MessageSquareWarning, Calendar, CheckCircle, Link, Printer, CreditCard } from 'lucide-react';
import { Product, Language, Order, PopupConfig, OrderStatus, Report } from '../types';
import { APP_CURRENCY } from '../constants';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  reports: Report[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (id: number) => void;
  language: Language;
  bannerText: string;
  onUpdateBannerText: (text: string) => void;
  popupConfig: PopupConfig;
  onUpdatePopupConfig: (config: PopupConfig) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteReport: (reportId: string) => void;
  isAuthenticated: boolean;
  onLogin: (status: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  orders,
  reports,
  onAddProduct, 
  onRemoveProduct,
  language,
  bannerText,
  onUpdateBannerText,
  popupConfig,
  onUpdatePopupConfig,
  onUpdateOrderStatus,
  onDeleteReport,
  isAuthenticated,
  onLogin
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Updated tabs state
  const [activeTab, setActiveTab] = useState<'orders' | 'add_product' | 'product_list' | 'settings' | 'reports'>('orders');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Form State
  const [newProduct, setNewProduct] = useState<Partial<Product> & { sizesString: string }>({
    name: '',
    price: 0,
    discountPrice: 0,
    category: '',
    image: '',
    description: '',
    sizesString: ''
  });

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Mohamed' && password === 'Mohamed2003') {
      onLogin(true);
      setError('');
    } else {
      setError(t('بيانات الدخول غير صحيحة', 'Invalid credentials'));
    }
  };

  const handleLogout = () => {
    onLogin(false);
  };

  // Predefined Categories
  const CATEGORIES = ['رجال', 'أطفال', 'أحذية', 'اكسسوارات'];

  const STATUSES: { value: OrderStatus; labelAr: string; labelEn: string; color: string }[] = [
    { value: 'pending', labelAr: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', labelAr: 'جاري التجهيز', labelEn: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', labelAr: 'تم الشحن', labelEn: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', labelAr: 'تم التوصيل', labelEn: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'cancelled', labelAr: 'ملغي', labelEn: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price && newProduct.category && newProduct.image) {
      
      const sizesArray = newProduct.sizesString 
        ? newProduct.sizesString.split(',').map(s => s.trim()).filter(s => s !== '') 
        : undefined;

      onAddProduct({
        id: Date.now(),
        name: newProduct.name,
        price: Number(newProduct.price),
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
        category: newProduct.category,
        image: newProduct.image,
        description: newProduct.description || '',
        sizes: sizesArray
      });
      setNewProduct({ name: '', price: 0, discountPrice: 0, category: '', image: '', description: '', sizesString: '' });
      alert(t('تم إضافة المنتج بنجاح', 'Product added successfully'));
    }
  };

  const handlePopupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdatePopupConfig({ ...popupConfig, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Helper to generate QR data string safely
  const getQRData = (order: Order) => {
    const qrString = `Order: ${order.id}\n` +
      `Date: ${new Date(order.date).toLocaleDateString()}\n` +
      `Customer: ${order.customerName}\n` +
      `Total: ${order.totalAmount.toFixed(2)} ${APP_CURRENCY}`;
    return encodeURIComponent(qrString);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('تسجيل دخول المسؤول', 'Admin Login')}</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('اسم المستخدم', 'Username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                dir="ltr"
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('كلمة المرور', 'Password')}</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-[34px] right-3 text-gray-400 hover:text-gray-600"
                style={{ right: language === 'ar' ? 'auto' : '0.75rem', left: language === 'ar' ? '0.75rem' : 'auto' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              {t('دخول', 'Login')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900">{t('لوحة تحكم الإدارة', 'Admin Dashboard')}</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>{t('تسجيل خروج', 'Logout')}</span>
        </button>
      </div>

      {/* Navigation Tabs - Reorganized */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-8 print:hidden">
        <button
          onClick={() => setActiveTab('orders')}
          className={`p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'orders' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <ShoppingBag size={20} />
          <span className="hidden md:inline">{t('الطلبات', 'Orders')}</span>
          <span className="md:hidden">{t('طلبات', 'Orders')}</span>
          {orders.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{orders.length}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reports' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <MessageSquareWarning size={20} />
          <span className="hidden md:inline">{t('البلاغات', 'Reports')}</span>
          <span className="md:hidden">{t('بلاغات', 'Reports')}</span>
          {reports.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{reports.length}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('add_product')}
          className={`p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'add_product' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <PlusCircle size={20} />
          <span className="hidden md:inline">{t('إضافة منتج', 'Add Product')}</span>
          <span className="md:hidden">{t('إضافة', 'Add')}</span>
        </button>

        <button
          onClick={() => setActiveTab('product_list')}
          className={`p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'product_list' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <List size={20} />
          <span className="hidden md:inline">{t('المنتجات', 'Products')}</span>
          <span className="md:hidden">{t('منتجات', 'Products')}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'settings' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Megaphone size={20} />
          <span className="hidden md:inline">{t('إعلانات', 'Ads')}</span>
          <span className="md:hidden">{t('إعلانات', 'Ads')}</span>
        </button>
      </div>

      {/* Content Areas */}
      
      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={24} className="text-emerald-600" />
              {t('الطلبات الواردة', 'Incoming Orders')}
            </h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center">
              <ShoppingBag size={64} className="mb-4 text-gray-200" />
              <p className="text-lg">{t('لا توجد طلبات جديدة حتى الآن', 'No new orders yet')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                         <span className="text-emerald-600">#{order.id}</span>
                         <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                           {new Date(order.date).toLocaleDateString()}
                         </span>
                      </h3>
                      <div className="flex flex-col gap-1 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span dir="ltr" className="text-right">{order.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span>{order.email}</span>
                        </div>
                         <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{order.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-left bg-emerald-50 p-4 rounded-xl border border-emerald-100 min-w-[150px]">
                        <div className="text-sm text-gray-500 mb-1">{t('إجمالي الطلب', 'Total Amount')}</div>
                        <div className="text-2xl font-bold text-emerald-600">{order.totalAmount.toFixed(2)} {APP_CURRENCY}</div>
                      </div>
                      
                      {/* Status Dropdown */}
                      <div className="w-full">
                         <div className="text-sm text-gray-500 mb-1">{t('حالة الطلب', 'Order Status')}</div>
                         <select 
                           value={order.status}
                           onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                           className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm font-medium"
                         >
                           {STATUSES.map(s => (
                             <option key={s.value} value={s.value}>
                               {language === 'ar' ? s.labelAr : s.labelEn}
                             </option>
                           ))}
                         </select>
                      </div>

                      <button 
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="flex items-center gap-2 text-white bg-gray-900 hover:bg-emerald-600 font-bold px-4 py-2 rounded-lg transition-colors w-full justify-center mt-1 shadow-sm"
                      >
                        <Printer size={18} />
                        {t('طباعة / حفظ', 'Print / Save')}
                      </button>
                    </div>
                  </div>

                  {/* Simplified Products Display for Dashboard */}
                  <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <div className="flex items-center gap-2 text-gray-600">
                        <Package size={16} />
                        <span className="font-medium text-sm">
                          {t('عدد المنتجات:', 'Items Count:')} {order.items.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                     </div>
                     <span className="text-xs text-gray-400">
                       {t('انقر على "طباعة" للتفاصيل الكاملة', 'Click "Print" for full details')}
                     </span>
                  </div>

                  {order.receiptFile && (
                    <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                      <Download size={12} />
                      {t('يوجد مرفق مع الطلب', 'Attachment available')}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquareWarning size={24} className="text-red-600" />
              {t('بلاغات المشاكل', 'Problem Reports')}
            </h2>
          </div>
          
          {reports.length === 0 ? (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center">
              <CheckCircle size={64} className="mb-4 text-gray-200" />
              <p className="text-lg">{t('لا توجد بلاغات جديدة', 'No new reports')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{report.name}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                           <Calendar size={12} />
                           {new Date(report.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-emerald-600 mb-3" dir="ltr">
                        <Phone size={14} />
                        <span>{report.contact}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 leading-relaxed">
                        {report.message}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onDeleteReport(report.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('حذف البلاغ', 'Delete Report')}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ADD PRODUCT TAB */}
      {activeTab === 'add_product' && (
        <div className="max-w-3xl mx-auto animate-in fade-in zoom-in duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Plus size={24} className="text-emerald-600" />
              {t('إضافة منتج جديد', 'Add New Product')}
            </h2>
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('اسم المنتج', 'Product Name')}</label>
                <input
                  required
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('السعر الأصلي', 'Price')}</label>
                  <input
                    required
                    type="number"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('سعر الخصم (اختياري)', 'Discount Price (Optional)')}</label>
                  <input
                    type="number"
                    value={newProduct.discountPrice || ''}
                    onChange={(e) => setNewProduct({...newProduct, discountPrice: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('التصنيف', 'Category')}</label>
                  <div className="relative">
                    <select
                      required
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none appearance-none focus:ring-2 focus:ring-emerald-100 transition-all"
                    >
                      <option value="">{t('اختر التصنيف', 'Select Category')}</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className={`absolute top-4 text-gray-400 pointer-events-none ${language === 'ar' ? 'left-4' : 'right-4'}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('المقاسات (مفصولة بفاصلة)', 'Sizes (comma separated)')}</label>
                  <input
                    type="text"
                    value={newProduct.sizesString}
                    onChange={(e) => setNewProduct({...newProduct, sizesString: e.target.value})}
                    placeholder="S, M, L, XL"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Product Image Selection - URL or Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('صورة المنتج', 'Product Image')}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: URL */}
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all hover:shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                       <Link size={16} className="text-emerald-600" />
                       <span className="text-xs font-bold text-gray-500 uppercase">{t('رابط الصورة', 'Image URL')}</span>
                     </div>
                     <input
                      required={!newProduct.image}
                      type="url"
                      value={newProduct.image && !newProduct.image.startsWith('data:') ? newProduct.image : ''}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:border-emerald-500 outline-none text-sm"
                      dir="ltr"
                    />
                  </div>

                  {/* Option 2: Upload */}
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all hover:shadow-sm relative">
                     <div className="flex items-center gap-2 mb-2">
                       <Upload size={16} className="text-emerald-600" />
                       <span className="text-xs font-bold text-gray-500 uppercase">{t('رفع من الجهاز', 'Upload')}</span>
                     </div>
                     <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                     </div>
                  </div>
                </div>
                
                {/* Preview if image exists */}
                {newProduct.image && (
                  <div className="mt-4 flex justify-center">
                    <div className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                      <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('الوصف', 'Description')}</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none resize-none focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30 text-lg"
              >
                {t('إضافة المنتج', 'Add Product')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. PRODUCT LIST TAB */}
      {activeTab === 'product_list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package size={24} className="text-emerald-600" />
              {t('قائمة المنتجات الحالية', 'Current Products List')}
            </h2>
            <span className="text-sm font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              {products.length} {t('منتج', 'Products')}
            </span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {products.map(product => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">{product.category}</span>
                    <span className="text-gray-300">|</span>
                    {product.discountPrice ? (
                      <>
                        <span className="line-through text-gray-400 text-sm">{product.price}</span> 
                        <span className="text-emerald-600 font-bold">{product.discountPrice} {APP_CURRENCY}</span>
                      </>
                    ) : (
                        <span className="font-bold text-gray-700">{product.price} {APP_CURRENCY}</span>
                    )}
                  </div>
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="font-bold">{t('المقاسات:', 'Sizes:')}</span> 
                      {product.sizes.map(s => <span key={s} className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{s}</span>)}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => onRemoveProduct(product.id)}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title={t('حذف', 'Delete')}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="p-16 text-center text-gray-500">
                <Package size={64} className="mb-4 mx-auto text-gray-200" />
                {t('لا توجد منتجات حالياً', 'No products available')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ADS TAB (Formerly Settings) */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto animate-in fade-in zoom-in duration-300">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Megaphone size={24} className="text-emerald-600" />
                {t('إعلانات الموقع', 'Site Ads')}
              </h2>

              <div className="space-y-8">
                {/* Banner Section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Megaphone size={16} />
                    {t('شريط البنر العلوي', 'Top Banner')}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('نص الشريط المتحرك', 'Scrolling Text')}</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={bannerText}
                        onChange={(e) => onUpdateBannerText(e.target.value)}
                        placeholder={t('أدخل نص البنر هنا...', 'Enter banner text here...')}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all"
                      />
                      <button 
                        onClick={() => onUpdateBannerText('')}
                        disabled={!bannerText}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('حذف الإعلان', 'Delete Ad')}
                      >
                        <Trash2 size={20} />
                        <span className="hidden sm:inline">{t('حذف', 'Delete')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Popup Ad Section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MonitorPlay size={16} />
                    {t('إعلان منبثق (Popup)', 'Popup Advertisement')}
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    
                    <div className="flex items-center gap-3 mb-6">
                      <input 
                        type="checkbox"
                        checked={popupConfig.isActive}
                        onChange={(e) => onUpdatePopupConfig({...popupConfig, isActive: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        id="popupActive"
                      />
                      <label htmlFor="popupActive" className="font-bold text-gray-900 cursor-pointer">{t('تفعيل الإعلان المنبثق', 'Activate Popup Ad')}</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        
                        {/* URL Option Box */}
                        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                           <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                               <Link size={14} />
                             </div>
                             {t('رابط الصورة (URL)', 'Image URL')}
                           </label>
                           <input
                            type="text"
                            value={popupConfig.image.startsWith('data:') ? '' : popupConfig.image}
                            onChange={(e) => onUpdatePopupConfig({...popupConfig, image: e.target.value})}
                            placeholder="https://..."
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
                            dir="ltr"
                          />
                        </div>

                        {/* Divider */}
                         <div className="relative flex items-center justify-center py-1">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <span className="bg-gray-50 px-2 text-xs text-gray-400 font-bold uppercase z-10">{t('أو', 'OR')}</span>
                        </div>

                        {/* Upload Option Box */}
                        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:border-emerald-200 transition-colors">
                           <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                               <Upload size={14} />
                             </div>
                             {t('رفع صورة من الجهاز', 'Upload Image')}
                           </label>
                           <div className="relative group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePopupImageUpload}
                              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                            />
                            <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none group-hover:text-emerald-500 transition-colors">
                                <Upload size={16} />
                            </div>
                           </div>
                        </div>

                      </div>

                      {/* Preview */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center md:text-right">{t('معاينة الإعلان', 'Ad Preview')}</label>
                        <div className="w-full max-w-[200px] aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 mx-auto md:mx-0 flex items-center justify-center">
                          {popupConfig.image ? (
                            <img src={popupConfig.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400 gap-2">
                              <ImageIcon size={32} />
                              <span className="text-xs">{t('لا توجد صورة', 'No Image')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white shadow-2xl w-full max-w-3xl mx-auto rounded-lg print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none flex flex-col max-h-[90vh] print:h-auto print:max-h-none overflow-hidden">
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible" id="invoice-content">
                
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#b91c1c] font-tajawal">متجر الأناقة (Smart Style)</h1>
                    <p className="text-gray-500 text-sm mt-1">فاتورة بيع</p>
                </div>

                <div className="w-full h-0.5 bg-[#b91c1c] mb-8"></div>

                {/* Info Grid */}
                <div className="flex flex-row justify-between mb-8 font-tajawal" dir="rtl">
                    
                    {/* Order Details (Right) */}
                    <div className="w-1/2 text-right">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm">تفاصيل الطلب</h3>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex">
                                <span className="text-gray-500 w-24">رقم الطلب:</span>
                                <span className="font-bold text-gray-900">#{selectedInvoiceOrder.id}</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-500 w-24">تاريخ الطلب:</span>
                                <span className="font-medium text-gray-900">{new Date(selectedInvoiceOrder.date).toLocaleDateString('en-US')}</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-500 w-24">الحالة:</span>
                                <span className="font-medium text-gray-900">
                                   {t(
                                      STATUSES.find(s => s.value === selectedInvoiceOrder.status)?.labelAr || selectedInvoiceOrder.status, 
                                      STATUSES.find(s => s.value === selectedInvoiceOrder.status)?.labelEn || selectedInvoiceOrder.status
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Details (Left) */}
                    <div className="w-1/2 text-right ltr:text-left pr-4 border-r border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm">بيانات العميل</h3>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex">
                                <span className="text-gray-500 w-16">الاسم:</span>
                                <span className="font-bold text-gray-900">{selectedInvoiceOrder.customerName}</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-500 w-16">الهاتف:</span>
                                <span dir="ltr" className="font-medium text-gray-900">{selectedInvoiceOrder.phoneNumber}</span>
                            </div>
                            <div className="flex">
                                <span className="text-gray-500 w-16">العنوان:</span>
                                <span className="font-medium text-gray-900">{selectedInvoiceOrder.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-8">
                    <table className="w-full text-xs sm:text-sm" dir="rtl">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500">
                                <th className="py-3 text-right font-medium">المنتج</th>
                                <th className="py-3 text-center font-medium">الكمية</th>
                                <th className="py-3 text-center font-medium">سعر الوحدة</th>
                                <th className="py-3 text-left font-medium">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-900">
                            {selectedInvoiceOrder.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-50">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Product Image as requested */}
                                            <img 
                                              src={item.image} 
                                              alt={item.name} 
                                              className="w-10 h-10 rounded-md object-cover border border-gray-100 bg-gray-50" 
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold">{item.name}</span>
                                                {item.selectedSize && (
                                                    <span className="text-gray-400 text-[10px]">{item.selectedSize}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center">{item.quantity}</td>
                                    <td className="py-4 text-center">{item.price} {APP_CURRENCY}</td>
                                    <td className="py-4 text-left font-bold">{item.price * item.quantity} {APP_CURRENCY}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="border-t border-gray-100 pt-6">
                    <div className="flex flex-col gap-2 text-sm max-w-xs mr-auto ml-0" dir="rtl">
                        <div className="flex justify-between text-gray-500">
                            <span>المجموع الفرعي:</span>
                            <span>{(selectedInvoiceOrder.totalAmount).toFixed(2)} {APP_CURRENCY}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>التوصيل:</span>
                            <span>مجاني</span>
                        </div>
                        <div className="flex justify-between text-[#b91c1c] font-bold text-lg mt-2 pt-2 border-t border-gray-100">
                            <span>الإجمالي الكلي:</span>
                            <span>{selectedInvoiceOrder.totalAmount.toFixed(2)} {APP_CURRENCY}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods - Added Section */}
                <div className="mt-12 mb-6">
                    <p className="text-center text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">وسائل الدفع</p>
                    <div className="flex justify-center items-center gap-3 opacity-80 grayscale-[0.3]">
                         <div className="h-6 px-2 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold text-blue-800 italic bg-white">VISA</div>
                         <div className="h-6 px-2 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold text-red-600 bg-white">Mastercard</div>
                         <div className="h-6 px-2 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold text-blue-500 bg-white">mada</div>
                         <div className="h-6 px-2 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold text-black bg-white"> Pay</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-xs mb-1">شكراً لثقتكم بنا!</p>
                    <p className="text-gray-300 text-[10px]">تم إصدار هذه الفاتورة إلكترونياً من نظام Smart Style Store</p>
                </div>
            </div>

            {/* Action Buttons (Hidden on Print) */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center print:hidden">
                <button 
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                    إغلاق
                </button>
                <button 
                    onClick={handlePrintInvoice}
                    className="px-6 py-2 bg-[#b91c1c] text-white rounded-lg hover:bg-red-800 transition-colors font-bold flex items-center gap-2 shadow-lg"
                >
                    <Printer size={18} />
                    طباعة / حفظ
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};