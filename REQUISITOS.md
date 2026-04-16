# ReservasPro - Requisitos funcionales

Documento vivo recopilando las decisiones de producto basadas en la experiencia diaria con CoverManager.

## Bloque 1 — Día a día y servicio

### 1.1 Plataforma de referencia
- **CoverManager** como referencia principal (lo conoce bien)

### 1.2 Turnos de servicio
- Por defecto: **comida + cena**
- **Configurables**: el restaurante debe poder añadir, editar o eliminar turnos desde configuración
- No limitar a 2 turnos fijos

### 1.3 Duración de la reserva
- **Duración abierta**: la mesa está ocupada hasta que los clientes se van (no hay timeout automático)
- Gestión **100% manual** por la persona de recepción/maître
- No hay auto-liberación

### 1.4 Doblaje de mesas
- **Desactivado por defecto**
- **Opcional**: se activa desde "Configuración" si el restaurante lo quiere
- Si está activado y se intenta solapar una reserva con otra existente:
  - El sistema muestra un **aviso inteligente**: *"Ojo con el tiempo, ¿deseas continuar con la reserva?"*
  - La persona decide si continúa (asume el riesgo)
- **Tiempo medio de referencia**: 1,5 horas por grupo (para calcular el aviso de solape)
- No es un bloqueo estricto, solo un warning

### 1.5 Salas y mesas — Jerarquía y editor
- **Jerarquía de dos niveles**:
  - **Planta** (floor/vista): COMEDOR, TERRASSA, PRIVAT → cada una es un plano de sala independiente
  - **Zona** (sub-área dentro de una planta): dentro de COMEDOR puede haber "Comedor" y "Barra"
- **Editor visual de sala** (muy importante)
- Funcionalidades del editor:
  - **Gestión de plantas**: crear, renombrar, borrar plantas. Cada planta tiene su propia vista en el plano
  - **Gestión de zonas**: crear zonas asignadas a una planta. Nombre de zona + planta padre
  - **Formas de mesa**: cuadrada, redonda, rectangular ancha, rectangular estrecha, pequeña
  - **Propiedades por mesa**: ID, Zona, Min pax, Max pax, Mesa alta / Mesa baja
  - **Elementos decorativos**: paredes, plantas, estrellas, sombrillas, barreras → para hacer el plano realista
  - Drag & drop en el canvas para posicionar mesas y decoración
  - Ajustar hasta que coincida con el restaurante real
- Cada restaurante se crea su propio layout
- Pestañas por planta en el editor (COMEDOR / TERRASSA / PRIVAT)

### 1.6 Combinaciones de mesas predefinidas
- Se definen desde configuración (pestaña "Combinación de mesas")
- Cada combinación especifica:
  - **Qué mesas** se combinan (ej: 20, 21, 25, 26, 27)
  - **Max pax** y **Min pax** para esa combinación
- Checkbox **"Subcombinable"**: permite que una combinación sea parte de otra mayor
  - Ej: Mesas 26+27 (4-6 pax) es sub-combinación de 20+21+25+26+27 (10-16 pax)
- Usado para **reservas online**: el sistema asigna automáticamente la combinación correcta según tamaño del grupo

## Bloque 2 — Canales y walk-ins

### 2.1 Canales de reserva
- **Teléfono** (principal, el más usado)
- **Google Reserve**
- **Walk-in** (cliente que llega sin reserva)
- (Posibles futuros: web propia, Instagram, Facebook, marketplaces)

### 2.2 Walk-ins
- Porcentaje walk-in vs reserva **varía por local** (no hay regla fija)
- Asignación de mesa **dinámica** (según disponibilidad del momento)
- **Función clave: "Bloquear web"**
  - Se puede bloquear una mesa o silla de barra individualmente
  - Las mesas bloqueadas solo son reservables **por teléfono / staff**
  - No aparecen disponibles en canales online (web, Google...)
  - Útil para reservar sitios estratégicos al personal

### 2.3 Estados de reserva
Se usan los 7 estados completos durante el servicio:
1. **Pendiente**
2. **Confirmada**
3. **Sentados**
4. **Comiendo**
5. **Postre**
6. **Cuenta**
7. **Completada**

## Bloque 3 — No-shows y confirmaciones

### 3.1 Política de no-shows
- **Sin política estricta** (sin depósitos ni retención de tarjeta)
- Confianza: reconfirmación como herramienta principal

