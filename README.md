# VERSUS Pádel — Sitio Web + Admin Panel

Sitio web oficial de VERSUS Pádel. Frontend en React + Vite, backend PHP (proxy a WooCommerce), desplegado en Ferozo (Donweb).

## 📁 Estructura del Proyecto

```
├── src/                    # Frontend React (Vite + TypeScript + Tailwind)
│   ├── components/versus/  # Componentes de la landing page
│   ├── components/admin/   # Componentes del panel admin
│   ├── components/ui/      # Componentes shadcn/ui
│   ├── pages/              # Páginas: Index, Store, ProductDetails, Admin
│   ├── lib/                # API helpers, utilidades compartidas
│   └── assets/             # Imágenes estáticas
├── backend/                # Backend PHP (proxy a WooCommerce REST API)
│   ├── middleware.php       # Auth, CORS, y helpers compartidos
│   ├── config.php          # Credenciales (NO subir a Git)
│   ├── auth.php            # Login admin
│   ├── products.php        # CRUD de productos
│   ├── categories.php      # Categorías
│   ├── upload-image.php    # Subida de imágenes a WordPress
│   ├── analytics.php       # Dashboard de ventas
│   ├── storefront.php      # Proxy público (Store API)
│   └── featured.json       # Producto destacado local
├── dist/                   # Build de producción (generado por Vite)
├── public/                 # Archivos estáticos copiados tal cual al build
└── deploy-ftp.ps1          # Script de deploy FTP a Ferozo
```

## 🚀 Setup Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Iniciar dev server
npm run dev
```

## 🔧 Build de Producción

```bash
npm run build
```

Genera la carpeta `dist/` con el frontend compilado y optimizado.

## 📦 Deploy a Ferozo

### Opción A: Script automático

```powershell
# Configurar credenciales (una vez por sesión)
$env:FTP_HOST = "l0100520.ferozo.com"
$env:FTP_USER = "tu_usuario"
$env:FTP_PASS = "tu_contraseña"

# Ejecutar deploy
.\deploy-ftp.ps1
```

### Opción B: Deploy manual por FTP (FileZilla, etc)

1. Ejecutar `npm run build`
2. Conectar al FTP de Ferozo
3. Subir el **contenido de `dist/`** a `/public_html/`
4. Subir el **contenido de `backend/`** a `/public_html/backend/`
   - ⚠️ **NO sobrescribir `backend/config.php`** en el servidor (contiene credenciales de producción)

### Archivos que se suben

| Local | Remoto (Ferozo) | Notas |
|-------|-----------------|-------|
| `dist/index.html` | `/public_html/index.html` | Siempre |
| `dist/assets/*` | `/public_html/assets/` | Reemplazar toda la carpeta |
| `dist/.htaccess` | `/public_html/.htaccess` | SPA routing |
| `backend/*.php` | `/public_html/backend/` | Excepto config.php |
| `backend/.htaccess` | `/public_html/backend/.htaccess` | Protege config.php |
| `backend/featured.json` | No subir | Se gestiona en servidor |

## 🔐 Seguridad

- **`.env`** → Contiene ADMIN_PASSWORD. Nunca subir a Git.
- **`backend/config.php`** → Contiene claves WooCommerce + WordPress. Nunca subir a Git.
- **`deploy-ftp.ps1`** → Lee credenciales de variables de entorno. Ignorado por Git.
- Todas las credenciales están en `.gitignore`.

## 🛠 Tecnologías

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, shadcn/ui
- **Backend**: PHP 8 (proxy a WooCommerce REST API + Store API)
- **E-commerce**: WooCommerce (WordPress en api.versuspadel.ar)
- **Hosting**: Ferozo (Donweb)
