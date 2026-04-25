import React, { useState } from 'react';
import { Product, Language } from '../types';
import { APP_CURRENCY } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size?: string) => void;
  language: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, language }) => {
  // ... existing code ...
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  // Determine prices
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : null;

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 h-full">
      
      {/* Image Container */}
      <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden mb-1.5 sm:mb-2 bg-gray-50 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        {hasDiscount && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
             {t('خصم', 'Sale')} {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}%
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center text-center px-0.5 pb-0.5">
        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 line-clamp-1 mb-1 sm:mb-2 font-tajawal w-full">
          {product.name}
        </h3>

        {/* Size Selection - Direct Display */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mb-1.5 sm:mb-2 w-full">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  min-w-[18px] sm:min-w-[28px] h-[18px] sm:h-[28px] px-0.5 sm:px-1 flex items-center justify-center text-[7px] sm:text-[10px] font-bold rounded-md border transition-all duration-200
                  ${selectedSize === size 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-500'}
                `}
              >
                {size}
              </button>
            ))}
          </div>
        )}
        
        <div className="mt-auto mb-1.5 sm:mb-2 flex flex-col items-center justify-center gap-0">
          {originalPrice && (
            <span className="text-gray-400 line-through text-[9px] sm:text-xs font-bold font-sans opacity-60">
              {APP_CURRENCY} {originalPrice}
            </span>
          )}
          <span className={`text-sm sm:text-lg md:text-xl font-black font-sans tracking-tight ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
            {APP_CURRENCY} {currentPrice}
          </span>
        </div>

        {/* Action Area */}
        <div className="w-full h-[28px] sm:h-[42px]">
            <button
              onClick={handleAddToCart}
              className="w-full h-full bg-[#22c55e] hover:bg-emerald-600 text-white text-[10px] sm:text-sm md:text-base font-bold rounded-lg sm:rounded-full transition-colors shadow-sm active:scale-95 font-tajawal flex items-center justify-center"
            >
              {t('أضف لسلة', 'Add to Cart')}
            </button>
        </div>
      </div>
    </div>
  );
};
