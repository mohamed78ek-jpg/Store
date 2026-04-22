import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "طقم رجالي كاجوال",
    price: 450,
    discountPrice: 380,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
    category: "رجال",
    description: "طقم صيفي مريح وعصري مناسب لجميع المناسبات",
    sizes: ["M", "L", "XL"]
  },
  {
    id: "2",
    name: "فستان أطفال ناعم",
    price: 250,
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop",
    category: "أطفال",
    description: "فستان قطني عالي الجودة للأطفال",
    sizes: ["2Y", "4Y", "6Y"]
  },
  {
    id: "3",
    name: "حذاء رياضي عصري",
    price: 550,
    discountPrice: 420,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    category: "أحذية",
    description: "حذاء رياضي خفيف الوزن ومريح للمشي والجري",
    sizes: ["40", "41", "42", "43"]
  },
  {
    id: "4",
    name: "ساعة فاخرة",
    price: 900,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop",
    category: "اكسسوارات",
    description: "ساعة يد أنيقة تناسب جميع الأذواق",
    sizes: ["Oversize"]
  },
  {
    id: "5",
    name: "قميص صيفي مخطط",
    price: 180,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
    category: "رجال",
    description: "قميص خفيف ومريح للأجواء الحارة",
    sizes: ["S", "M", "L"]
  }
];

export const APP_CURRENCY = "د.م";