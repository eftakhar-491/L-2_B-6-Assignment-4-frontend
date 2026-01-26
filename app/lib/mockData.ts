export interface Category {
  id: string
  name: string
  icon: string
}

export interface Meal {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  providerId: string
  providerName: string
  rating: number
  reviews: number
  dietary?: string[]
  preparationTime: number
}

export interface Provider {
  id: string
  name: string
  description: string
  image: string
  rating: number
  reviews: number
  deliveryTime: string
  deliveryFee: number
  categories: string[]
}

export interface Order {
  id: string
  customerId: string
  providerId: string
  items: { mealId: string; name: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
  deliveryAddress: string
  createdAt: Date
  estimatedDelivery?: Date
}

export interface Review {
  id: string
  mealId: string
  customerId: string
  rating: number
  comment: string
  createdAt: Date
}

export const categories: Category[] = [
  { id: '1', name: 'Italian', icon: '🍝' },
  { id: '2', name: 'Chinese', icon: '🥡' },
  { id: '3', name: 'Indian', icon: '🍛' },
  { id: '4', name: 'Mexican', icon: '🌮' },
  { id: '5', name: 'Japanese', icon: '🍣' },
  { id: '6', name: 'American', icon: '🍔' },
  { id: '7', name: 'Thai', icon: '🍲' },
  { id: '8', name: 'Mediterranean', icon: '🥙' },
]

export const providers: Provider[] = [
  {
    id: '1',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizzas and pasta made fresh daily',
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&h=600&fit=crop',
    rating: 4.8,
    reviews: 324,
    deliveryTime: '30-45 min',
    deliveryFee: 2.99,
    categories: ['Italian'],
  },
  {
    id: '2',
    name: 'Dragon House',
    description: 'Authentic Chinese cuisine with premium ingredients',
    image: 'https://images.unsplash.com/photo-1585521537198-b9c66d4cdfa0?w=800&h=600&fit=crop',
    rating: 4.6,
    reviews: 287,
    deliveryTime: '25-40 min',
    deliveryFee: 2.99,
    categories: ['Chinese'],
  },
  {
    id: '3',
    name: 'Spice Route',
    description: 'Traditional Indian spices and bold flavors',
    image: 'https://images.unsplash.com/photo-1596040423813-ba181cd1301c?w=800&h=600&fit=crop',
    rating: 4.7,
    reviews: 412,
    deliveryTime: '35-50 min',
    deliveryFee: 3.99,
    categories: ['Indian'],
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    description: 'Fresh Mexican street food with vibrant flavors',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
    rating: 4.5,
    reviews: 198,
    deliveryTime: '20-35 min',
    deliveryFee: 1.99,
    categories: ['Mexican'],
  },
  {
    id: '5',
    name: 'Sushi Paradise',
    description: 'Premium sushi and Japanese specialties',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    rating: 4.9,
    reviews: 356,
    deliveryTime: '30-45 min',
    deliveryFee: 4.99,
    categories: ['Japanese'],
  },
]

export const meals: Meal[] = [
  // Pizza Palace
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and fresh basil',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=400&fit=crop',
    category: 'Italian',
    providerId: '1',
    providerName: 'Pizza Palace',
    rating: 4.8,
    reviews: 145,
    dietary: ['vegetarian'],
    preparationTime: 20,
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Loaded with premium pepperoni and melted cheese',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=600&h=400&fit=crop',
    category: 'Italian',
    providerId: '1',
    providerName: 'Pizza Palace',
    rating: 4.9,
    reviews: 203,
    preparationTime: 20,
  },
  {
    id: '3',
    name: 'Pasta Carbonara',
    description: 'Creamy bacon and parmesan pasta with fresh eggs',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221fcf4f?w=600&h=400&fit=crop',
    category: 'Italian',
    providerId: '1',
    providerName: 'Pizza Palace',
    rating: 4.7,
    reviews: 98,
    preparationTime: 15,
  },
  // Dragon House
  {
    id: '4',
    name: 'Kung Pao Chicken',
    description: 'Tender chicken with peanuts, peppers, and soy sauce',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1585521537198-b9c66d4cdfa0?w=600&h=400&fit=crop',
    category: 'Chinese',
    providerId: '2',
    providerName: 'Dragon House',
    rating: 4.6,
    reviews: 167,
    preparationTime: 15,
  },
  {
    id: '5',
    name: 'Mapo Tofu',
    description: 'Silky tofu in spicy red chili sauce with ground pork',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    category: 'Chinese',
    providerId: '2',
    providerName: 'Dragon House',
    rating: 4.5,
    reviews: 112,
    dietary: ['vegetarian'],
    preparationTime: 18,
  },
  {
    id: '6',
    name: 'Fried Rice',
    description: 'Fluffy rice with egg, vegetables, and your choice of protein',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1606283829523-fc5db32f45f5?w=600&h=400&fit=crop',
    category: 'Chinese',
    providerId: '2',
    providerName: 'Dragon House',
    rating: 4.4,
    reviews: 89,
    dietary: ['vegetarian'],
    preparationTime: 12,
  },
  // Spice Route
  {
    id: '7',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich tomato and cream sauce with aromatic spices',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1596040423813-ba181cd1301c?w=600&h=400&fit=crop',
    category: 'Indian',
    providerId: '3',
    providerName: 'Spice Route',
    rating: 4.8,
    reviews: 234,
    preparationTime: 20,
  },
  {
    id: '8',
    name: 'Paneer Tikka',
    description: 'Marinated cottage cheese cubes grilled with peppers and onions',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1585521537198-b9c66d4cdfa0?w=600&h=400&fit=crop',
    category: 'Indian',
    providerId: '3',
    providerName: 'Spice Route',
    rating: 4.7,
    reviews: 156,
    dietary: ['vegetarian'],
    preparationTime: 18,
  },
  {
    id: '9',
    name: 'Biryani Rice',
    description: 'Fragrant basmati rice with meat, vegetables, and Indian spices',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1585937421506-34d2f0ccccb8?w=600&h=400&fit=crop',
    category: 'Indian',
    providerId: '3',
    providerName: 'Spice Route',
    rating: 4.9,
    reviews: 198,
    preparationTime: 25,
  },
  // Taco Fiesta
  {
    id: '10',
    name: 'Carne Asada Tacos',
    description: 'Grilled marinated beef with cilantro, onion, and lime',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop',
    category: 'Mexican',
    providerId: '4',
    providerName: 'Taco Fiesta',
    rating: 4.7,
    reviews: 145,
    preparationTime: 12,
  },
  {
    id: '11',
    name: 'Vegetable Burrito',
    description: 'Filled with beans, rice, vegetables, and cheese',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1571407614519-71237979b471?w=600&h=400&fit=crop',
    category: 'Mexican',
    providerId: '4',
    providerName: 'Taco Fiesta',
    rating: 4.6,
    reviews: 98,
    dietary: ['vegetarian'],
    preparationTime: 10,
  },
  // Sushi Paradise
  {
    id: '12',
    name: 'California Roll',
    description: 'Crab, avocado, and cucumber wrapped in seasoned rice and nori',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop',
    category: 'Japanese',
    providerId: '5',
    providerName: 'Sushi Paradise',
    rating: 4.8,
    reviews: 178,
    preparationTime: 15,
  },
  {
    id: '13',
    name: 'Spicy Tuna Roll',
    description: 'Tuna with spicy mayo, cucumber, and jalapeno',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop',
    category: 'Japanese',
    providerId: '5',
    providerName: 'Sushi Paradise',
    rating: 4.9,
    reviews: 156,
    preparationTime: 18,
  },
]
