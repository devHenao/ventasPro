import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../domain/entities/product.entity';
import { CartService, CartItem } from '../../../data/services/cart.service';
import { FavoritesService } from '../../../data/services/favorites.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  
  @Input() product!: Product;
  
  get mainImage(): string {
    return this.product.images?.find(img => img.isMain)?.url || 
           this.product.images?.[0]?.url ||
           'assets/images/placeholder-product.jpg';
  }
  
  get hasDiscount(): boolean {
    return this.product.variants?.some(v => v.originalPrice && v.originalPrice > v.price) || false;
  }
  
  get currentVariant() {
    return this.product.variants?.[0];
  }
  
  get finalPrice() {
    return this.product.price || 0;
  }
  
  get originalPrice() {
    return this.product.originalPrice;
  }
  
  get discountPercentage() {
    if (!this.originalPrice || this.originalPrice <= this.finalPrice) return 0;
    return Math.round(((this.originalPrice - this.finalPrice) / this.originalPrice) * 100);
  }
  
  addToCart() {
    if ((this.product.stock || 0) <= 0) {
      alert('Producto sin stock disponible');
      return;
    }

    const cartItem: Omit<CartItem, 'quantity'> = {
      productId: this.product.id,
      variantId: this.currentVariant?.id || this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.mainImage,
      sku: this.product.sku || `PROD-${this.product.id}`,
      stock: this.product.stock || 0
    };
    
    this.cartService.addItem(cartItem);
    
    // Show success feedback
    this.showAddToCartFeedback();
  }

  private showAddToCartFeedback() {
    // Simple feedback - could be enhanced with a toast service
    const button = document.querySelector(`[data-product-id="${this.product.id}"] .btn-primary`);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="bi bi-check me-1"></i>¡Agregado!';
      button.classList.add('btn-success');
      button.classList.remove('btn-primary');
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('btn-success');
        button.classList.add('btn-primary');
      }, 1500);
    }
  }

  toggleFavorite() {
    this.favoritesService.toggleFavorite(this.product.id);
    const isFavorite = this.favoritesService.isFavorite(this.product.id);
    console.log(isFavorite ? 'Añadido a favoritos:' : 'Removido de favoritos:', this.product.name);
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product.id);
  }
}
