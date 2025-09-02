import { Injectable, signal, computed, effect } from '@angular/core';
import { CartState } from '../../domain/interfaces/cart.interface';

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

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartState = signal<CartState>({
    items: [],
    total: 0,
    itemCount: 0
  });

  // Expose state as signals
  items = this.cartState.asReadonly();
  
  // Computed values
  totalItems = computed(() => this.cartState().itemCount);
  cartTotal = computed(() => this.cartState().total);
  cartItems = computed(() => this.cartState().items);

  constructor() {
    this.loadCart();
    
    // Save cart to localStorage whenever it changes
    effect(() => {
      const state = this.cartState();
      localStorage.setItem('cart', JSON.stringify(state));
    });
  }

  private loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        this.cartState.set(cart);
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
        this.clearCart();
      }
    }
  }

  addItem(item: Omit<CartItem, 'quantity'>) {
    this.cartState.update(state => {
      const existingItemIndex = state.items.findIndex(
        i => i.productId === item.productId && i.variantId === item.variantId
      );

      let newItems: CartItem[];
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        newItems = [...state.items];
        const existingItem = newItems[existingItemIndex];
        const newQuantity = existingItem.quantity + 1;
        
        // Don't exceed available stock
        const quantity = Math.min(newQuantity, item.stock);
        
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity
        };
      } else {
        // Add new item with quantity 1
        newItems = [...state.items, { ...item, quantity: 1 }];
      }

      return this.calculateCartTotals(newItems);
    });
  }

  updateItemQuantity(productId: number, variantId: number, quantity: number) {
    if (quantity < 1) {
      this.removeItem(productId, variantId);
      return;
    }

    this.cartState.update(state => {
      const newItems = state.items.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity };
        }
        return item;
      });
      
      return this.calculateCartTotals(newItems);
    });
  }

  removeItem(productId: number, variantId: number) {
    this.cartState.update(state => {
      const newItems = state.items.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      );
      return this.calculateCartTotals(newItems);
    });
  }

  clearCart() {
    this.cartState.set({ items: [], total: 0, itemCount: 0 });
  }

  private calculateCartTotals(items: CartItem[]): CartState {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items,
      total,
      itemCount
    };
  }
}
