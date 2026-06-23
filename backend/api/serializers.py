from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Category, Brand, Product, ProductImage, Cart, CartItem,
    Wishlist, Address, Coupon, Order, OrderItem, Payment,
    Review, UserActivityLog, ProductAnalytic, Notification
)

User = get_user_model()

# --- USER SERIALIZERS ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar')
        read_only_fields = ('role',)

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role='client' # default is client
        )
        return user

# --- CATEGORY & BRAND ---
class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon')

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'parent', 'icon', 'subcategories')

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ('id', 'name', 'slug', 'logo')

# --- PRODUCT SERIALIZERS ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary')

class ProductAnalyticSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAnalytic
        fields = ('views', 'cart_adds', 'purchases', 'conversion_rate')

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'username', 'rating', 'comment', 'created_at')
        read_only_fields = ('user', 'username', 'created_at')

class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True, required=False, allow_null=True
    )
    category = serializers.StringRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    primary_image = serializers.SerializerMethodField(read_only=True)
    image_url = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'price', 'offer_price', 'current_price', 
            'stock', 'brand', 'brand_id', 'category', 'category_id', 'colors', 'sizes', 
            'is_featured', 'primary_image', 'image_url'
        )

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            name = primary.image.name
            if name.startswith('http://') or name.startswith('https://'):
                return name
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None

    def create(self, validated_data):
        image_url = validated_data.pop('image_url', None)
        product = super().create(validated_data)
        if image_url:
            ProductImage.objects.create(product=product, image=image_url, is_primary=True)
        return product

    def update(self, instance, validated_data):
        image_url = validated_data.pop('image_url', None)
        product = super().update(instance, validated_data)
        if image_url:
            instance.images.all().delete()
            ProductImage.objects.create(product=instance, image=image_url, is_primary=True)
        return product

class ProductDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    analytic = ProductAnalyticSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'description', 'price', 'offer_price', 
            'current_price', 'stock', 'brand', 'category', 'colors', 'sizes', 
            'is_featured', 'is_active', 'model_3d_path', 'images', 'reviews', 'analytic', 
            'average_rating', 'created_at', 'updated_at'
        )

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0.0
        total = sum([r.rating for r in reviews])
        return round(total / len(reviews), 1)

# --- CART SERIALIZERS ---
class CartItemProductSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'offer_price', 'current_price', 'stock', 'primary_image', 'brand_name')

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary:
            name = primary.image.name
            if name.startswith('http://') or name.startswith('https://'):
                return name
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None

class CartItemSerializer(serializers.ModelSerializer):
    product = CartItemProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source='product', write_only=True
    )
    item_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'color', 'size', 'item_total')

    def get_item_total(self, obj):
        return obj.quantity * obj.product.current_price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    cart_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'user', 'items', 'cart_total')

    def get_cart_total(self, obj):
        return sum([item.quantity * item.product.current_price for item in obj.items.all()])

# --- WISHLIST ---
class WishlistSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'user', 'products')

# --- ADDRESS & COUPON ---
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ('id', 'title', 'street_address', 'district', 'province', 'department', 'phone', 'is_default')
        read_only_fields = ('user',)

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount_type', 'value', 'expiration_date', 'active')

# --- ORDERS & LOGISTICS ---
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_sku', 'product_image', 'quantity', 'price', 'color', 'size')

    def get_product_image(self, obj):
        if obj.product:
            primary = obj.product.images.filter(is_primary=True).first()
            if not primary:
                primary = obj.product.images.first()
            if primary:
                name = primary.image.name
                if name.startswith('http://') or name.startswith('https://'):
                    return name
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(primary.image.url)
                return primary.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address_details = AddressSerializer(source='address', read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    payment_method = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'address', 'address_details', 'status', 'tracking_number', 
            'coupon', 'coupon_code', 'subtotal', 'shipping_cost', 'discount_amount', 
            'total', 'items', 'payment_method', 'payment_status', 'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'tracking_number', 'status', 'subtotal', 'shipping_cost', 'discount_amount', 'total')

    def get_payment_method(self, obj):
        if hasattr(obj, 'payment'):
            return obj.payment.method
        return None

    def get_payment_status(self, obj):
        if hasattr(obj, 'payment'):
            return obj.payment.status
        return 'pending'

# --- PAYMENT ---
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'order', 'method', 'status', 'transaction_id', 'amount', 'created_at')

# --- NOTIFICATION & ANALYTICS ---
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'is_read', 'created_at')

class UserActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivityLog
        fields = ('id', 'user', 'session_id', 'event_type', 'product', 'category', 'time_spent', 'timestamp')
