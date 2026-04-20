import { Product } from './types';

export const SEED_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'عباية ملكية فاخرة',
    description: 'عباية من القماش الكريب الياباني الفاخر بتصميم عصري وأنيق يناسب جميع المناسبات الرسمية.',
    price: 550,
    category: 'نساء',
    image: 'https://picsum.photos/seed/abaya1/800/1200'
  },
  {
    name: 'ثوب رجالي قطن فاخر',
    description: 'ثوب رجالي مصنوع من أجود أنواع القطن المصري، يتميز بالراحة ومثالي للأجواء الصيفية.',
    price: 350,
    category: 'رجال',
    image: 'https://picsum.photos/seed/thobe1/800/1200'
  },
  {
    name: 'قفطان مغربي مطرز',
    description: 'قفطان مغربي تقليدي مصنوع يدوياً بلمسات عصرية وخيوط ذهبية أصلية.',
    price: 890,
    category: 'نساء',
    image: 'https://picsum.photos/seed/kaftan1/800/1200'
  },
  {
    name: 'حذاء شرقي "زبيرية" جلد',
    description: 'حذاء شرقي مصنوع يدوياً من الجلد الطبيعي 100% مع نعل مريح للمشي الطويل.',
    price: 240,
    category: 'أحذية',
    image: 'https://picsum.photos/seed/shoes1/800/1200'
  },
  {
    name: 'طقم أطفال "سبورت"',
    description: 'طقم ولادي قطني مكون من قطعتين بتصميم مرح وألوان زاهية.',
    price: 180,
    category: 'أطفال',
    image: 'https://picsum.photos/seed/kids1/800/1200'
  },
  {
    name: 'ساعة يد كلاسيكية',
    description: 'ساعة يد رجالية بقطر 40 مم مع سوار من الجلد الطبيعي مقاومة للماء.',
    price: 420,
    category: 'اكسسوارات',
    image: 'https://picsum.photos/seed/watch1/800/1200'
  }
];