### 3.2 Recordatorio
- **Un único recordatorio la mañana del día** de la reserva
- Canales: **WhatsApp o Email** (no hace falta SMS de momento)
- El mensaje incluye **link para confirmar o cancelar en un click**
- Si el cliente cancela desde el link → se actualiza al **instante** en el sistema del restaurante

### 3.3 Estado de reconfirmación
Cada reserva muestra de un vistazo si el cliente ha respondido al recordatorio:
- **Confirmada por el cliente**
- **Cancelada por el cliente**
- **Sin respuesta** (para saber a quién llamar por teléfono antes del servicio)

## Bloque 4 — CRM / Clientes

### 4.1 Datos del cliente (todos útiles)
- Nombre, Apellidos
- Teléfono (con prefijo internacional)
- Email
- Idioma preferido
- Empresa (para clientes corporativos)
- Alergias / intolerancias
- Preferencias (mesa, vino, etc.)
- Cumpleaños / aniversarios
- Nº visitas + última visita
- Notas del maître
- VIP flag
- Consentimiento comercial (RGPD)

### 4.2 Etiquetas
- **Personalizables** por cada restaurante
- Sin etiquetas predefinidas
- Aplicables a clientes y/o a reservas
- Libertad total para crear las que necesiten (VIP, celíaco, empresa, influencer, etc.)

### 4.3 Vinculación cliente ↔ reserva
- Matching **solo por coincidencia exacta de número de teléfono**
- Si el teléfono ya existe → se reconoce automáticamente como el mismo cliente (rellena datos)
- Si no existe → se crea nuevo cliente al guardar la reserva
- No hace falta Caller ID (búsqueda automática por llamada entrante)

### 4.4 Campos obligatorios al crear reserva
Solo tres campos obligatorios:
1. **Nombre**
2. **Apellido**
3. **Anotado por** (staff que toma la reserva)

Todo lo demás (email, notas, empresa, prescriptor, duración, etiquetas, etc.) es **opcional**.

### 4.5 Formulario de reserva (inspirado en CoverManager)
Campos útiles a incluir:
- **Día, Hora, Personas, Duración**
- **Zona / Mesa(s)** con min/max de capacidad
- **Estado** (pendiente, confirmada, sentados, comiendo, postre, cuenta, completada)
- **Tipo de reserva** (gratis, con menú, con prepago...)
- **Prescriptor** (quién recomendó al cliente)
- **Código / Referencia** de reserva
- **Etiquetas de la reserva**
- **Notas del establecimiento** sobre la reserva
- **Adjuntar archivo**
- **Anotado por** (dropdown con staff)
- **Datos del cliente** (Nombre, Apellido, Idioma, Prefijo país, Tel, Email)
- **Etiquetas del cliente**
- **Consentimiento comercial**
- **Notas del cliente / Información adicional**
- Botones: **Reservar** y **Reservar y notificar al cliente**

### 4.6 Gestión de staff / usuarios
- Cada restaurante crea sus **propios nombres de staff** (maître, camareros, recepción)
- El dropdown "Anotado por" se alimenta de esta lista
- Cada reserva registra quién la ha creado/modificado
- Lista editable desde configuración

### 4.7 Caller ID
- **No necesario** (descartado para mantener simple)

### 4.8 Listado de clientes (vista base de datos)
- Vista tabla con columnas: Nombre, Apellidos, Teléfono, Email, Empresa, Etiquetas, Notas del cliente
- **Búsqueda** por texto libre
- **Filtro por etiqueta**
- **Selección masiva** (checkboxes) para acciones en lote (borrar, exportar...)
- Botón "+ AÑADIR NUEVO CLIENTE"
- Dos botones por cliente: ver perfil / ver detalle rápido
- Columnas ordenables (click en header)

### 4.9 Detalle de cliente (perfil completo)
- **Panel izquierdo**: Avatar, nombre, país, idioma, botones: Editar datos, **Unificar cliente**, Eliminar cliente
- **"Unificar cliente"**: fusiona dos registros duplicados (muy útil cuando hay matching por teléfono imperfecto)
- **Acciones rápidas**: Añadir reserva, Enviar email, Enviar SMS
- **Resumen de comportamiento**:
  - Última visita, Gasto total, Gasto por visita, Gasto por persona
  - Visitas, No-shows, Canceladas, Media de valoraciones
  - Reservas en el grupo, Reservas como invitado, Listas de espera
- **Histórico de comportamientos**:
  - Dropdown para filtrar: Reservas, Listas de espera, etc.
  - Tabla: Estado, Fecha, Hora, Personas, Mesa(s), Notas de la reserva, Importe
  - Paginación


