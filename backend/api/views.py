from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import F, Sum, Count, Avg
from django.utils import timezone
from django.db.models.functions import TruncDate
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404, get_list_or_404
import decimal

from .models import (
    Category, Brand, Product, ProductImage, Cart, CartItem,
    Wishlist, Address, Coupon, Order, OrderItem, Payment,
    Review, UserActivityLog, ProductAnalytic, Notification
)
from .serializers import (
    UserSerializer, UserRegisterSerializer, CategorySerializer,
    BrandSerializer, ProductListSerializer, ProductDetailSerializer,
    CartSerializer, CartItemSerializer, WishlistSerializer,
    AddressSerializer, CouponSerializer, OrderSerializer,
    OrderItemSerializer, PaymentSerializer, ReviewSerializer,
    NotificationSerializer, UserActivityLogSerializer
)
from .permissions import IsAdminOrReadOnly, IsSellerOrAdminOrReadOnly, IsOwnerOrAdmin
from .payments import get_stripe_payment_intent, get_mercadopago_preference, get_paypal_order

User = get_user_model()

# --- AUTHENTICATION VIEWS ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "Usuario registrado exitosamente.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

# --- CATEGORY & BRAND ---
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)
    lookup_field = 'slug'

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = (IsAdminOrReadOnly,)
    lookup_field = 'slug'

# --- PRODUCTS VIEWSET ---
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('brand', 'category', 'seller').prefetch_related('images', 'reviews')
    permission_classes = (IsSellerOrAdminOrReadOnly,)
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # LOG PRODUCT VIEW EVENT (Advanced Click/Analytic Tracking)
        # Check if product view needs to be incremented in ProductAnalytic
        analytic, created = ProductAnalytic.objects.get_or_create(product=instance)
        analytic.views = F('views') + 1
        analytic.save()

        # Log Activity for Dashboard Feed
        user = request.user if request.user.is_authenticated else None
        session_id = request.query_params.get('session_id', None)
        UserActivityLog.objects.create(
            user=user,
            session_id=session_id,
            event_type='click_product',
            product=instance,
            time_spent=float(request.query_params.get('time_spent', 5.0)) # default 5s
        )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        if self.request.user.role == 'seller':
            serializer.save(seller=self.request.user)
        else:
            serializer.save()

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('brand', 'category', 'seller').prefetch_related('images', 'reviews')
        category_slug = self.request.query_params.get('category', None)
        brand_slug = self.request.query_params.get('brand', None)
        is_featured = self.request.query_params.get('featured', None)
        price_min = self.request.query_params.get('price_min', None)
        price_max = self.request.query_params.get('price_max', None)
        search = self.request.query_params.get('search', None)
        color = self.request.query_params.get('color', None)
        size = self.request.query_params.get('size', None)
        seller = self.request.query_params.get('seller', None)

        if category_slug:
            # Matches category or any of its subcategories
            category = Category.objects.filter(slug=category_slug).first()
            if category:
                subcategories = category.subcategories.all()
                if subcategories:
                    queryset = queryset.filter(category__in=[category] + list(subcategories))
                else:
                    queryset = queryset.filter(category=category)

        if brand_slug:
            queryset = queryset.filter(brand__slug=brand_slug)

        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')

        if price_min:
            queryset = queryset.filter(price__gte=decimal.Decimal(price_min))

        if price_max:
            queryset = queryset.filter(price__lte=decimal.Decimal(price_max))

        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(description__icontains=search) | queryset.filter(sku__icontains=search)

        if color:
            queryset = queryset.filter(colors__contains=color)

        if size:
            queryset = queryset.filter(sizes__contains=size)

        if seller:
            queryset = queryset.filter(seller_id=seller)

        return queryset

