export interface CartItem {
  productId: number;
  variantId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku: string;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
