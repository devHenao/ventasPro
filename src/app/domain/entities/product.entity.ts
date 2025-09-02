export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  isMain: boolean;
  order?: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  originalPrice?: number;
  stock: number;
  attributes: {
    [key: string]: string;
  };
  isActive: boolean;
}

export interface Product {
  id: number;
  sku?: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  categoryId: number;
  categoryName: string;
  category?: Category; // For backward compatibility
  images?: ProductImage[];
  variants?: ProductVariant[];
  specifications?: {
    [key: string]: string;
  };
  tags?: string[];
  isFeatured?: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ProductFilterOptions {
  categories?: number[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
}

export interface ProductSortOption {
  field: 'name' | 'price' | 'rating' | 'createdAt' | 'popularity';
  direction: 'asc' | 'desc';
  label: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
