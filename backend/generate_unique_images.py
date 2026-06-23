import os
import django

# Load Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Product, ProductImage
from PIL import Image

# Directory setup
MEDIA_DIR = os.path.join(os.path.dirname(__file__), 'media')
PRODUCTS_DIR = os.path.join(MEDIA_DIR, 'products')
GENERATED_DIR = os.path.join(PRODUCTS_DIR, 'generated')
os.makedirs(GENERATED_DIR, exist_ok=True)

def shift_hue(image, shift_amount):
    # Convert image to HSV
    hsv = image.convert('HSV')
    h, s, v = hsv.split()
    # Shift hue channel
    new_h = h.point(lambda p: (p + shift_amount) % 256)
    # Merge back and convert to RGB
    new_hsv = Image.merge('HSV', (new_h, s, v))
    return new_hsv.convert('RGB')

def generate():
    products = Product.objects.all()
    print(f"Generating unique clean 3D render variations for {products.count()} products...")
    
    for idx, p in enumerate(products):
        cat_slug = p.category.slug if p.category else ''
        brand_slug = p.brand.slug if p.brand else ''
        
        # Decide template image
        template_name = None
        if p.sku == 'CEL-SAM-S25U':
            template_name = 'samsung_s25.jpg'
        elif p.sku == 'CEL-APP-I17PM':
            template_name = 'iphone_17.jpg'
        elif p.sku == 'LAP-APP-M4MX':
            template_name = 'macbook_pro.jpg'
        elif p.sku == 'GAM-SON-PS5P':
            template_name = 'ps5_console.jpg'
        elif p.sku == 'MOD-NIK-CAIR':
            template_name = 'nike_jacket.jpg'
        elif cat_slug == 'laptops':
            if brand_slug == 'apple':
                template_name = 'macbook_pro.jpg'
            else:
                template_name = 'sony_laptop.jpg'
        elif cat_slug == 'celulares':
            if brand_slug == 'apple':
                template_name = 'iphone_17.jpg'
            else:
                template_name = 'samsung_s25.jpg'
        elif cat_slug == 'tablets':
            template_name = 'tablet_generic.jpg'
        elif cat_slug == 'consolas':
            template_name = 'ps5_console.jpg'
        elif cat_slug == 'accesorios':
            template_name = 'accessory_generic.jpg'
        elif cat_slug in ['hombre', 'mujer']:
            template_name = 'nike_jacket.jpg'
        elif cat_slug == 'hogar':
            template_name = 'hogar_generic.jpg'
            
        if not template_name:
            template_name = 'tablet_generic.jpg' # fallback
            
        template_path = os.path.join(PRODUCTS_DIR, template_name)
        if not os.path.exists(template_path):
            print(f"Template not found: {template_path}")
            continue
            
        # Open template
        img = Image.open(template_path)
        # Resize to 350x350 for fast loading
        img = img.resize((350, 350), Image.Resampling.LANCZOS)
        
        # Apply unique hue shift if it's a programmatic product
        is_hero = p.sku in ['CEL-SAM-S25U', 'CEL-APP-I17PM', 'LAP-APP-M4MX', 'GAM-SON-PS5P', 'MOD-NIK-CAIR']
        if not is_hero:
            # Shift hue based on product index (0 to 255)
            shift_amount = (idx * 13) % 256
            img = shift_hue(img, shift_amount)
            
        # Save as generated filename
        dest_filename = f"{p.slug}.jpg"
        dest_path = os.path.join(GENERATED_DIR, dest_filename)
        img.save(dest_path, "JPEG", quality=85)
        
        # Link in Django DB using local media file path
        p.images.all().delete()
        ProductImage.objects.create(product=p, image=f"products/generated/{dest_filename}", is_primary=True)
        
        if (idx + 1) % 100 == 0:
            print(f"Processed {idx + 1}/{products.count()} products...")
            
    print("Done generating all unique 3D render images!")

if __name__ == '__main__':
    generate()
