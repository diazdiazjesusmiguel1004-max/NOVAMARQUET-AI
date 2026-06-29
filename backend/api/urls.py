from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, UserProfileView, CategoryViewSet, BrandViewSet,
    ProductViewSet, CartViewSet, WishlistViewSet, AddressViewSet,
    ValidateCouponView, OrderViewSet, ReviewViewSet, NotificationViewSet,
    AdminDashboardView, AdminUserListView, CouponViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'coupons', CouponViewSet, basename='coupon')

urlpatterns = [
    # Router endpoints
    path('', include(router.urls)),

    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),

    # Cart
    path('cart/current/', CartViewSet.as_view({'get': 'current'}), name='cart-current'),
    path('cart/add/', CartViewSet.as_view({'post': 'add_item'}), name='cart-add'),
    path('cart/update/', CartViewSet.as_view({'post': 'update_item'}), name='cart-update'),
    path('cart/remove/', CartViewSet.as_view({'post': 'remove_item'}), name='cart-remove'),

    # Wishlist
    path('wishlist/current/', WishlistViewSet.as_view({'get': 'current'}), name='wishlist-current'),
    path('wishlist/toggle/', WishlistViewSet.as_view({'post': 'toggle'}), name='wishlist-toggle'),

    # Coupon Validation
    path('coupons/validate/', ValidateCouponView.as_view(), name='coupon-validate'),

    # Dashboard & Analytics
    path('dashboard/summary/', AdminDashboardView.as_view(), name='dashboard-summary'),
    path('dashboard/users/', AdminUserListView.as_view(), name='admin-users'),
]