## Bloque 5 — Plano de sala (uso en servicio)

### 5.1 Vista principal
- **El plano es la vista principal** durante el servicio (más intuitivo y rápido que la lista)
- Se usa en **tablet o portal web dedicado** en recepción
- Modo oscuro por defecto (menos cansancio visual)
- Layout de dos paneles: **lista de reservas (izq) + plano visual (dcha)**

### 5.2 Barra de servicio (siempre visible arriba)
- **Toggle ON/OFF por turno** (Comida ON / Cena Cerrado)
  - ON = abierto para reservas online (web/Google)
  - OFF = cerrado para reservas online (solo telefónico/manual)
- **Contador de comensales** en tiempo real: "54 / 60" (ocupados / capacidad)
- **Contador de mesas** en tiempo real: "20 / 23" (ocupadas / total)
- **Fecha actual** con navegación (← día → ) y botón "HOY"
- Pestañas: **COMIDA / CENA / DÍA COMPLETO**

### 5.3 Filtros de reservas (panel lista)
- Filtro por estado: Todas / Re-Confirmadas / Pendientes / Lista de espera
- Búsqueda por nombre, apellido, teléfono
- Cada reserva muestra: nº mesa, hora, nombre, nº visitas (badge), pax, estado, canal (CH: Google), info/notas
- Botones: Crear lista de espera, imprimir, calendario

### 5.4 Plano visual
- Pestañas por zona: **Salón / Terraza / etc.**
- Mesas con colores por estado:
  - **Verde** = reservada/confirmada/sentados
  - **Marrón/gris** = libre sin reserva
  - **Candado 🔒** = bloqueada web (solo reservable por staff)
- Cada mesa muestra: **nº mesa (capacidad), hora, nombre cliente**
- Icono de estrella ⭐ para mesas combinadas
- Zoom y desplazamiento

### 5.5 Combinación de mesas (uso frecuente)
Tres modos de combinar:
1. **Al crear reserva**: puedes seleccionar múltiples mesas → todas se marcan en verde como grupo
2. **Desde el plano**: pestaña de desbloquear/mover mesas para reorganizar visualmente y dejarlo ordenado
3. **Combinaciones predefinidas** (configuración): para reservas online, el sistema asigna automáticamente combinaciones (ej: grupo de 8 → mesa 4+5)

### 5.6 Búsqueda global
- Siempre visible en el header
- Busca por nombre de cliente o referencia de reserva

## Bloque 6 — Pre y post servicio

### 6.1 Antes del servicio
- No hay informe/resumen previo formal
- **El plano ES el resumen**: el maître y el equipo lo miran juntos para preparar la sala
- El plano debe mostrar toda la info relevante a simple vista (nombres, hora, pax, notas)
- Las notas van **dentro de cada reserva** y son visibles en la lista
  - Ejemplo: "R: volen al raco de la barra", "R: alemanes e ingleses"

### 6.2 Notas entre turnos
- **No hace falta sistema de notas aparte**
- La info se anota en las notas de la propia reserva
- El siguiente turno la ve al abrir las reservas

### 6.3 Walk-ins
- Los walk-ins se registran como reserva con nombre "WALK IN" o el nombre del cliente
- Aparecen tanto en la lista como en el plano como cualquier otra reserva

### 6.4 Mesa TOTAL
- Mesa especial "0 - TOTAL" usada como control interno (CoverManager feature)

### 6.5 Después del servicio
- **Sin métricas ni informes post-servicio**
- No se necesitan: covers totales, no-shows, facturación, etc.
- Se cierra y se pasa al siguiente turno

## Bloque 7 — Prioridades personales

### 7.1 Lo mejor de CoverManager (a replicar)
- **Velocidad**: todo se hace rápido, pocos clicks
- **Todo en un panel**: plano + lista + info sin cambiar de pantalla
- **Mover mesas fácil**: drag & drop fluido e intuitivo
- **Cada funcionalidad es útil**: no sobra nada

### 7.2 Lo que se echa en falta
- Nada. CoverManager cumple bien.

### 7.3 Principios de diseño para ReservasPro
1. **Velocidad ante todo**: respuesta inmediata, mínimos clicks por acción
2. **Réplica fiel del flujo de CoverManager**: no inventar, seguir lo que funciona
3. **Todo visible en un panel**: no esconder info en submenús o pantallas separadas
4. **Tablet-first**: diseñado para uso en tablet/portal web dedicado
5. **Modo oscuro** por defecto
6. **Simplicidad**: si una funcionalidad no aporta al servicio diario, no la incluimos