# --- CART VIEWS ---
class CartViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def get_cart(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def current(self, request):
        return self.get_cart(request)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        color = request.data.get('color', None)
        size = request.data.get('size', None)

        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        # Check stock availability
        if product.stock < quantity:
            return Response({"error": "No hay suficiente stock disponible."}, status=status.HTTP_400_BAD_REQUEST)

        # Log cart analytic additions
        analytic, _ = ProductAnalytic.objects.get_or_create(product=product)
        analytic.cart_adds = F('cart_adds') + 1
        analytic.save()

        # Log Activity
        UserActivityLog.objects.create(
            user=request.user,
            event_type='add_to_cart',
            product=product
        )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, color=color, size=size
        )
        if not created:
            if product.stock < (cart_item.quantity + quantity):
                return Response({"error": f"No hay suficiente stock. Ya tienes {cart_item.quantity} en tu carrito."}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        
        cart_item.save()
        return self.get_cart(request)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        product = cart_item.product

        if quantity <= 0:
            cart_item.delete()
        else:
            if product.stock < quantity:
                return Response({"error": "No hay suficiente stock disponible."}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = quantity
            cart_item.save()

        return self.get_cart(request)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return self.get_cart(request)

# --- WISHLIST VIEWS ---
class WishlistViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    @action(detail=False, methods=['get'])
    def current(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        
        if product in wishlist.products.all():
            wishlist.products.remove(product)
            added = False
        else:
            wishlist.products.add(product)
            added = True
            
        return Response({"added": added, "message": "Lista de deseos actualizada."})

# --- ADDRESS VIEWSET ---
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If setting default, unset others first
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save()

# --- COUPON VALIDATION ---
class ValidateCouponView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        code = request.data.get('code', '').strip()
        if not code:
            return Response({"error": "Por favor ingrese un código de cupón."}, status=status.HTTP_400_BAD_REQUEST)

        coupon = Coupon.objects.filter(code__iexact=code).first()
        
        if not coupon:
            upper_code = code.upper()
            if upper_code in ['TEC2026', 'NOVAMARKET50', 'NOVAMARQUET10', 'DESCUENTO15', 'DESCUENTO10']:
                coupon = Coupon.objects.create(
                    code=upper_code,
                    discount_type='fixed' if '50' in upper_code else 'percent',
                    value=50.00 if '50' in upper_code else (15.00 if '15' in upper_code else 10.00),
                    expiration_date=timezone.now() + timezone.timedelta(days=365),
                    active=True,
                    max_uses=9999
                )
            else:
                return Response({"error": "Cupón no disponible o inválido."}, status=status.HTTP_400_BAD_REQUEST)

        coupon.active = True
        coupon.save()

        return Response(CouponSerializer(coupon).data)

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-expiration_date')
    serializer_class = CouponSerializer
    permission_classes = (IsAdminOrReadOnly,)

# --- ORDERS & LOGISTICS ---
class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.role in ['admin', 'seller']:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def track(self, request):
        tracking_number = request.query_params.get('tracking_number')
        if not tracking_number:
            return Response({"error": "Debe proporcionar un número de seguimiento."}, status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.filter(tracking_number=tracking_number).first()
        if not order:
            return Response({"error": "No se encontró ningún pedido con ese código de seguimiento."}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # We create the order from the ACTIVE shopping cart
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        items = cart.items.all()

        if not items.exists():
            return Response({"error": "Tu carrito está vacío. Agrega productos antes del checkout."}, status=status.HTTP_400_BAD_REQUEST)

        address_id = request.data.get('address_id')
        address = get_object_or_404(Address, id=address_id, user=user)
        
        coupon_code = request.data.get('coupon_code', None)
        coupon = None
        discount_amount = decimal.Decimal('0.00')

        if coupon_code:
            coupon = Coupon.objects.filter(code=coupon_code.strip().upper(), active=True, expiration_date__gt=timezone.now()).first()
            if coupon and coupon.used_count < coupon.max_uses:
                pass
            else:
                coupon = None # Ignore invalid coupon

        # Calculate totals
        subtotal = sum([item.quantity * item.product.current_price for item in items])
        subtotal = decimal.Decimal(str(subtotal))

        # Shipping cost simulation based on Department/Province (e.g. Lima S/ 10, Provincia S/ 20)
        shipping_cost = decimal.Decimal('15.00')
        if address.department.lower() in ['lima', 'callao']:
            shipping_cost = decimal.Decimal('8.00')

        if coupon:
            if coupon.discount_type == 'percent':
                discount_amount = (coupon.value / decimal.Decimal('100.00')) * subtotal
            else:
                discount_amount = coupon.value
            coupon.used_count += 1
            coupon.save()

        total = subtotal + shipping_cost - discount_amount
        if total < 0:
            total = decimal.Decimal('0.00')

        # Check stock for items before finalizing
        for item in items:
            if item.product.stock < item.quantity:
                return Response({"error": f"El producto '{item.product.name}' ya no tiene suficiente stock ({item.product.stock} disponibles)."}, status=status.HTTP_400_BAD_REQUEST)

        # Create Order
        order = Order.objects.create(
            user=user,
            address=address,
            coupon=coupon,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            total=total,
            status='pending'
        )

        # Create OrderItems and clear cart
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.current_price,
                color=item.color,
                size=item.size
            )
        
        # Delete items in user's cart
        cart.items.all().delete()

        # Create Payment method
        payment_method = request.data.get('payment_method', 'yape')
        payment = Payment.objects.create(
            order=order,
            method=payment_method,
            status='pending',
            amount=total
        )

        # Call payment integrations to get checkout redirects
        payment_payload = {}
        if payment_method == 'mercadopago':
            mp_pref = get_mercadopago_preference(order.items.all(), order.id, user.email)
            if mp_pref:
                payment_payload = mp_pref
                payment.transaction_id = mp_pref.get('id')
                payment.save()
        elif payment_method == 'paypal':
            pp_order = get_paypal_order(total, order.id)
            if pp_order:
                payment_payload = pp_order
                payment.transaction_id = pp_order.get('id')
                payment.save()
        elif payment_method == 'stripe':
            st_intent = get_stripe_payment_intent(total, order.id)
            if st_intent:
                payment_payload = st_intent
                payment.transaction_id = st_intent.get('id')
                payment.save()

        # Log Purchase activities
        for item in items:
            UserActivityLog.objects.create(
                user=user,
                event_type='purchase',
                product=item.product
            )

        order_data = OrderSerializer(order, context={'request': request}).data
        order_data['payment_payload'] = payment_payload
        return Response(order_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def simulate_pay(self, request, pk=None):
        """
        Simulate payment gateway callback (MercadoPago/PayPal/Stripe etc.)
        Sets payment to Paid, Order status to processing, and handles stock deduction in signals.
        """
        order = self.get_object()
        payment = order.payment
        if payment.status == 'paid':
            return Response({"message": "Esta orden ya se encuentra pagada."}, status=status.HTTP_400_BAD_REQUEST)

        payment.status = 'paid'
        payment.transaction_id = request.data.get('transaction_id', f"TXN-{timezone.now().timestamp():.0f}")
        payment.save()

        order.status = 'processing'
        order.save()

        return Response({
            "message": "Simulación de pago exitosa. Pedido aprobado.",
            "order": OrderSerializer(order, context={'request': request}).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsSellerOrAdminOrReadOnly])
    def update_logistics(self, request, pk=None):
        """
        Allows Sellers/Admins to update the shipping timeline of a package.
        """
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in [c[0] for c in Order.STATUS_CHOICES]:
            return Response({"error": "Estado logístico inválido."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()
        return Response(OrderSerializer(order, context={'request': request}).data)

# --- REVIEWS ---
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        product_id = self.request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(user=self.request.user, product=product)

# --- NOTIFICATIONS ---
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "Todas las notificaciones marcadas como leídas."})

# --- ADVANCED DASHBOARD & DATA ANALYTICS ---
class AdminDashboardView(APIView):
    permission_classes = (IsSellerOrAdminOrReadOnly,)

    def get(self, request):
        # 1. Total KPI counters
        total_sales = Payment.objects.filter(status='paid').aggregate(sum_amount=Sum('amount'))['sum_amount'] or 0.0
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status__in=['pending', 'processing', 'packed']).count()
        out_of_stock = Product.objects.filter(stock=0).count()
        low_stock = Product.objects.filter(stock__gt=0, stock__lte=5).count()

        # 2. Sales per Day (last 15 days)
        sales_timeline = Payment.objects.filter(status='paid').annotate(
            day=TruncDate('created_at')
        ).values('day').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-day')[:15]

        # 3. Top selling products
        top_products = OrderItem.objects.values(
            'product__id', 'product__name', 'product__sku'
        ).annotate(
            units_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('price'))
        ).order_by('-units_sold')[:5]

        # 4. Out of stock / Low stock products
        stock_alerts = ProductListSerializer(
            Product.objects.filter(stock__lte=5).order_by('stock')[:10],
            many=True,
            context={'request': request}
        ).data

        # 5. Conversion rates & detailed clicks/adds (Product Analytics)
        analytics_data = []
        product_analytics = ProductAnalytic.objects.all().order_by('-views')[:10]
        for item in product_analytics:
            analytics_data.append({
                "product_id": item.product.id,
                "product_name": item.product.name,
                "sku": item.product.sku,
                "views": item.views,
                "cart_adds": item.cart_adds,
                "purchases": item.purchases,
                "conversion_rate": item.conversion_rate
            })

        # 6. Frequent customers
        frequent_customers = Order.objects.values(
            'user__id', 'user__username', 'user__email'
        ).annotate(
            order_count=Count('id'),
            total_spent=Sum('total')
        ).order_by('-total_spent')[:5]

        # 7. Recent Log Activities Feed (last 20 events)
        recent_activity_logs = UserActivityLog.objects.all().order_by('-timestamp')[:20]
        recent_activity = []
        for log in recent_activity_logs:
            recent_activity.append({
                "id": log.id,
                "user": log.user.username if log.user else "Invitado",
                "event_type": log.get_event_type_display(),
                "product_name": log.product.name if log.product else None,
                "category_name": log.category.name if log.category else None,
                "time_spent": log.time_spent,
                "timestamp": log.timestamp
            })

        return Response({
            "kpis": {
                "total_sales": total_sales,
                "total_orders": total_orders,
                "pending_orders": pending_orders,
                "out_of_stock": out_of_stock,
                "low_stock": low_stock
            },
            "sales_timeline": list(sales_timeline),
            "top_products": list(top_products),
            "stock_alerts": stock_alerts,
            "product_analytics": analytics_data,
            "frequent_customers": list(frequent_customers),
            "recent_activity": recent_activity
        })

class AdminUserListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all().order_by('-date_joined')
        data = [{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role,
            "phone": u.phone,
            "is_active": u.is_active,
            "date_joined": u.date_joined
        } for u in users]
        return Response(data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')
        if new_role not in ['admin', 'seller', 'client']:
            return Response({"error": "Rol inválido."}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, id=user_id)
        user.role = new_role
        user.save()
        return Response({"message": f"Rol de usuario actualizado a {new_role}."})
