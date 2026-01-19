# Guía de Administración - Crosti Cookies

## Credenciales de Acceso

### Administrador Principal
- **URL de acceso:** `/admin/login`
- **Email:** `admin@crosti.com`
- **Contraseña:** `crosti2025`

---

## Acceso al Panel

1. Navega a `/admin/login`
2. Ingresa las credenciales de administrador
3. Haz clic en "Iniciar Sesión"

---

## Módulos del Panel de Administración

### 1. Dashboard (Inicio)
Vista general con estadísticas rápidas:
- Total de galletas registradas
- Galletas visibles en la tienda
- Galletas destacadas en el carrusel
- Usuarios registrados

### 2. Gestión de Galletas

#### Crear Nueva Galleta
1. Haz clic en "Nueva Galleta"
2. Completa los campos:
   - **Nombre:** Nombre de la galleta
   - **Precio:** Precio en euros (ej: 3.50)
   - **Descripción:** Descripción detallada
   - **Ingredientes:** Lista separada por comas
   - **Imagen:** Selecciona una imagen desde tu PC
   - **Etiquetas:** Selecciona etiquetas disponibles (Vegano, Sin Gluten, etc.)
   - **Visible:** Si aparece en la página de todas las galletas
   - **En Carrusel:** Si aparece en el carrusel de la página principal (máx. 8)

#### Editar Galleta
1. Haz clic en el icono de editar (lápiz) en la galleta deseada
2. Modifica los campos necesarios
3. Guarda los cambios

#### Eliminar Galleta
1. Haz clic en el icono de eliminar (papelera)
2. Confirma la acción

#### Filtros y Búsqueda
- **Búsqueda:** Filtra por nombre
- **Por etiqueta:** Filtra por etiquetas asignadas
- **Por visibilidad:** Muestra solo visibles/ocultas
- **Por carrusel:** Muestra solo las del carrusel

#### Exportar Datos
- Haz clic en "Exportar CSV" para descargar un archivo Excel con todas las galletas

### 3. Gestión de Etiquetas

Las etiquetas permiten categorizar las galletas (Vegano, Sin Gluten, Nuevo, etc.)

#### Crear Etiqueta
1. Ingresa el nombre de la etiqueta
2. Selecciona un color de la paleta de colores favoritos
3. Haz clic en "Añadir"

#### Editar/Eliminar Etiqueta
- Usa los iconos de acción en cada etiqueta

### 4. Colores Favoritos

Gestiona una paleta de colores corporativos para mantener consistencia visual.

#### Añadir Color
1. Ingresa el código hexadecimal (ej: #930021)
2. Asigna un alias descriptivo (ej: "Rojo Crosti")
3. Haz clic en "Añadir"

#### Colores Predefinidos
| Color | Hexadecimal | Alias |
|-------|-------------|-------|
| 🔴 | #930021 | Rojo Crosti |
| 🟤 | #924C14 | Marrón Galleta |
| 🟡 | #F9E7AE | Crema |
| 🟢 | #2D5016 | Verde Vegano |
| 🔵 | #1E40AF | Azul Info |

### 5. Gestión de Usuarios

#### Roles Disponibles

| Permiso | Admin | Editor | Viewer |
|---------|-------|--------|--------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Ver galletas | ✅ | ✅ | ✅ |
| Crear galletas | ✅ | ✅ | ❌ |
| Editar galletas | ✅ | ✅ | ❌ |
| Eliminar galletas | ✅ | ❌ | ❌ |
| Gestionar etiquetas | ✅ | ✅ | ❌ |
| Gestionar colores | ✅ | ✅ | ❌ |
| Ver usuarios | ✅ | ❌ | ❌ |
| Crear usuarios | ✅ | ❌ | ❌ |
| Editar usuarios | ✅ | ❌ | ❌ |
| Eliminar usuarios | ✅ | ❌ | ❌ |
| Reiniciar contraseñas | ✅ | ❌ | ❌ |
| Exportar datos | ✅ | ✅ | ❌ |

#### Crear Usuario
1. Haz clic en "Nuevo Usuario"
2. Completa los campos:
   - **Nombre:** Nombre completo
   - **Email:** Correo electrónico (será el usuario de acceso)
   - **Contraseña:** Contraseña inicial
   - **Rol:** Admin, Editor o Viewer
3. El sistema enviará un email con las credenciales

#### Reiniciar Contraseña
1. Haz clic en el icono de llave en el usuario
2. Ingresa la nueva contraseña
3. Se enviará un email notificando el cambio

---

## Gestión del Carrusel

El carrusel de la página principal muestra un máximo de **8 galletas destacadas**.

### Añadir al Carrusel
1. Ve a "Galletas"
2. Activa el toggle "Carrusel" en la galleta deseada
3. Si ya hay 8 galletas, deberás quitar una primero

### Orden del Carrusel
Las galletas aparecen en el orden en que fueron añadidas al carrusel.

---

## Visibilidad de Galletas

### Página "Todas las Galletas" (`/galletas`)
- Solo muestra galletas con **Visible = Sí**
- Útil para ocultar galletas temporalmente sin eliminarlas

### Carrusel (Página Principal)
- Solo muestra galletas con **En Carrusel = Sí**
- Máximo 8 galletas
- Pueden ser visibles u ocultas independientemente

---

## Buenas Prácticas

### Imágenes
- **Formato recomendado:** JPG o PNG
- **Tamaño máximo:** 2MB
- **Dimensiones ideales:** 800x600px o superior
- **Fondo:** Preferiblemente blanco o transparente

### Descripciones
- Mantén descripciones concisas (2-3 líneas)
- Destaca ingredientes especiales
- Menciona alérgenos importantes

### Etiquetas
- Usa etiquetas consistentes
- No crear duplicados con diferentes nombres
- Mantén la paleta de colores corporativa

### Usuarios
- Asigna el rol mínimo necesario
- Revisa periódicamente los accesos
- Cambia contraseñas regularmente

---

## Soporte

Para soporte técnico, contacta a:
- **Email:** hola@crosti.bcn
- **Teléfono:** +34 931 234 567

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Diciembre 2025 | Versión inicial |

---

*Documento actualizado: Diciembre 2025*
*Crosti Cookies - Barcelona*
