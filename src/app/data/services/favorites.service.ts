import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../../domain/entities/product.entity';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoriteIds = signal<number[]>([]);

  // Computed values
  favoriteProductIds = computed(() => this.favoriteIds());
  favoriteCount = computed(() => this.favoriteIds().length);

  constructor() {
    this.loadFavorites();
    
    // Save favorites to localStorage whenever they change
    effect(() => {
      const favorites = this.favoriteIds();
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });
  }

  private loadFavorites() {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        this.favoriteIds.set(favorites);
      } catch (e) {
        console.error('Error loading favorites from localStorage', e);
        this.clearFavorites();
      }
    }
  }

  addToFavorites(productId: number) {
    this.favoriteIds.update(favorites => {
      if (!favorites.includes(productId)) {
        return [...favorites, productId];
      }
      return favorites;
    });
  }

  removeFromFavorites(productId: number) {
    this.favoriteIds.update(favorites => 
      favorites.filter(id => id !== productId)
    );
  }

  toggleFavorite(productId: number) {
    if (this.isFavorite(productId)) {
      this.removeFromFavorites(productId);
    } else {
      this.addToFavorites(productId);
    }
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds().includes(productId);
  }

  clearFavorites() {
    this.favoriteIds.set([]);
  }
}
