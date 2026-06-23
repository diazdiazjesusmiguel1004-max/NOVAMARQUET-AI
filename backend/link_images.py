import os
import django

# Load Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Product, ProductImage

def link():
    products = Product.objects.all()
    count = 0
    for p in products:
        if not p.images.exists():
            img_path = None
            cat_slug = p.category.slug if p.category else ''
            brand_slug = p.brand.slug if p.brand else ''
            
            # Handle main manual products by SKU first
            if p.sku == 'CEL-SAM-S25U':
                img_path = 'products/samsung_s25.jpg'
            elif p.sku == 'CEL-APP-I17PM':
                img_path = 'products/iphone_17.jpg'
            elif p.sku == 'LAP-APP-M4MX':
                img_path = 'products/macbook_pro.jpg'
            elif p.sku == 'GAM-SON-PS5P':
                img_path = 'products/ps5_console.jpg'
            elif p.sku == 'MOD-NIK-CAIR':
                img_path = 'products/nike_jacket.jpg'
            elif cat_slug == 'laptops':
                if brand_slug == 'apple':
                    img_path = 'products/macbook_pro.jpg'
                else:
                    img_path = 'products/sony_laptop.jpg'
            elif cat_slug == 'celulares':
                if brand_slug == 'apple':
                    img_path = 'products/iphone_17.jpg'
                else:
                    img_path = 'products/samsung_s25.jpg'
            elif cat_slug == 'tablets':
                img_path = 'products/tablet_generic.jpg'
            elif cat_slug == 'consolas':
                img_path = 'products/ps5_console.jpg'
            elif cat_slug == 'accesorios':
                img_path = 'products/accessory_generic.jpg'
            elif cat_slug in ['hombre', 'mujer']:
                img_path = 'products/nike_jacket.jpg'
            elif cat_slug == 'hogar':
                img_path = 'products/hogar_generic.jpg'
            
            if img_path:
                ProductImage.objects.create(product=p, image=img_path, is_primary=True)
                count += 1
                
    print(f"Linked images for {count} products!")

if __name__ == '__main__':
    link()
