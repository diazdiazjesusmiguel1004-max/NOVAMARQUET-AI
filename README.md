# 🛍️ NOVAMARQUET-AI - E-Commerce Industrial con Analíticas 3D y Logística

Bienvenido a **NOVAMARQUET-AI**, una plataforma de comercio electrónico de nivel empresarial diseñada con un backend robusto en **Django REST Framework** y un frontend modular e interactivo en **React (Vite) + Tailwind CSS v4**.

El proyecto cuenta con autenticación segura por tokens (JWT), pasarelas de pago mockeadas, un visor interactivo en 3D para productos y un panel de control con analíticas de clics y gestión logística en tiempo real.

---

## 🛠️ Tecnologías Utilizadas

*   **Backend:** Python 3.x, Django 5.x, Django REST Framework, Simple JWT, Pillow (Gestión de imágenes).
*   **Frontend:** React 19, Vite, Tailwind CSS v4, Zustand (Gestor de estados), Chart.js (Visualización de datos).
*   **Base de Datos:** SQLite (desarrollo local pre-cargado).

---

## 🚀 Guía de Instalación y Configuración

Sigue estos pasos detallados para clonar y ejecutar el proyecto en tu máquina local sin errores.

### 1. Clonar el repositorio
Abre una terminal en tu computadora y ejecuta:
```bash
git clone https://github.com/tu-usuario/NOVAMARQUET-AI.git
cd NOVAMARQUET-AI
```

### 2. Configurar el Backend (Django)
1.  Crea un entorno virtual de Python:
    ```bash
    python -m venv venv
    ```
2.  Activa el entorno virtual:
    *   **En Windows (PowerShell):**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    *   **En Windows (CMD):**
        ```cmd
        .\venv\Scripts\activate.bat
        ```
    *   **En macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
3.  Instala las dependencias necesarias:
    ```bash
    pip install -r backend/requirements.txt
    ```

### 3. Configurar el Frontend (React)
1.  Navega a la carpeta de la interfaz:
    ```bash
    cd frontend
    ```
2.  Instala los paquetes de Node:
    ```bash
    npm install
    ```
3.  Regresa a la carpeta raíz del proyecto:
    ```bash
    cd ..
    ```

---

## 🖥️ Cómo Ejecutar el Proyecto

Tienes dos modos independientes para arrancar el e-commerce según tus necesidades:

### Modo A: Modo de Desarrollo (2 Terminales)
Recomendado para editar código en tiempo real con recarga caliente (*hot reload*).

*   **Terminal 1 (Backend):**
    ```powershell
    .\venv\Scripts\python backend/manage.py runserver 0.0.0.0:8000
    ```
*   **Terminal 2 (Frontend):**
    ```bash
    cd frontend
    npm run dev -- --host
    ```
*   **Acceso en PC:** Abre en tu navegador `http://localhost:5173/`
*   **Acceso en Celular (Mismo Wi-Fi):** Abre la dirección local `Network` mostrada por la consola de Vite (ej. `http://192.168.1.15:5173/`).

---

## Modo B: Modo de Producción / Un solo puerto (1 Terminal + Túnel)
Recomendado para abrirlo en tu celular usando datos móviles (desde fuera de tu red local) con un túnel seguro.

1.  **Compila la web de React:**
    ```bash
    cd frontend
    npm run build
    cd ..
    ```
2.  **Inicia el servidor de Django:**
    ```powershell
    .\venv\Scripts\python backend/manage.py runserver 0.0.0.0:8000
    ```
    *(Django se encargará de servir el frontend construido en el puerto 8000 de forma unificada).*
3.  **Abre el túnel seguro a internet (Nueva terminal):**
    ```powershell
    ssh -R 80:127.0.0.1:8000 serveo.net
    ```
    *(O usa Pinggy: `ssh -R 80:127.0.0.1:8000 loop.pinggy.io`)*
4.  Copia el enlace `https://xxxx.serveo.net` generado en la consola y ábrelo desde cualquier celular en el mundo.

---

## 🔑 Cuentas de Pruebas Sembradas

El proyecto incluye datos simulados de ventas, clientes e inventario. Puedes iniciar sesión con las siguientes cuentas de prueba:

*   **👑 Súper Administrador:**
    *   **Usuario:** `admin` | **Contraseña:** `admin123`
    *   *Privilegios:* Acceso a Django Admin (`/admin/`), analíticas completas, creación de productos 3D y edición de stock.
*   **💼 Vendedor / Socio Comercial:**
    *   **Usuario:** `seller` | **Contraseña:** `seller123`
    *   *Privilegios:* Control de inventario, cambio de precios, edición de stock y control logístico de órdenes.
*   **👤 Cliente:**
    *   **Usuario:** `client` | **Contraseña:** `client123`
    *   *Privilegios:* Navegación de productos, carrito de compras, favorito de productos, simulación de checkout de pago y timeline logístico.
