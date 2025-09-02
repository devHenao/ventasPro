import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../data/services/product.service';
import { Product } from '../../../domain/entities/product.entity';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedImageIndex = signal(0);

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    } else {
      this.error.set('ID de producto no válido');
      this.loading.set(false);
    }
  }

  private loadProduct(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product.set(product);
        } else {
          this.error.set('Producto no encontrado');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error.set('Error al cargar el producto');
        this.loading.set(false);
      }
    });
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  addToCart() {
    const currentProduct = this.product();
    if (currentProduct) {
      // Aquí implementarías la lógica del carrito
      console.log('Agregando al carrito:', currentProduct);
      alert(`${currentProduct.name} agregado al carrito`);
    }
  }

  get mainImage() {
    const product = this.product();
    const selectedIndex = this.selectedImageIndex();
    
    if (product?.images && product.images.length > 0) {
      return product.images[selectedIndex] || product.images[0];
    }
    return null;
  }

  get thumbnailImages() {
    const product = this.product();
    return product?.images || [];
  }
}
