from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Category, Brand, Product, ProductImage, Cart, CartItem,
    Wishlist, Address, Coupon, Order, OrderItem, Payment,
    Review, UserActivityLog, ProductAnalytic, Notification
)

# Customize User Admin to show the 'role' and 'phone' fields
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'role', 'phone', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Información de Perfil', {'fields': ('role', 'phone', 'avatar')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información de Perfil', {'fields': ('role', 'phone', 'avatar')}),
    )

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'offer_price', 'stock', 'category', 'brand', 'is_featured', 'is_active')
    list_filter = ('is_featured', 'is_active', 'category', 'brand')
    search_fields = ('name', 'sku', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'user', 'status', 'total', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('tracking_number', 'user__username')
    inlines = [OrderItemInline]

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'method', 'status', 'amount', 'transaction_id', 'created_at')
    list_filter = ('method', 'status')

class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'value', 'expiration_date', 'active', 'used_count', 'max_uses')
    search_fields = ('code',)

class ProductAnalyticAdmin(admin.ModelAdmin):
    list_display = ('product', 'views', 'cart_adds', 'purchases', 'conversion_rate')
    readonly_fields = ('conversion_rate',)

class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'user', 'product', 'category', 'time_spent', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    readonly_fields = ('timestamp',)

# Register models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Brand, BrandAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Wishlist)
admin.site.register(Address)
admin.site.register(Coupon, CouponAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(Review)
admin.site.register(Notification)
admin.site.register(ProductAnalytic, ProductAnalyticAdmin)
admin.site.register(UserActivityLog, UserActivityLogAdmin)
