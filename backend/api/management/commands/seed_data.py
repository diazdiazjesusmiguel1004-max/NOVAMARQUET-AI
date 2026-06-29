from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
import random
import decimal

from api.models import (
    Category, Brand, Product, ProductImage, Cart, Wishlist,
    Address, Coupon, Order, OrderItem, Payment, Review,
    UserActivityLog, ProductAnalytic, Notification
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds sample data for the NOVAMARQUET-AI platform including users, products, sales, and activity logs.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Iniciando la siembra de datos de NOVAMARQUET-AI..."))
        
        try:
            with transaction.atomic():
                # 1. Clean existing records
                self.stdout.write("Limpiando base de datos existente...")
                UserActivityLog.objects.all().delete()
                Notification.objects.all().delete()
                Review.objects.all().delete()
                OrderItem.objects.all().delete()
                Payment.objects.all().delete()
                Order.objects.all().delete()
                Cart.objects.all().delete()
                Wishlist.objects.all().delete()
                Address.objects.all().delete()
                Coupon.objects.all().delete()
                ProductAnalytic.objects.all().delete()
                ProductImage.objects.all().delete()
                Product.objects.all().delete()
                Brand.objects.all().delete()
                Category.objects.all().delete()
                # Delete all users
                User.objects.all().delete()

                # 2. Create Users
                self.stdout.write("Creando roles de usuarios (Administrador, Vendedor, Cliente)...")
                
                admin_user = User.objects.create_superuser(
                    username='admin',
                    email='admin@novamarquet.com',
                    password='admin123',
                    role='admin',
                    first_name='Admin',
                    last_name='Novamarquet',
                    phone='+51 987654321'
                )
                
                seller_user = User.objects.create_user(
                    username='seller',
                    email='seller@novamarquet.com',
                    password='seller123',
                    role='seller',
                    first_name='Vendedor',
                    last_name='Socio',
                    phone='+51 912345678'
                )

                seller_juan = User.objects.create_user(
                    username='juan',
                    email='juan@novamarquet.com',
                    password='juan123',
                    role='seller',
                    first_name='Tienda Juan',
                    last_name='Market',
                    phone='+51 911223344'
                )

                seller_pedro = User.objects.create_user(
                    username='pedro',
                    email='pedro@novamarquet.com',
                    password='pedro123',
                    role='seller',
                    first_name='Tienda Pedro',
                    last_name='Electro',
                    phone='+51 922334455'
                )

                seller_carlos = User.objects.create_user(
                    username='carlos',
                    email='carlos@novamarquet.com',
                    password='carlos123',
                    role='seller',
                    first_name='Tienda Carlos',
                    last_name='Fashion',
                    phone='+51 933445566'
                )

                sellers_pool = [seller_user, seller_juan, seller_pedro, seller_carlos]

                client_user = User.objects.create_user(
                    username='client',
                    email='client@gmail.com',
                    password='client123',
                    role='client',
                    first_name='Juan',
                    last_name='Pérez',
                    phone='+51 999888777'
                )

                # 3. Create Categories
                self.stdout.write("Creando categorías y subcategorías...")
                
                electronica = Category.objects.create(name="Electrónica", slug="electronica", icon="Tv")
                laptops = Category.objects.create(name="Laptops", slug="laptops", parent=electronica, icon="Laptop")
                celulares = Category.objects.create(name="Celulares", slug="celulares", parent=electronica, icon="Smartphone")
                tablets = Category.objects.create(name="Tablets", slug="tablets", parent=electronica, icon="Tablet")

                moda = Category.objects.create(name="Moda", slug="moda", icon="Shirt")
                hombre = Category.objects.create(name="Hombre", slug="hombre", parent=moda, icon="User")
                mujer = Category.objects.create(name="Mujer", slug="mujer", parent=moda, icon="UserRound")

                gaming = Category.objects.create(name="Gaming", slug="gaming", icon="Gamepad")
                consolas = Category.objects.create(name="Consolas", slug="consolas", parent=gaming, icon="Dpad")
                accesorios = Category.objects.create(name="Accesorios", slug="accesorios", parent=gaming, icon="Mouse")

                hogar = Category.objects.create(name="Hogar", slug="hogar", icon="Home")

                # 4. Create Brands
                self.stdout.write("Creando marcas...")
                samsung = Brand.objects.create(name="Samsung", slug="samsung")
                apple = Brand.objects.create(name="Apple", slug="apple")
                sony = Brand.objects.create(name="Sony", slug="sony")
                nike = Brand.objects.create(name="Nike", slug="nike")

                # 5. Create Products
                self.stdout.write("Creando catálogo de productos...")
                
                p1 = Product.objects.create(
                    name="Celular Samsung Galaxy S25 Ultra",
                    slug="samsung-galaxy-s25-ultra",
                    sku="CEL-SAM-S25U",
                    description="El nuevo Samsung Galaxy S25 Ultra revoluciona el mercado móvil con su procesador Snapdragon 8 Gen 5, cámara de 200MP con IA mejorada, pantalla Dynamic AMOLED 2X de 6.9 pulgadas y lápiz óptico S-Pen integrado. Ideal para productividad y fotografía avanzada.",
                    price=4999.00,
                    offer_price=4599.00,
                    stock=15,
                    brand=samsung,
                    category=celulares,
                    seller=seller_juan,
                    colors=["Titanium Gray", "Titanium Black", "Titanium Yellow"],
                    sizes=["256GB", "512GB", "1TB"],
                    is_featured=True
                )
                ProductImage.objects.create(product=p1, image='products/samsung_s25.jpg', is_primary=True)

                p2 = Product.objects.create(
                    name="iPhone 17 Pro Max",
                    slug="iphone-17-pro-max",
                    sku="CEL-APP-I17PM",
                    description="Descubre el nuevo Apple iPhone 17 Pro Max con chip A20 Bionic de última generación, pantalla OLED ProMotion con brillo mejorado bajo el sol, cámara principal de 48MP con zoom óptico de 10x y diseño robusto en titanio aeroespacial.",
                    price=5699.00,
                    offer_price=5399.00,
                    stock=10,
                    brand=apple,
                    category=celulares,
                    seller=seller_pedro,
                    colors=["Natural Titanium", "Dark Cherry", "White Titanium"],
                    sizes=["256GB", "512GB"],
                    is_featured=True
                )
                ProductImage.objects.create(product=p2, image='products/iphone_17.jpg', is_primary=True)

                p3 = Product.objects.create(
                    name="MacBook Pro 16\" Apple M4 Max",
                    slug="macbook-pro-16-m4-max",
                    sku="LAP-APP-M4MX",
                    description="El portátil definitivo para profesionales del desarrollo de software, diseño y edición de video 3D. Equipada con el procesador M4 Max, 48GB de memoria unificada, SSD de 1TB de alta velocidad y pantalla Liquid Retina XDR de 16 pulgadas.",
                    price=9500.00,
                    offer_price=8999.00,
                    stock=8,
                    brand=apple,
                    category=laptops,
                    seller=seller_juan,
                    colors=["Space Black", "Silver"],
                    sizes=["48GB RAM", "64GB RAM"],
                    is_featured=True
                )
                ProductImage.objects.create(product=p3, image='products/macbook_pro.jpg', is_primary=True)

                p4 = Product.objects.create(
                    name="Sony PlayStation 5 Pro Slim",
                    slug="sony-playstation-5-pro-slim",
                    sku="GAM-SON-PS5P",
                    description="Consola de videojuegos PlayStation 5 versión Slim Pro de 1TB. Gráficos en 4K nativos a 120 FPS, retrocompatibilidad completa con juegos de PS4 y carga ultrarrápida gracias a su disco de estado sólido NVMe customizado.",
                    price=2499.00,
                    offer_price=2299.00,
                    stock=25,
                    brand=sony,
                    category=consolas,
                    seller=seller_pedro,
                    colors=["White/Black"],
                    sizes=["Edición Standard", "Edición Digital"],
                    is_featured=True
                )
                ProductImage.objects.create(product=p4, image='products/ps5_console.jpg', is_primary=True)

                p5 = Product.objects.create(
                    name="Casaca Cortaviento Nike Air",
                    slug="casaca-cortaviento-nike-air",
                    sku="MOD-NIK-CAIR",
                    description="Cortaviento deportivo Nike Air confeccionado con poliéster reciclado repeliendo el agua y resistiendo vientos fuertes. Cuenta con bolsillos laterales con cremallera y detalles reflectantes para entrenamientos nocturnos.",
                    price=320.00,
                    offer_price=280.00,
                    stock=35,
                    brand=nike,
                    category=hombre,
                    seller=seller_carlos,
                    colors=["Negro", "Azul Eléctrico", "Rojo Fuego"],
                    sizes=["S", "M", "L", "XL"],
                    is_featured=False
                )
                ProductImage.objects.create(product=p5, image='products/nike_jacket.jpg', is_primary=True)

                # Generar automáticamente 100 productos por cada una de las 8 categorías (Total: 800)
                categories_list = [
                    (laptops, "Laptop Pro", [2000, 7500], [apple, samsung, sony], ["8GB RAM", "16GB RAM", "32GB RAM"], ["Space Gray", "Silver"]),
                    (celulares, "Celular Smart", [400, 3500], [samsung, apple], ["128GB", "256GB"], ["Negro", "Blanco", "Azul"]),
                    (tablets, "Tablet Active", [300, 2000], [samsung, apple], ["64GB", "128GB"], ["Gris", "Plata"]),
                    (hombre, "Ropa Varón", [40, 250], [nike], ["S", "M", "L", "XL"], ["Negro", "Gris", "Azul"]),
                    (mujer, "Ropa Dama", [40, 250], [nike], ["S", "M", "L"], ["Rojo", "Blanco", "Rosado"]),
                    (consolas, "Consola Play", [1000, 2800], [sony], ["Standard", "Pro"], ["Blanco", "Negro"]),
                    (accesorios, "Accesorio Tech", [30, 450], [sony, samsung, apple], ["Único"], ["Negro", "Blanco"]),
                    (hogar, "Hogar Nova", [80, 1200], [samsung, sony], ["Estándar"], ["Blanco", "Gris"])
                ]

                self.stdout.write("Generando 100 productos programáticos por categoría (Total: 800)...")
                
                for cat, name_prefix, price_range, brands_pool, sizes_pool, colors_pool in categories_list:
                    for i in range(1, 101):
                        brand = random.choice(brands_pool)
                        sku = f"PROD-{cat.slug[:3].upper()}-{brand.slug[:3].upper()}-{i:03d}"
                        name = f"{name_prefix} {brand.name} X-{i}"
                        slug = f"{cat.slug}-{brand.slug}-x-{i}"
                        price = decimal.Decimal(str(round(random.uniform(price_range[0], price_range[1]), 2)))
                        
                        offer_price = None
                        if random.random() < 0.3: # 30% discount chance
                            discount_factor = decimal.Decimal(str(round(random.uniform(0.8, 0.95), 2)))
                            offer_price = price * discount_factor
                            offer_price = decimal.Decimal(str(round(offer_price, 2)))
                            
                        stock = random.randint(0, 45)
                        is_featured = random.random() < 0.08 # 8% featured chance
                        
                        # Create product
                        p = Product.objects.create(
                            name=name,
                            slug=slug,
                            sku=sku,
                            description=f"Este es un producto generado automáticamente de la categoría {cat.name}. Diseñado para alto rendimiento y uso profesional continuo en {timezone.now().year}.",
                            price=price,
                            offer_price=offer_price,
                            stock=stock,
                            brand=brand,
                            category=cat,
                            seller=random.choice(sellers_pool),
                            colors=colors_pool,
                            sizes=sizes_pool,
                            is_featured=is_featured
                        )
                        img_path = None
                        if cat.slug == 'laptops':
                            if brand.slug == 'apple':
                                img_path = 'products/macbook_pro.jpg'
                            else:
                                img_path = 'products/sony_laptop.jpg'
                        elif cat.slug == 'celulares':
                            if brand.slug == 'apple':
                                img_path = 'products/iphone_17.jpg'
                            else:
                                img_path = 'products/samsung_s25.jpg'
                        elif cat.slug == 'tablets':
                            img_path = 'products/tablet_generic.jpg'
                        elif cat.slug == 'consolas':
                            img_path = 'products/ps5_console.jpg'
                        elif cat.slug == 'accesorios':
                            img_path = 'products/accessory_generic.jpg'
                        elif cat.slug in ['hombre', 'mujer']:
                            img_path = 'products/nike_jacket.jpg'
                        elif cat.slug == 'hogar':
                            img_path = 'products/hogar_generic.jpg'
                        
                        if img_path:
                            ProductImage.objects.create(product=p, image=img_path, is_primary=True)
                        
                        # Generate simulated clicks analytics to make dashboards super realistic
                        views = random.randint(150, 800) if is_featured else random.randint(10, 150)
                        cart_adds = int(views * random.uniform(0.05, 0.15))
                        purchases = int(cart_adds * random.uniform(0.1, 0.3))
                        
                        pa, _ = ProductAnalytic.objects.get_or_create(product=p)
                        pa.views = views
                        pa.cart_adds = cart_adds
                        pa.purchases = purchases
                        pa.save()

                # 6. Create Coupons
                self.stdout.write("Creando cupones promocionales...")
                Coupon.objects.create(
                    code="TEC2026",
                    discount_type="percent",
                    value=10.00,
                    expiration_date=timezone.now() + timezone.timedelta(days=180),
                    active=True,
                    max_uses=200,
                    used_count=18
                )
                
                Coupon.objects.create(
                    code="NOVAMARKET50",
                    discount_type="fixed",
                    value=50.00,
                    expiration_date=timezone.now() + timezone.timedelta(days=90),
                    active=True,
                    max_uses=100,
                    used_count=5
                )

                # 7. Create Addresses
                self.stdout.write("Creando direcciones de clientes...")
                client_address = Address.objects.create(
                    user=client_user,
                    title="Casa Lima",
                    street_address="Av. Larco 740, Dpto. 402",
                    district="Miraflores",
                    province="Lima",
                    department="Lima",
                    phone="+51 999888777",
                    is_default=True
                )

                # 8. Create Order logistics mock history
                self.stdout.write("Generando registros de órdenes e historial logístico...")
                
                # Order 1: Delivered
                o1 = Order.objects.create(
                    user=client_user,
                    address=client_address,
                    status='delivered',
                    subtotal=decimal.Decimal('4599.00'),
                    shipping_cost=decimal.Decimal('8.00'),
                    discount_amount=decimal.Decimal('0.00'),
                    total=decimal.Decimal('4607.00')
                )
                OrderItem.objects.create(
                    order=o1, product=p1, quantity=1, price=p1.current_price, color="Titanium Gray", size="256GB"
                )
                Payment.objects.create(
                    order=o1, method='mercadopago', status='paid', transaction_id='MP-9948275910', amount=decimal.Decimal('4607.00'), created_at=timezone.now() - timezone.timedelta(days=5)
                )
                # Adjust Order 1 timestamp backwards in history
                Order.objects.filter(id=o1.id).update(created_at=timezone.now() - timezone.timedelta(days=5), updated_at=timezone.now() - timezone.timedelta(days=4))

                # Order 2: Shipped
                o2 = Order.objects.create(
                    user=client_user,
                    address=client_address,
                    status='shipped',
                    subtotal=decimal.Decimal('2299.00'),
                    shipping_cost=decimal.Decimal('8.00'),
                    discount_amount=decimal.Decimal('50.00'),
                    total=decimal.Decimal('2257.00')
                )
                OrderItem.objects.create(
                    order=o2, product=p4, quantity=1, price=p4.current_price, color="White/Black", size="Edición Standard"
                )
                Payment.objects.create(
                    order=o2, method='paypal', status='paid', transaction_id='PP-8W827394KL0', amount=decimal.Decimal('2257.00'), created_at=timezone.now() - timezone.timedelta(days=2)
                )
                # Adjust Order 2 timestamp backwards
                Order.objects.filter(id=o2.id).update(created_at=timezone.now() - timezone.timedelta(days=2), updated_at=timezone.now() - timezone.timedelta(days=1))

                # Order 3: Pending payment
                o3 = Order.objects.create(
                    user=client_user,
                    address=client_address,
                    status='pending',
                    subtotal=decimal.Decimal('280.00'),
                    shipping_cost=decimal.Decimal('8.00'),
                    discount_amount=decimal.Decimal('0.00'),
                    total=decimal.Decimal('288.00')
                )
                OrderItem.objects.create(
                    order=o3, product=p5, quantity=1, price=p5.current_price, color="Negro", size="M"
                )
                Payment.objects.create(
                    order=o3, method='yape', status='pending', amount=decimal.Decimal('288.00'), created_at=timezone.now()
                )

                # 9. Create Product Reviews
                self.stdout.write("Sembrando reseñas de productos...")
                Review.objects.create(
                    user=client_user,
                    product=p1,
                    rating=5,
                    comment="Excelente teléfono. La cámara de 200MP es alucinante y la inteligencia artificial integrada ahorra muchísimo tiempo en la edición de fotos. El color titanio gris se ve sumamente elegante."
                )
                Review.objects.create(
                    user=client_user,
                    product=p4,
                    rating=4,
                    comment="Muy buena consola, carga los juegos en segundos. Es algo más delgada que el modelo inicial pero sigue sintiéndose bastante premium."
                )

                # 10. Generate High-Volume Traffic Logs for Real-time Dashboard (Product Click Analytics)
                self.stdout.write("Simulando registros de tráfico y clicks en tiempo real...")
                
                # Product Analytics views views, cart_adds, purchases
                # S25 Ultra
                pa1, _ = ProductAnalytic.objects.get_or_create(product=p1)
                pa1.views = 1250
                pa1.cart_adds = 152
                pa1.purchases = 32
                pa1.save()

                # iPhone 17
                pa2, _ = ProductAnalytic.objects.get_or_create(product=p2)
                pa2.views = 980
                pa2.cart_adds = 94
                pa2.purchases = 18
                pa2.save()

                # MacBook Pro
                pa3, _ = ProductAnalytic.objects.get_or_create(product=p3)
                pa3.views = 420
                pa3.cart_adds = 21
                pa3.purchases = 4
                pa3.save()

                # PS5 Slim
                pa4, _ = ProductAnalytic.objects.get_or_create(product=p4)
                pa4.views = 750
                pa4.cart_adds = 68
                pa4.purchases = 25
                pa4.save()

                # Nike Cortaviento
                pa5, _ = ProductAnalytic.objects.get_or_create(product=p5)
                pa5.views = 310
                pa5.cart_adds = 42
                pa5.purchases = 12
                pa5.save()

                # Mocking dashboard user logs feed
                events = ['click_product', 'add_to_cart', 'purchase', 'view_category']
                products_pool = [p1, p2, p3, p4, p5]
                categories_pool = [electronica, laptops, celulares, moda, gaming, consolas]
                users_pool = [client_user, None, None] # some logs as guest

                for i in range(50):
                    event = random.choice(events)
                    product = random.choice(products_pool)
                    category = random.choice(categories_pool) if event == 'view_category' else None
                    time_spent = round(random.uniform(2.0, 90.0), 1)
                    user_log = random.choice(users_pool)
                    
                    # Ensure alignment of product and category if view_category
                    if event == 'view_category':
                        product = None
                    elif event == 'purchase':
                        time_spent = 0.0 # Purchase is immediate click

                    UserActivityLog.objects.create(
                        user=user_log,
                        session_id=f"sess_{random.randint(100000, 999999)}",
                        event_type=event,
                        product=product,
                        category=category,
                        time_spent=time_spent
                    )

                self.stdout.write("Generando y enlazando imágenes únicas para cada producto...")
                from generate_unique_images import generate as generate_unique_images
                generate_unique_images()

                self.stdout.write(self.style.SUCCESS("¡Siembra de datos completada exitosamente!"))
                self.stdout.write(self.style.SUCCESS("Credenciales de pruebas creadas:"))
                self.stdout.write("  - Administrador: admin / admin123")
                self.stdout.write("  - Vendedor: seller / seller123")
                self.stdout.write("  - Cliente: client / client123")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error al sembrar datos: {str(e)}"))
            raise e
