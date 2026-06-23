from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Cart, Wishlist, Order, OrderItem, Payment, Product, Notification, ProductAnalytic

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile_dependencies(sender, instance, created, **kwargs):
    """
    Automatically creates a Cart and a Wishlist when a new user is registered.
    """
    if created:
        Cart.objects.get_or_create(user=instance)
        Wishlist.objects.get_or_create(user=instance)
        # Create a welcome notification
        Notification.objects.create(
            user=instance,
            title="¡Bienvenido a NOVAMARQUET-AI!",
            message=f"Hola {instance.username}, gracias por registrarte en nuestra plataforma de comercio electrónico inteligente. Explora nuestros productos y vive una experiencia avanzada."
        )

@receiver(post_save, sender=Product)
def create_product_analytic_placeholder(sender, instance, created, **kwargs):
    """
    Automatically creates a ProductAnalytic entry when a new product is added.
    """
    if created:
        ProductAnalytic.objects.get_or_create(product=instance)

@receiver(post_save, sender=Payment)
def handle_payment_status_change(sender, instance, created, **kwargs):
    """
    Deducts stock when a payment is marked as 'paid' or handles inventory triggers.
    """
    if instance.status == 'paid':
        order = instance.order
        # Only deduct stock if order is currently pending/processing and hasn't been processed yet
        # We can implement a flag or rely on checking if stock was already deducted,
        # but to keep it simple, let's update stock and send notifications.
        with transaction.atomic():
            for item in order.items.all():
                product = item.product
                if product:
                    # Update analytic buy counter
                    analytic, _ = ProductAnalytic.objects.get_or_create(product=product)
                    analytic.purchases += item.quantity
                    analytic.save()

                    # Deduct stock
                    if product.stock >= item.quantity:
                        product.stock -= item.quantity
                        product.save()

                        # Alertas de stock bajo
                        if product.stock <= 5:
                            # Notify all admin users
                            admins = User.objects.filter(role='admin')
                            for admin in admins:
                                Notification.objects.create(
                                    user=admin,
                                    title=f"⚠️ Stock Bajo: {product.name}",
                                    message=f"El producto '{product.name}' (SKU: {product.sku}) tiene un stock crítico de {product.stock} unidades. Reabastecer pronto."
                                )
                    else:
                        # Stock is lower than purchase amount, set stock to 0
                        product.stock = 0
                        product.save()
                        # Out of stock notification
                        admins = User.objects.filter(role='admin')
                        for admin in admins:
                            Notification.objects.create(
                                user=admin,
                                title=f"🚨 Sin Stock: {product.name}",
                                message=f"El producto '{product.name}' (SKU: {product.sku}) se ha quedado sin stock debido a la Orden {order.tracking_number}."
                            )

        # Notify customer that payment was approved
        Notification.objects.create(
            user=order.user,
            title="Pago Aprobado y Procesando Pedido",
            message=f"¡Buenas noticias! Tu pago de S/ {instance.amount} para el pedido {order.tracking_number} ha sido aprobado. Estamos preparando tus productos."
        )

@receiver(post_save, sender=Order)
def handle_order_status_notifications(sender, instance, created, **kwargs):
    """
    Sends customer notifications on logistics status updates (shipped, in transit, delivered, etc.).
    """
    if not created:
        status_messages = {
            'processing': "Tu pedido está siendo procesado en nuestros almacenes.",
            'packed': "Tu pedido ha sido empaquetado y está listo para envío.",
            'shipped': f"Tu pedido ha sido enviado. Número de tracking: {instance.tracking_number}.",
            'in_transit': "Tu pedido se encuentra en reparto. ¡Estará llegando pronto!",
            'delivered': "Tu pedido ha sido entregado exitosamente. ¡Muchas gracias por tu compra!",
            'cancelled': "Tu pedido ha sido cancelado. Si tienes dudas, contáctanos a soporte."
        }
        
        msg = status_messages.get(instance.status)
        if msg:
            Notification.objects.create(
                user=instance.user,
                title=f"Actualización de Pedido: {instance.get_status_display()}",
                message=f"El estado de tu orden {instance.tracking_number} ha cambiado a: '{instance.get_status_display()}'. {msg}"
            )
