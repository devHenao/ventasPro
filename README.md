# VentasPro - Sistema de Gestión de Ventas

Sistema de gestión de ventas desarrollado con Angular 19, que incluye zona pública de productos y panel administrativo para gestión de productos y categorías.

## Características

### Zona Pública
- **Catálogo de productos** con búsqueda, filtros y paginación
- **Carrito de compras** funcional
- **Detalle de productos** con imágenes y especificaciones
- **Diseño responsivo** con Bootstrap 5.3.8

### Panel Administrativo
- **Dashboard** con métricas y resumen
- **CRUD de productos** completo
- **CRUD de categorías** completo
- **Autenticación** con guards y sesiones
- **Interfaz limpia** sin elementos de la zona pública

## Tecnologías

- **Angular 19** con Standalone Components
- **TypeScript** con sintaxis moderna
- **Angular Signals** para manejo de estado
- **Bootstrap 5.3.8** para diseño responsivo
- **Bootstrap Icons** para iconografía
- **RxJS** para programación reactiva

## Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd ventasPro

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve
```

## Credenciales de Prueba

```
Email: srendon@ofima.com
Password: 123456
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── data/                    # Servicios y guards
│   ├── domain/                  # Entidades y interfaces
│   ├── infrastructure/          # Repositorios (preparado para futuro)
│   └── presentation/            # Componentes y páginas
│       ├── components/          # Componentes reutilizables
│       │   └── layout/          # Layouts (MainLayout, AdminLayout)
│       └── pages/               # Páginas principales
│           ├── home/            # Zona pública
│           ├── dashboard/       # Panel administrativo
│           └── login/           # Autenticación
└── assets/                      # Recursos estáticos
    └── data/                    # Datos mock (JSON)
```

## 🌐 Rutas

### Zona Pública
- `/` → Redirecciona a `/home`
- `/home` → Catálogo de productos
- `/product/:id` → Detalle de producto

### Autenticación
- `/login` → Página de login

### Panel Administrativo
- `/admin/dashboard` → Dashboard principal
- `/dashboard` → Redirecciona a `/admin/dashboard`

## 🎨 Características Técnicas

### Angular 19 Features
- **Standalone Components** - Sin módulos tradicionales
- **Nueva sintaxis de control** - `@if`, `@else`, `@for`
- **Angular Signals** - Manejo de estado reactivo
- **OnPush Change Detection** - Optimización de rendimiento

### Arquitectura
- **Clean Architecture** - Separación por capas
- **Lazy Loading** - Carga diferida de rutas
- **Guards** - Protección de rutas privadas
- **Services** - Lógica de negocio centralizada

### UI/UX
- **Diseño responsivo** - Funciona en todos los dispositivos
- **Componentes reutilizables** - Modularidad y mantenibilidad
- **Layouts separados** - Zona pública vs administrativa
- **Feedback visual** - Estados de carga y errores

## 🔧 Scripts Disponibles

```bash
# Desarrollo
ng serve                 # Servidor de desarrollo
ng build                 # Build de producción
ng test                  # Tests unitarios
ng lint                  # Linting del código

# Generación de componentes
ng generate component nombre
ng generate service nombre
ng generate guard nombre
```

## 📝 Notas de Desarrollo

- **Mock Data**: Actualmente usa datos JSON estáticos en `assets/data/`
- **Backend**: Preparado para integración con API REST
- **Autenticación**: Sistema básico con localStorage
- **Responsive**: Optimizado para móviles y desktop

## 🚀 Deploy

El proyecto está listo para deploy en cualquier servidor web estático:

```bash
ng build --configuration production
# Los archivos estarán en dist/ventasPro/
```

## 👨‍💻 Autor

Desarrollado para el sistema de gestión de ventas VentasPro.
