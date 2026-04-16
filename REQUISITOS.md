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

### 1.5 Salas y mesas
- **Editor visual de sala** (muy importante)
- Funcionalidades del editor:
  - Dibujar bordes/paredes de la sala
  - Colocar mesas: **cuadradas, rectangulares, redondas**
  - Crear y nombrar **zonas** (terraza, salón, privado, barra, etc.)
  - Mover, redimensionar y editar mesas
  - Ajustar hasta que coincida con el restaurante real
- Cada restaurante se crea su propio layout

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
*(Pendiente de entrevista)*

## Bloque 4 — CRM / Clientes
*(Pendiente de entrevista)*

## Bloque 5 — Plano de sala
*(Pendiente de entrevista)*

## Bloque 6 — Pre y post servicio
*(Pendiente de entrevista)*

## Bloque 7 — Prioridades personales
*(Pendiente de entrevista)*
