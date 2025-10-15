# 📖 Documentación - SecurityServer-Universal

Esta carpeta contiene la documentación web del proyecto SecurityServer-Universal, configurada para ser servida a través de **GitHub Pages**.

## 🌐 Acceso a la Guía

**🔗 [Ver Guía Completa en GitHub Pages](https://tu-usuario.github.io/SecurityServer-Universal/)**

## 📁 Estructura de Archivos

```
docs/
├── index.html          # Página principal de la guía
├── styles.css          # Estilos CSS personalizados
├── script.js           # Funcionalidades JavaScript
├── _config.yml         # Configuración de Jekyll para GitHub Pages
├── .nojekyll          # Archivo para servir HTML directamente
└── README.md          # Este archivo
```

## 🛠️ Características de la Guía

### 🎨 Diseño y UX
- **Bootstrap 5**: Framework CSS moderno y responsivo
- **Tema oscuro/claro**: Toggle automático con preferencias guardadas
- **Animaciones suaves**: Efectos visuales atractivos
- **Navegación intuitiva**: Menú fijo y scroll suave

### 🔧 Funcionalidades Avanzadas
- **Barra de progreso de lectura**: Indica el progreso en la página
- **Búsqueda en tiempo real**: Encuentra información rápidamente
- **Botones de copia**: Copia código con un clic
- **Exportar PDF**: Guarda la guía para uso offline
- **Compartir**: Comparte la guía fácilmente
- **Back to top**: Botón para volver arriba

### 📱 Responsividad
- **Mobile-first**: Diseñado primero para móviles
- **Tablet optimizado**: Experiencia perfecta en tablets
- **Desktop enhanced**: Funcionalidades adicionales en escritorio

## 🔧 Configuración de GitHub Pages

### Configuración Automática
GitHub Pages está configurado para:
- **Fuente**: Carpeta `/docs` de la rama `main`
- **Dominio**: `tu-usuario.github.io/SecurityServer-Universal`
- **SSL**: Habilitado automáticamente
- **CDN**: Distribución global automática

### Archivos de Configuración

#### `_config.yml`
Configuración principal de Jekyll con:
- Metadatos del sitio (título, descripción, autor)
- Configuración de SEO
- Plugins habilitados
- Configuración de tema

#### `.nojekyll`
Archivo vacío que indica a GitHub Pages que sirva los archivos HTML directamente sin procesamiento Jekyll adicional.

## 🚀 Desarrollo Local

Para probar la guía localmente:

```bash
# Navegar a la carpeta docs
cd docs

# Servir con Python (opción 1)
python -m http.server 8080

# Servir con Node.js (opción 2)
npx http-server -p 8080

# Servir con Jekyll (opción 3)
bundle exec jekyll serve
```

Luego visita: `http://localhost:8080`

## 📝 Personalización

### Cambiar Información del Sitio
Edita `_config.yml`:
```yaml
title: "Tu Título Personalizado"
description: "Tu descripción personalizada"
author: "Tu Nombre"
```

### Modificar Estilos
Edita `styles.css` para:
- Cambiar colores del tema
- Ajustar tipografía
- Modificar animaciones
- Personalizar layout

### Agregar Funcionalidades
Edita `script.js` para:
- Agregar nuevas interacciones
- Modificar comportamientos existentes
- Integrar servicios externos

## 🔄 Actualizaciones Automáticas

Cada vez que hagas push a la rama `main`:
1. GitHub Pages detecta los cambios automáticamente
2. Regenera el sitio (toma 1-10 minutos)
3. Actualiza la URL pública
4. Notifica por email si hay errores

## 📊 Métricas y Analytics

### GitHub Pages Stats
- **Visitas**: Disponible en GitHub Insights
- **Tráfico**: Estadísticas de referrers
- **Popularidad**: Páginas más visitadas

### Opcional: Google Analytics
Descomenta en `_config.yml`:
```yaml
google_analytics: UA-XXXXXXXX-X
```

## 🐛 Solución de Problemas

### La página no se actualiza
1. Verifica que los cambios estén en la rama `main`
2. Espera 10 minutos para propagación
3. Revisa GitHub Actions para errores
4. Limpia caché del navegador

### Errores de construcción
1. Revisa la sintaxis de `_config.yml`
2. Verifica que no haya caracteres especiales
3. Consulta los logs en GitHub Actions

### Problemas de CSS/JS
1. Verifica rutas relativas en HTML
2. Asegúrate de que los archivos estén en `/docs`
3. Revisa la consola del navegador

## 📞 Soporte

Si tienes problemas con la documentación:
- **Issues**: [Reportar problema](https://github.com/tu-usuario/SecurityServer-Universal/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/SecurityServer-Universal/discussions)
- **Email**: security@proyecto.com

---

**💡 Tip**: Esta guía se actualiza automáticamente. ¡No olvides hacer star ⭐ al repositorio si te resulta útil!