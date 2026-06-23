from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow write access only to administrators.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

class IsSellerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Allow write access to sellers or administrators.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['seller', 'admin']

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allow access only to the owner of the object or administrators.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'admin':
            return True
        
        # Check ownership based on common object attributes
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'cart'):
            return obj.cart.user == request.user
        return False
