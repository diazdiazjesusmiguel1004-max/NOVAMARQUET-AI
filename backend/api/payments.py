import stripe
import mercadopago
from django.conf import settings
import requests
import json

def get_stripe_payment_intent(amount_soles, order_id):
    """
    Creates a Stripe PaymentIntent.
    Stripe processes payments in cents. Converts Soles to Cents.
    """
    try:
        stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
        if not stripe.api_key:
            return None
            
        amount_cents = int(float(amount_soles) * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='pen',  # Soles Peruanos
            metadata={
                'order_id': order_id
            }
        )
        return {
            'client_secret': intent.client_secret,
            'id': intent.id
        }
    except Exception as e:
        print(f"Stripe Integration Error: {str(e)}")
        return None

def get_mercadopago_preference(items, order_id, user_email):
    """
    Creates a MercadoPago Payment Preference link for checkout redirection.
    """
    try:
        mp_token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', '')
        if not mp_token:
            return None
            
        sdk = mercadopago.SDK(mp_token)
        
        mp_items = []
        for item in items:
            mp_items.append({
                "title": item.product.name,
                "quantity": item.quantity,
                "unit_price": float(item.price),
                "currency_id": "PEN"
            })
            
        preference_data = {
            "items": mp_items,
            "payer": {
                "email": user_email
            },
            "back_urls": {
                "success": f"http://localhost:5173/orders?status=success&order_id={order_id}",
                "failure": f"http://localhost:5173/cart?status=failure",
                "pending": f"http://localhost:5173/orders?status=pending"
            },
            "auto_return": "approved",
            "external_reference": str(order_id)
        }
        
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        return {
            'init_point': preference.get('init_point'),
            'sandbox_init_point': preference.get('sandbox_init_point'),
            'id': preference.get('id')
        }
    except Exception as e:
        print(f"MercadoPago Integration Error: {str(e)}")
        return None

def get_paypal_order(amount_soles, order_id):
    """
    Creates a PayPal order using REST API in USD.
    Converts PEN to USD (rate ~3.80).
    """
    try:
        client_id = getattr(settings, 'PAYPAL_CLIENT_ID', '')
        secret = getattr(settings, 'PAYPAL_SECRET', '')
        if not client_id or not secret:
            return None

        exchange_rate = 3.8
        amount_usd = round(float(amount_soles) / exchange_rate, 2)
        
        # Get access token from PayPal Sandbox
        auth_url = "https://api-m.sandbox.paypal.com/v1/oauth2/token"
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
        data = {
            "grant_type": "client_credentials"
        }
        
        response = requests.post(auth_url, auth=(client_id, secret), headers=headers, data=data)
        if response.status_code != 200:
            return None
            
        access_token = response.json().get('access_token')
        
        # Create Order
        order_url = "https://api-m.sandbox.paypal.com/v2/checkout/orders"
        order_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": f"ORD_{order_id}",
                    "amount": {
                        "currency_code": "USD",
                        "value": str(amount_usd)
                    }
                }
            ],
            "application_context": {
                "return_url": f"http://localhost:5173/orders?status=success&order_id={order_id}",
                "cancel_url": f"http://localhost:5173/cart?status=cancel"
            }
        }
        
        res = requests.post(order_url, headers=order_headers, data=json.dumps(order_data))
        if res.status_code not in [200, 201]:
            return None
            
        paypal_order = res.json()
        approval_url = next(link['href'] for link in paypal_order['links'] if link['rel'] == 'approve')
        
        return {
            'id': paypal_order['id'],
            'approval_url': approval_url
        }
    except Exception as e:
        print(f"PayPal Integration Error: {str(e)}")
        return None
