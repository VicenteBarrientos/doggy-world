# Doggy World — Plan de Pruebas de la Beta Cerrada (5–10 Dueños Reales)

Este documento es una guía práctica de ejecución para **Vicente**. Su propósito es observar el comportamiento natural de dueños reales de perros interactuando por primera vez con Doggy World sin inducción previa.

---

## 1. Regla de Oro: Observar sin Explicar

> [!IMPORTANT]
> **No expliques cómo funciona la aplicación antes de que la usen.**
> Si tienes que explicarles dónde pulsar o qué es un pasaporte, la interfaz ha fallado en comunicarlo por sí misma. Queremos descubrir la verdad del producto.

---

## 2. Mensaje para Copiar y Enviar a los Testers

Copia y envía este texto exacto por WhatsApp o mensaje directo:

```text
¡Hola! Estoy probando Doggy World con un grupo muy chico de personas.

Entra desde tu celular:
https://doggy-world.vercel.app

Crea una cuenta y el perfil de tu perro.

No quiero explicarte cómo funciona antes porque justamente quiero ver si se entiende solo.

Si algo te confunde o no funciona, usa el botón de feedback dentro de la app o dímelo por acá. ¡Muchas gracias! 🐾
```

---

## 3. Matriz de Observación (Para registrar por Vicente)

Durante o después de cada sesión (idealmente observando la pantalla o pidiéndoles que comenten en voz alta lo que piensan):

| # | Pregunta de Observación | Respuestas esperadas / Fricción observada |
| :--- | :--- | :--- |
| 1 | **Comprensión de la Landing** | ¿Entendió de qué trata Doggy World al ver la portada? |
| 2 | **Acción Inicial** | ¿Pulsó el CTA principal ("Crear su mundo") sin dudar? |
| 3 | **Registro (Auth)** | ¿Pudo crear su cuenta sin tropiezos ni errores de contraseña? |
| 4 | **Creación del Perro** | ¿Pudo completar los datos esenciales sin pedir ayuda? |
| 5 | **Subida de Foto desde el Móvil** | ¿Su foto (tomada con la cámara del celular) cargó rápido y bien orientada? |
| 6 | **Comprensión del Pasaporte** | ¿Entendió qué es el pasaporte al verlo emitido con su foto? |
| 7 | **Intención de Compartir** | ¿Intentó tocar "Compartir pasaporte" o ver el código QR? |
| 8 | **Comprensión del QR** | ¿Comprendió para qué sirve el código QR del pasaporte? |
| 9 | **Puntos de Confusión** | ¿Hubo algún texto, botón o paso que le generara dudas? |
| 10 | **Exploración Voluntaria** | ¿Navegó hacia Comunidad, Amigos o Productos por iniciativa propia? |
| 11 | **Valor Percibido** | ¿Expresó interés genuino en mantener activo el perfil de su perro? |
| 12 | **Recomendación Orgánica** | ¿Compartió el enlace con algún amigo o familiar sin que se lo pidieras? |

---

## 4. Métricas de Éxito del Embudo (Primeros 5–10 Usuarios)

Para este tamaño de muestra, buscamos **evidencia direccional de tracción y claridad**, no significancia estadística masiva:

| Etapa | Métrica | Eventos Analíticos (`src/lib/analytics.ts`) | Señal de Salud |
| :--- | :--- | :--- | :--- |
| **Activación** | Tasa de Registro | `signup_completed` / `signup_started` | > 80% |
| **Creación** | Tasa de Creación de Perro | `dog_created` / `signup_completed` | > 85% |
| **Foto** | Finalización de Foto | `dog_photo_uploaded` / `dog_created` | > 90% |
| **Viralidad / Share** | Intención de Compartir | `passport_share_opened` / `dog_created` | > 50% |
| **Alcance Público** | Visitas Públicas | `passport_viewed_public` | > 2 visitas por perro |
| **Feedback** | Comentarios Recibidos | `beta_feedback_submitted` | Al menos 3 comentarios |

---

## 5. Distinción Rigurosa: Pruebas Sintéticas vs. Humanos Reales

- **Pruebas Automatizadas:** Vitest, ESLint, TypeScript, Turbopack Build. (Validan contratos de código).
- **Pruebas Sintéticas E2E:** Scripts automatizados (`live-beta-test.js`) que simulan llamadas de red. (Validan conectividad e infraestructura en producción).
- **Pruebas con Humanos Reales:** Sesiones independientes realizadas por dueños de perros en sus propios teléfonos. **Sólo estas constituyen validación humana real.**

---

## 6. Registro de Incidentes Durante la Beta

Si un tester reporta una falla:
1. Registra su modelo de teléfono y navegador (ej: *iPhone 14 Safari*, *Samsung S23 Chrome*).
2. Pregúntale qué estaba haciendo en el momento exacto.
3. Si ocurrió con una foto, consulta el formato original (JPG, HEIC, captura de pantalla).
4. Revisa los logs en Vercel y los registros en la tabla `public.beta_feedback` de Supabase.
