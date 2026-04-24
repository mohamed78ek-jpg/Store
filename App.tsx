import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/AdminDashboard';
import { AdPopup } from './components/AdPopup';
import { TrackOrder } from './components/TrackOrder';
import { ReportProblem } from './components/ReportProblem';
import { Product, CartItem, ViewState, Language, Order, PopupConfig, OrderStatus, Report } from './types';
import { Search, Mail, Banknote } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<Language>('ar');
  
  // Firebase State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [bannerText, setBannerText] = useState('أهلاً بك في متجر الأناقة - شحن مجاني للطلبات فوق 500 د.م');
  const [popupConfig, setPopupConfig] = useState<PopupConfig>({ isActive: false, image: '' });

  const [showAdPopup, setShowAdPopup] = useState(false);
  const [isManualAdmin, setIsManualAdmin] = useState(false);

  // isAdminUser now depends on manual login state
  const isAdminUser = useMemo(() => {
    return isManualAdmin;
  }, [isManualAdmin]);

  // Firestore Data Listeners
  useEffect(() => {
    // Public Listeners
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Auto-Cleanup: If there are legacy products with numeric IDs 1-5, remove them once.
      const legacyMockIds = ['1', '2', '3', '4', '5'];
      const mocksToDelete = data.filter(p => legacyMockIds.includes(p.id));
      
      if (mocksToDelete.length > 0) {
        const batch = writeBatch(db);
        mocksToDelete.forEach(p => {
          batch.delete(doc(db, 'products', p.id));
        });
        batch.commit().catch(err => console.error("Cleanup failed", err));
      }

      setProducts(data.filter(p => !legacyMockIds.includes(p.id)));
    }, (error) => {
      console.error("Products listener error:", error);
    });

    const unsubConfig = onSnapshot(doc(db, 'siteConfig', 'global'), (doc) => {
      if (doc.exists()) {
        const config = doc.data();
        if (config.bannerText) setBannerText(config.bannerText);
        if (config.popupConfig) setPopupConfig(config.popupConfig);
      }
    }, (error) => {
      console.error("Config listener error:", error);
    });

    // Admin-Only Listeners
    let unsubOrders: (() => void) | null = null;
    let unsubReports: (() => void) | null = null;

    if (isAdminUser) {
      unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      }, (error) => {
        console.error("Orders listener error:", error);
      });

      unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
      }, (error) => {
        console.error("Reports listener error:", error);
      });
    } else {
      // Clear sensitive data for non-admins
      setOrders([]);
      setReports([]);
    }

    return () => {
      unsubProducts();
      unsubConfig();
      if (unsubOrders) unsubOrders();
      if (unsubReports) unsubReports();
    };
  }, [isAdminUser]);

  // Handle Direction and Language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Show Popup if active
  useEffect(() => {
    if (popupConfig.isActive && popupConfig.image) {
      setShowAdPopup(true);
    } else {
      setShowAdPopup(false);
    }
  }, [popupConfig.isActive, popupConfig.image]);

  // Translation helper
  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  // Extract unique categories from products state
  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category);
    return ['All', ...new Set(allCategories)];
  }, [products]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return t('الكل', 'All');
      case 'رجال': return t('رجال', 'Men');
      case 'أطفال': return t('أطفال', 'Children');
      case 'أحذية': return t('أحذية', 'Shoes');
      case 'اكسسوارات': return t('اكسسوارات', 'Accessories');
      default: return cat;
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    const query = (searchQuery || '').trim().toLowerCase();
    if (query) {
      result = result.filter(p => {
        const name = (p.name || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }
    return result;
  }, [selectedCategory, searchQuery, language, products]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = (product: Product, size?: string) => {
    const cartId = `${product.id}-${size || 'default'}`;
    const priceToUse = product.discountPrice || product.price;

    setCart(prev => {
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item => 
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        ...product, 
        price: priceToUse,
        quantity: 1, 
        selectedSize: size,
        cartId: cartId 
      }];
    });
    
    const sizeMsg = size ? ` (${size})` : '';
    showNotification(t(`تم إضافة "${product.name}${sizeMsg}" للسلة`, `Added "${product.name}${sizeMsg}" to cart`));
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const handlePlaceOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const orderId = Math.floor(1000000 + Math.random() * 9000000).toString();
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      setCart([]); 
      showNotification(t(`تم إرسال طلبك بنجاح! رقم الطلب: ${orderId}`, `Order placed successfully! Order ID: ${orderId}`));
      setCurrentView(ViewState.HOME);
    } catch (error: any) {
      showNotification(t('فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.', 'Failed to place order. Please try again.'));
    }
  };

  const handleReportSubmit = async (reportData: Omit<Report, 'id' | 'date' | 'isRead'>) => {
    const reportId = Date.now().toString();
    const newReport: Report = {
      ...reportData,
      id: reportId,
      date: new Date().toISOString(),
      isRead: false
    };
    try {
      await setDoc(doc(db, 'reports', reportId), newReport);
      showNotification(t('تم إرسال بلاغك بنجاح', 'Report submitted successfully'));
    } catch (error: any) {
      showNotification(t('فشل في إرسال البلاغ', 'Failed to submit report'));
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      showNotification(t('تم حذف البلاغ', 'Report deleted'));
    } catch (error: any) {
      showNotification(t('فشل في حذف البلاغ', 'Failed to delete report'));
    }
  };

  // Admin Functions
  const handleAddProduct = async (productData: Product) => {
    try {
      await setDoc(doc(db, 'products', productData.id), productData);
      setProducts(prev => [...prev, productData]); // Optimistic update
      showNotification(t('تم إضافة المنتج بنجاح', 'Product added successfully'));
    } catch (error: any) {
      console.error("Add product error:", error);
      showNotification(t('فشل في إضافة المنتج', 'Failed to add product'));
    }
  };

  const handleRemoveProduct = async (id: string) => {
    if (!id) return;
    try {
      // Optimistic update
      setProducts(prev => prev.filter(p => p.id !== id));
      await deleteDoc(doc(db, 'products', id));
      setCart(prev => prev.filter(item => item.id !== id));
      showNotification(t('تم حذف المنتج بنجاح نهائياً', 'Product deleted permanently'));
    } catch (error: any) {
      console.error("Delete product error:", error);
      showNotification(t('فشل في حذف المنتج', 'Failed to delete product'));
    }
  };

  const handleClearAllProducts = async () => {
    if (products.length === 0) {
      showNotification(t('لا يوجد منتجات لحذفها', 'No products to delete'));
      return;
    }
    
    try {
      // Optimistic update
      const currentProducts = [...products];
      setProducts([]);
      setCart([]);

      const batch = writeBatch(db);
      currentProducts.forEach((product) => {
        batch.delete(doc(db, 'products', product.id));
      });
      
      await batch.commit();
      showNotification(t('تم حذف جميع المنتجات بنجاح', 'All products deleted successfully'));
    } catch (error: any) {
      console.error("Clear all products error:", error);
      showNotification(t('فشل في حذف المنتجات', 'Failed to delete products'));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      showNotification(t('تم تحديث حالة الطلب بنجاح', 'Order status updated successfully'));
    } catch (error: any) {
      showNotification(t('فشل في تحديث حالة الطلب', 'Failed to update order status'));
    }
  };

  const handleRemoveOrder = async (id: string) => {
    try {
      setOrders(prev => prev.filter(o => o.id !== id));
      await deleteDoc(doc(db, 'orders', id));
      showNotification(t('تم حذف الطلب بنجاح', 'Order deleted successfully'));
    } catch (error: any) {
      showNotification(t('فشل في حذف الطلب', 'Failed to delete order'));
    }
  };

  const handleUpdateBannerText = async (text: string) => {
    try {
      await setDoc(doc(db, 'siteConfig', 'global'), { bannerText: text }, { merge: true });
    } catch (error) {
      console.error("Failed to update banner text");
    }
  };

  const handleUpdatePopupConfig = async (config: PopupConfig) => {
    try {
      await setDoc(doc(db, 'siteConfig', 'global'), { popupConfig: config }, { merge: true });
    } catch (error) {
      console.error("Failed to update popup config");
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.ADMIN:
        return (
          <AdminDashboard 
            products={products}
            orders={orders}
            reports={reports}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            onClearAllProducts={handleClearAllProducts}
            language={language}
            bannerText={bannerText}
            onUpdateBannerText={handleUpdateBannerText}
            popupConfig={popupConfig}
            onUpdatePopupConfig={handleUpdatePopupConfig}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRemoveOrder={handleRemoveOrder}
            onDeleteReport={handleDeleteReport}
            isAuthenticated={isManualAdmin}
            onLogin={setIsManualAdmin}
          />
        );
      case ViewState.CART:
        return (
          <Cart 
            items={cart} 
            onRemove={handleRemoveFromCart} 
            onUpdateQuantity={handleUpdateQuantity}
            onBack={() => setCurrentView(ViewState.HOME)}
            onPlaceOrder={handlePlaceOrder}
            language={language}
          />
        );
      case ViewState.TRACK_ORDER:
        return (
          <TrackOrder 
            orders={orders}
            onBack={() => setCurrentView(ViewState.HOME)}
            language={language}
          />
        );
      case ViewState.REPORT_PROBLEM:
        return (
          <ReportProblem 
            onSubmit={handleReportSubmit}
            onBack={() => setCurrentView(ViewState.HOME)}
            language={language}
          />
        );
      case ViewState.HOME:
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {t('أحدث التشكيلات', 'Latest Collections')} <span className="text-emerald-600">{t('العصرية', 'Modern')}</span>
              </h1>
              <p className="max-w-xl mx-auto text-lg text-gray-500 mb-8">
                {t('اكتشف تصاميم فريدة تجمع بين الأناقة والراحة، مختارة بعناية لتناسب ذوقك الرفيع.', 'Discover unique designs that combine elegance and comfort, carefully selected to suit your refined taste.')}
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-emerald-200'
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-4 lg:gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                  language={language}
                />
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                     <Search size={48} className="text-gray-200" />
                     <p>{t('لا توجد منتجات تطابق بحثك.', 'No products found matching your search.')}</p>
                     {(selectedCategory !== 'All' || searchQuery) && (
                       <button 
                         onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                         className="text-emerald-600 hover:text-emerald-700 font-bold text-sm"
                       >
                         {t('عرض كل المنتجات', 'Show all products')}
                       </button>
                     )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-gray-50 pb-0 font-${language === 'ar' ? 'tajawal' : 'sans'} flex flex-col`}
    >
      {/* Top Banner */}
      {bannerText && (
        <div className="bg-gray-900 text-white h-[44px] flex items-center justify-center overflow-hidden relative z-40 w-full">
          <div className="max-w-[999px] w-full mx-auto overflow-hidden">
             <div className="animate-marquee inline-block whitespace-nowrap text-sm font-bold tracking-wide w-full text-center">
               <span className="px-4">{bannerText}</span>
             </div>
          </div>
        </div>
      )}

      <Navbar 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        language={language}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onChangeView={setCurrentView}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Ad Popup */}
      <AdPopup 
        isOpen={showAdPopup && currentView === ViewState.HOME} 
        onClose={() => setShowAdPopup(false)} 
        image={popupConfig.image} 
      />
      
      <main className="transition-all duration-500 ease-in-out flex-grow pb-12">
        {renderContent()}
      </main>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 transform translate-x-1/2 sm:translate-x-0 sm:left-8 sm:bottom-8 z-[200] animate-fade-in-up">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            {notification}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-start">
            
            {/* Contact Section */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-lg text-gray-900 mb-6 border-b-2 border-emerald-500 pb-2 inline-block">
                {t('تواصل معنا', 'Contact Us')}
              </h3>
              <div className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 w-full md:w-auto justify-center md:justify-start">
                <Mail size={20} />
                <a href="mailto:mohamedrbani9@gmail.com" dir="ltr" className="font-medium">mohamedrbani9@gmail.com</a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col items-center">
                <h3 className="font-bold text-lg text-gray-900 mb-6 border-b-2 border-emerald-500 pb-2 inline-block">
                  {t('وسائل الدفع', 'Payment Methods')}
                </h3>
                <div className="flex flex-wrap justify-center gap-3 max-w-sm">
                  <div className="h-10 px-4 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-black text-blue-900 italic shadow-sm">VISA</div>
                  <div className="h-10 px-4 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-bold text-red-600 shadow-sm">Mastercard</div>
                  <div className="h-10 px-4 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-bold text-blue-500 shadow-sm">mada</div>
                  <div className="h-10 px-4 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-medium text-black shadow-sm"> Pay</div>
                  <div className="h-10 px-4 rounded-lg border border-gray-200 bg-white flex items-center justify-center font-bold text-blue-700 shadow-sm">PayPal</div>
                  <div className="h-10 px-4 rounded-lg border border-gray-200 bg-emerald-50 flex items-center justify-center font-bold text-emerald-700 text-xs shadow-sm gap-2">
                    <Banknote size={16} />
                    {t('عند الاستلام', 'Cash on Delivery')}
                  </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center md:items-end">
                <h3 className="font-bold text-lg text-gray-900 mb-6 border-b-2 border-emerald-500 pb-2 inline-block">
                  {t('روابط سريعة', 'Quick Links')}
                </h3>
                <div className="flex flex-col gap-3 text-gray-500 w-full md:w-auto items-center md:items-end">
                  <button onClick={() => setCurrentView(ViewState.HOME)} className="hover:text-emerald-600 transition-colors hover:translate-x-1 duration-200">{t('الرئيسية', 'Home')}</button>
                  <button onClick={() => {}} className="hover:text-emerald-600 transition-colors hover:translate-x-1 duration-200">{t('من نحن', 'About Us')}</button>
                  <button onClick={() => {}} className="hover:text-emerald-600 transition-colors hover:translate-x-1 duration-200">{t('سياسة الخصوصية', 'Privacy Policy')}</button>
                </div>
            </div>

          </div>
          
          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 {t('متجر الأناقة. جميع الحقوق محفوظة.', 'Al-Anaka Store. All rights reserved.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;