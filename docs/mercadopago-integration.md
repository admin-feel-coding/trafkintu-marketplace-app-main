# Integración MercadoPago y contexto actual (TRAFKINTU)

## Contexto actual de la app

- La app es un marketplace con arquitectura por features (Next.js App Router + TypeScript + Tailwind + shadcn/ui).
- El flujo de publicaciones destacadas hoy es manual: el panel pyme permite solicitar destacado y el admin aprueba/rechaza en mock.
- No hay integración de pagos en el código: el diálogo de “Solicitar Destacado” indica que el equipo contactará con instrucciones de pago.
- El estado destacado se controla con `isFeatured` y no existe expiración automática por tiempo.

## Objetivo

Integrar MercadoPago para habilitar pagos de publicaciones destacadas por **post y por días**.
Se acordó usar **el segundo rango de precios** (más accesible) como referencia inicial.

## Precio propuesto (por post, por días)

> Rango accesible (segundo rango):

- 7 días: **$3.990 – $4.990 CLP**
- 14 días: **$5.990 – $7.990 CLP**
- 30 días: **$9.990 – $12.990 CLP**

## Link de MercadoPago

- Link proporcionado: **link.mercadopago.cl/trafkintuapp**

> Nota: este link podría usarse como punto de redirección para pagos simples (checkout link). Si se requiere integración avanzada (preferencias, webhooks, estados), se debe usar la API de MercadoPago.

## Flujo sugerido (alto nivel)

1. **Pyme solicita destacado** desde dashboard.
2. **Admin aprueba la solicitud** (o se autoaprueba si decides un flujo directo).
3. El sistema **genera pago** y redirige a MercadoPago (link o preferencia de pago).
4. **Webhook** notifica pago aprobado.
5. Se activa `isFeatured` y se setean fechas:
   - `featuredAt`
   - `featuredUntil` (según plan 7/14/30)
6. Al vencer `featuredUntil`, la publicación deja de estar destacada.

## Cambios de dominio/repo recomendados (futuro)

- Nuevo tipo/entidad: `FeaturedPlan` (duración + precio).
- Nuevos campos en `Listing` o `FeaturedRequest`:
  - `featuredPlanId`, `featuredAt`, `featuredUntil`, `paymentStatus`, `paymentProviderId`
- Nuevo `PaymentRepository` en `domain/ports` y su implementación mock.

## Pendientes

- Confirmar tarifas oficiales de MercadoPago Chile (no accesible desde este entorno por bloqueo 403).
- Definir política de cupos de sección destacada (p. ej. máximo 3-5 posts simultáneos).
- Decidir si el pago se hace al aprobar solicitud o inmediatamente al solicitar.

## Implementacion en TRAFKINTU (Supabase)

- Edge Functions: `create-featured-payment` y `mp-webhook`.
- Variables en Supabase Functions: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`.
- Webhook URL: `https://<project>.supabase.co/functions/v1/mp-webhook`.
- Expiracion automatica: habilitar `pg_cron` y aplicar el SQL de `src/script/bootstrap.sql`.

## api mercado pago
# Obtener Access Token

Aprende a utilizar los flujos, también conocidos como _grant types_, para obtener un Access Token y acceder a los datos expuestos por una API. Estos flujos responden  a todos los escenarios de negocios que pueden aparecer en el consumo de APIs con base en el tipo de aplicación consumidora, su grado de confianza y cómo es la interacción del usuario en el proceso.

Los flujos de acceso disponibles para la generación del Access Token son:

- [Authorization code](/developers/es/docs/security/oauth/creation#bookmark_authorization_code): se van a usar credenciales para acceder a un recurso a nombre de un tercero.
- [Client credentials](/developers/es/docs/security/oauth/creation#bookmark_client_credentials): se van a usar credenciales para acceder a un recurso en nombre propio.

> WARNING
>
> Importante
>
> Si un Access Token generado a partir del flujo **Authorization code** es inválido o ha expirado, podrás utilizar el flujo **Refresh Token** para intercambiar una concesión temporal del tipo `refresh_token` por un Access Token. Esto  permite que el Access Token se actualice sin la necesidad de una nueva interacción del usuario después de la autorización concedida. Para más información, visita la documentación [Renovar Access Token](/developers/es/guides/additional-content/security/oauth/renewal).

## Authorization code

Este flujo se caracteriza por la intervención del vendedor para autorizar explícitamente el acceso de la aplicación a sus datos, y por el uso de un código otorgado por el servidor de autenticación para que la aplicación pueda obtener un Access Token y un _refresh token_ asociado.
Como se trata de un flujo basado en la redirección, debes permitir la interacción con el navegador del vendedor y recibir el `request` a través de la redirección del servidor de autorización. En este flujo, la aplicación solicita al vendedor el consentimiento expreso para acceder a los datos mediante la apertura de una página web, en la que se explicitan los ámbitos para los que se solicita el acceso.

> WARNING
>
> Importante
>
> Recuerda que utilizarás información sensible de tus vendedores. Asegúrate de guardarla de forma segura. No la utilices en la URL de autenticación y gestiona todo el proceso únicamente desde tu servidor.

Una vez autorizado, el servidor genera un código de acceso que llega a la aplicación a través de una redirección. En este paso, la aplicación solicita acceso al servidor de autenticación enviando el código obtenido y sus datos. Una vez hecho esto, el servidor otorga el Access Token y el _refresh token_ a la aplicación.

Mira a continuación cómo **configurar el protocolo PKCE** (un protocolo de seguridad no obligatorio que brinda una capa de protección extra, por lo que es recomendado) y luego **generar el Access Token**.

### Configurar PKCE

El **PKCE** (_Proof Key for Code Exchange_) es un protocolo de seguridad utilizado con OAuth para proteger contra ataques de código malicioso durante el intercambio de códigos de autorización por Access Token. Añade una capa adicional de seguridad generando un _verifier_ que se transforma en un _challenge_ para asegurar que, incluso si el código de autorización es interceptado, no sea útil sin el _verifier_ original.

Siga los pasos a continuación para habilitar y configurar el uso del flujo de código de autorización con PKCE.

1. Primero, en la pantalla de [Detalles de la aplicación](/developers/es/docs/your-integrations/application-details), haz clic en **Edita**r y **habilite el uso del flujo de código de autorización con PKCE**. Con el campo habilitado, Mercado Pago comenzará a **requerir como obligatorios** los campos `code_challenge` y `code_method` en las solicitudes de OAuth.
2. Los campos requeridos pueden generarse de varias formas, ya sea con desarrollo propio o mediante el uso de SDKs. Sigue los pasos necesarios descritos en [esta documentación oficial](https://datatracker.ietf.org/doc/html/rfc7636#section-4) para hacerlo.
3. Después de generar y cifrar los campos, será necesario enviar los códigos respectivos a Mercado Pago a través de `query_params`. Para eso, utiliza la URL de autenticación presentada a continuación, reemplazando los campos necesarios según se describen debajo.

```URL
https://auth.mercadopago.com/authorization?response_type=code&client_id=$APP_ID&redirect_uri=$YOUR_URL&code_challenge=$CODE_CHALLENGE&code_challenge_method=$CODE_METHOD
```

- **Redirect_uri**: URL proporcionada en el campo "URLs de redireccionamiento" de [tu aplicación](/developers/es/docs/your-integrations/application-details).
- **Code_verifier**: código que debe generarse, respetar los requisitos para su funcionamiento; es decir, ser una secuencia aleatoria de caracteres con una longitud de entre 43 y 128 caracteres, que incluya letras mayúsculas, minúsculas, números y algunos caracteres especiales. Por ejemplo: **47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU**.
- **Code_challenge**: a continuación, es necesario crear un `code_challenge`, a partir del `code_verifier`, utilizando una de las siguientes transformaciones:
 - Si es posible utilizar **S256**, será necesario seleccionar esta opción transformando el `code_verifier` en un `code_challenge` mediante una codificación `BASE64URL` después de aplicar la función "SHA256".
 - Si **no es posible utilizar S256** por alguna razón técnica, y el servidor admite el método **Plain**, es posible definir el `code_challenge` igual al `code_verifier`.
- **Code_challenge_method**: es el método utilizado para generar el `code_challenge`, según se describe en el ítem anterior. Este campo puede ser, por ejemplo, **S256** o **Plain**, dependiendo de la codificación seleccionada en la etapa de `code_challenge`. <br><br>

4. Después de enviar correctamente los códigos a Mercado Pago, obtendrás la autorización necesaria (`code_verifier`) para obtener el Access Token y realizar la verificación por PKCE en las transacciones realizadas con OAuth.

### Obtener token

El Access Token es el código utilizado en diferentes solicitudes de origen público para acceder a un recurso protegido. En este flujo, representa una autorización otorgada por un vendedor a una aplicación cliente, que contiene scopes y un tiempo de vigencia limitado para dicho acceso, y se concede por medio de una URL de redirección 

Sigue los pasos a continuación para obtenerlo.

> WARNING
>
> Atención
>
> Se recomienda realizar este procedimiento de una única vez junto con el usuario, ya que el código recibido por la "URL de redireccionamiento" después de la autorización tiene una validez de 10 minutos y el Access Token recibido a través del endpoint tiene una validez de 180 días (6 meses).

1. Edita tu aplicación para que contenga tu URLs de redireccionamiento. Consulta [Editar aplicación](/developers/es/docs/your-integrations/application-details).
2. Envía la **URL de autenticación** con los siguientes campos al vendedor con cuya cuenta deseas vincular la tuya:

   ```Authentication_URL
   https://auth.mercadopago.com/authorization?client_id=APP_ID&response_type=code&platform_id=mp&state=RANDOM_ID&redirect_uri=   https://www.mercadopago.com.br/developers/example/redirect-url 
   ```

   |Campos|Descripción|
   |---|---|
   |Client_id| Reemplaza el valor "APP_ID" con el **número de su aplicación**. Consulta [Detalles de la aplicación](/developers/es/docs/your-integrations/application-details) para más información.|
   |State| Reemplaza el valor "RANDOM_ID" con un identificador que sea único para cada intento y que no incluya información sensible, de forma que pueda identificar de quién es el código recibido. Así, podrás garantizar que la respuesta pertenezca a una solicitud iniciada por la misma aplicación. |
   |Redirect_uri| Agrega la URL informada en el campo "URLs de redireccionamiento" de su aplicación. **Asegúrate de que el redirect_uri sea una URL estática**. Consulta [Detalles de la aplicación](/developers/es/docs/your-integrations/application-details) para más información.|

   > Si deseas enviar parámetros adicionales en `redirect_uri`, utiliza el parámetro `state` para incluir esa información. De lo contrario, la llamada recibirá una respuesta de error si la URL no coincide exactamente con la configuración de la aplicación.

3. Espera a que el vendedor acceda a la URL y permita el acceso. Al ingresar a la URL, el vendedor será dirigido a Mercado Pago y deberá iniciar sesión en su cuenta para realizar la autorización.
4. Verifica la **URL de redireccionamiento** de tu servidor para ver el código de autorización devuelto en el parámetro de **code**.

   ```Redirect_URL
   https://www.mercadopago.com.br/developers/example/redirect-url 
   ```
  
5. Envía tus [credenciales](/developers/es/docs/your-integrations/credentials) (`client_id` y `client_secret`), el **código de autorización** que fue devuelto en la propiedad `code` y, si has [configurado el PKCE](/developers/pt/docs/security/oauth/creation#:~:text=Access%20Token.-,Configurar%20PKCE,-O%20PKCE%20), el valor `code_verifier` al endpoint [/oauth/token](/developers/es/reference/oauth/_oauth_token/post) para recibir el Access Token como respuesta.

[[[
```php
<?php
  $client = new OauthClient();
   $request = new OAuthCreateRequest();
     $request->client_secret = "CLIENT_SECRET";
     $request->client_id = "CLIENT_ID";
     $request->code = "CODE";
     $request->redirect_uri = "REDIRECT_URI";

  $client->create($request);
?>
```
```java

OauthClient client = new OauthClient();

String authorizationCode = "TG-XXXXXXXX-241983636";
client.createCredential(authorizationCode, null);
```
```node
const client = new MercadoPagoConfig({ accessToken: 'access_token', options: { timeout: 5000 } }); 

const oauth = new OAuth(client);

oauth.create({
	'client_secret': 'your-client-secret',
	'client_id': 'your-client-id',
	'code': 'return-of-getAuthorizationURL-function',
	'redirect_uri': 'redirect-uri'
}).then((result) => console.log(result))
	.catch((error) => console.log(error));
```
```curl
curl -X POST \
    'https://api.mercadopago.com/oauth/token'\
    -H 'Content-Type: application/json' \
    -d '{
  "client_id": "client_id",
  "client_secret": "client_secret",
  "code": "TG-XXXXXXXX-241983636",
  "grant_type": "authorization_code",
  "redirect_uri": "   https://www.mercadopago.com.br/developers/example/redirect-url ",
  "refresh_token": "TG-XXXXXXXX-241983636",
  "test_token": "false"
}'
```
]]]

> Para generar credenciales de _sandbox_ para pruebas, envía el parámetro `test_token` con el valor `true`.

## Client credentials

Este flujo se utiliza cuando las aplicaciones solicitan un Access Token usando solo sus propias credenciales y para acceder a sus propios recursos. La principal diferencia con respecto a los otros flujos es que el usuario no interactúa en el proceso y, por lo tanto, la aplicación no puede actuar en su nombre.

### Obtener token

Access Token es el código utilizado en diferentes solicitudes de origen público para acceder a un recurso protegido. En este flujo, se obtiene el Access Token sin interacción del usuario y solo para acceder a sus propios recursos.

Sigue los pasos a continuación para obtenerlo.

1. Envía tus [credenciales](/developers/es/docs/your-integrations/credentials) (`client_id` y `client_secret`) al endpoint [/oauth/token](/developers/es/reference/oauth/_oauth_token/post), incluyendo el código `client_credentials` en el parámetro `grant_type` para recibir una nueva respuesta con un nuevo `access_token`.
2. Actualiza la aplicación con el Access Token recibido en la respuesta. 

> WARNING
>
> Atención
>
> **El _token_ recibido tiene una validez de 6 horas.** No olvides renovarlo antes de este período de expiración para que sus aplicaciones sigan funcionando correctamente.

[[[
```php
<?php
  $client = new OauthClient();
   $request = new OAuthCreateRequest();
     $request->client_secret = "CLIENT_SECRET";
     $request->client_id = "CLIENT_ID";

  $client->create($request);
?>
```
```node
const client = new MercadoPagoConfig({ accessToken: 'access_token', options: { timeout: 5000 } }); 

const oauth = new OAuth(client);

oauth.create({
	'client_secret': 'your-client-secret',
	'client_id': 'your-client-id',
}).then((result) => console.log(result))
	.catch((error) => console.log(error));
```
```curl
curl -X POST \
    'https://api.mercadopago.com/oauth/token'\
    -H 'Content-Type: application/json' \
    -d '{
  "client_id": "client_id",
  "client_secret": "client_secret",
  "grant_type": "client_credentials",
}'
```
]]]

## webhook secret 
# Webhooks 

Webhooks (también conocido como devolución de llamada web) es un método simple que facilita que una aplicación o sistema proporcione información en tiempo real cada vez que ocurre un evento, es decir, es una forma de recibir datos pasivamente entre dos sistemas a través de un `HTTP POST`.

Las notificaciones Webhooks se pueden configurar para una o más aplicaciones creadas en [Tus integraciones](/developers/panel/app). También es posible configurar una URL de prueba que, junto con las credenciales de prueba, permitirá verificar el correcto funcionamiento de las notificaciones previo a salir a producción.

Una vez configurada, la notificación Webhook será enviada cada vez que ocurra uno o más eventos registrados, evitando la necesidad de verificaciones constantes y, consecuentemente, previniendo la sobrecarga del sistema y la pérdida de datos en situaciones críticas.

Para configurar notificaciones Webhooks, puedes elegir una de las opciones a continuación. 

| Tipo de configuración | Descripción |
|---|---|
| [Configuración a través de Tus integraciones](/developers/es/docs/your-integrations/notifications/webhooks#configuracinatravsdetusintegraciones) | Permite configurar notificaciones para cada una de tus aplicaciones, identificar cuentas distintas en caso de ser necesario, y validar el origen de la notificación utilizando una firma secreta. |
| [Configuración durante la creación de pagos](/developers/es/docs/your-integrations/notifications/webhooks#configuracinalcrearpagos) | Permite la configuración específica de notificaciones para cada pago, preferencia u orden . |

> WARNING
>
> Importante
>
> Las URLs configuradas durante la creación de un pago tendrán prioridad por sobre aquellas configuradas a través de Tus integraciones.

Una vez que las notificaciones sean configuradas, consulta las [acciones necesarias después de recibir una notificación](/developers/es/docs/your-integrations/notifications/webhooks#accionesnecesariasdespusderecibirlanotificacin) para validar que las mismas fueron debidamente recibidas.

## Configuración a través de Tus integraciones

Puedes configurar notificaciones para cada una de tus aplicaciones directamente desde [Tus integraciones](/developers/panel/app) de manera eficiente y segura. En este apartado, explicaremos cómo:
 1. Indicar las URLs de notificación y configurar eventos
 2. Validar el origen de una notificación
 3. Simular el recibimiento de una notificación

> WARNING
>
> Importante
>
> Este método de configuración no está disponible para integraciones con  [Suscripciones](/developers/es/docs/subscriptions/overview). Para configurar notificaciones con alguna de estas dos integraciones, utiliza el método [Configuración durante la creación de un pago](/developers/es/docs/your-integrations/notifications/webhooks#configuracinalcrearpagos).

### 1. Indicar URLs de notificación y configurar eventos

Para configurar notificaciones Webhooks mediante Tus integraciones, es necesario indicar las URLs a las que las mismas serán enviadas y especificar los eventos para los cuales deseas recibirlas. 

Para hacerlo, sigue el paso a paso a continuación:

1. Ingresa a [Tus Integraciones](/developers/panel/app) y selecciona la aplicación para la que deseas activar las notificaciones. En caso de que aún no hayas creado una aplicación, accede a la [documentación sobre el Panel del Desarrollador](/developers/es/docs/your-integrations/dashboard) y sigue las instrucciones para poder hacerlo.
2. En el menú de la izquierda, selecciona **Webhooks > Configurar notificaciones**, y configura las URLs que serán utilizadas para recibirlas. Recomendamos utilizar dos URLs diferentes para el modo de pruebas y el modo producción:
    * **URL modo pruebas:** proporciona una URL que permita probar el correcto funcionamiento de las notificaciones de la aplicación durante la etapa de desarrollo. La prueba de estas notificaciones deberá ser realizada exclusivamente con **credenciales de prueba del usuario productivo** con el que creaste la aplicación.
    * **URL modo producción:** proporciona una URL para recibir notificaciones con tu integración productiva. Estas notificaciones deberán ser configuradas con tus **credenciales productivas**.

![webhooks](/images/dashboard/webhooks-es.png)

> NOTE
>
> Nota
> 
> En caso de ser necesario identificar múltiples cuentas, agrega el parámetro `?cliente=(nombredelvendedor)` al final de la URL indicada para identificar a los vendedores.

3. Selecciona los **eventos** de los que recibirás notificaciones, que serán enviadas en formato `JSON` a través de un `HTTP POST` a la URL especificada anteriormente. Un evento puede ser cualquier actualización sobre el tópico reportado, incluyendo cambios de status o atributos. Consulta la tabla a continuación para ver qué eventos pueden ser configurados teniendo en cuenta la solución de Mercado Pago integrada y las particularidades de negocio.

| Eventos | Nombre en Tus integraciones | Tópico | Productos asociados |
|---|---|---|---|
| Creación y actualización de pagos | Order (Mercado Pago)  | `orders` | [Checkout API](/developers/es/docs/checkout-api-orders/overview)<br>[Mercado Pago Point](/developers/es/docs/mp-point/landing)<br>[Código QR](/developers/es/docs/qr-code/overview) |
| Creación y actualización de pagos | Pagos | `payment` | [Checkout API](/developers/es/docs/checkout-api-payments/overview) (**legacy**)<br>[Checkout Pro](/developers/es/docs/checkout-pro/overview)<br>[Checkout Bricks](/developers/es/docs/checkout-bricks/overview)<br>[Suscripciones](/developers/es/docs/subscriptions/overview)<br>[Wallet Connect](/developers/es/docs/wallet-connect/landing) |
| Pago recurrente de una suscripción (creación y actualización) | Planes y suscripciones | `subscription_authorized_payment` | [Suscripciones](/developers/es/docs/subscriptions/overview) |
| Vinculación de una suscripción (creación y actualización) | Planes y suscripciones | `subscription_preapproval` | [Suscripciones](/developers/es/docs/subscriptions/overview) |
| Vinculación de un plan de suscripción (creación y actualización) | Planes y suscripciones | `subscription_preapproval_plan` | [Suscripciones](/developers/es/docs/subscriptions/overview) |
| Vinculación y desvinculación de cuentas conectadas a través de OAuth. | Vinculación de aplicaciones | `mp-connect` | Todos los productos que hayan implementado OAuth |
| Transacciones de Wallet Connect | Wallet Connect | `wallet_connect` | [Wallet Connect](/developers/es/docs/wallet-connect/landing) |
| Alertas de fraude luego del procesamiento de un pedido | Alertas de fraude | `stop_delivery_op_wh` | [Checkout API](/developers/es/docs/checkout-api-orders/overview)<br>[Checkout Pro](/developers/es/docs/checkout-pro/overview) |
| Creación de reclamos y reembolsos | Reclamos | `topic_claims_integration_wh` | [Checkout API](/developers/es/docs/checkout-api-orders/overview)<br>[Checkout Pro](/developers/es/docs/checkout-pro/overview)<br>[Checkout Bricks](/developers/es/docs/checkout-bricks/overview)<br>[Suscripciones](/developers/es/docs/subscriptions/overview)<br>[Wallet Connect](/developers/es/docs/wallet-connect/landing) |
| Recuperación y actualización información de tarjetas dentro de Mercado Pago. | Card Updater | `topic_card_id_wh` | [Checkout Pro](/developers/es/docs/checkout-pro/overview)<br>[Checkout API](/developers/es/docs/checkout-api-orders/overview)<br>[Checkout Bricks](/developers/es/docs/checkout-bricks/overview) |
| Creación, actualización o cierre de órdenes comerciales |  Órdenes comerciales | `topic_merchant_order_wh` | [Checkout Pro](/developers/es/docs/checkout-pro/overview)<br>[Código QR](/developers/es/docs/qr-code-legacy/overview) (**legacy**)  |
| Apertura de contracargos, cambios de status y modificaciones referentes a las liberaciones de dinero.   |   Contracargos | `topic_chargebacks_wh`  | [Checkout Pro](/developers/es/docs/checkout-pro/overview)<br>[Checkout API](/developers/es/docs/checkout-api-orders/overview)<br>[Checkout Bricks](/developers/es/docs/checkout-bricks/overview) |

> WARNING
>
> Importante
>
> En caso de dudas sobre los tópicos a activar o los eventos que serán notificados, consulta la documentación [Información adicional sobre notificaciones](/developers/es/docs/your-integrations/notifications/additional-info). 

5. Por último, haz clic en **Guardar**. Esto generará una **clave secreta** exclusiva para la aplicación, que permitirá validar la autenticidad de las notificaciones recibidas, garantizando que hayan sido enviadas por Mercado Pago. Ten en cuenta que esta clave generada no tiene plazo de caducidad y su renovación periódica no es obligatoria, aunque sí recomendada. Para hacerlo, basta con cliquear en el botón **Restablecer**. 

### 2. Validar origen de una notificación

Las notificaciones enviadas por Mercado Pago serán semejantes al siguiente ejemplo para un alerta del tópico `payment`:

```json
{
 "id": 12345,
 "live_mode": true,
 "type": "payment",
 "date_created": "2015-03-25T10:04:58.396-04:00",
 "user_id": 44444,
 "api_version": "v1",
 "action": "payment.created",
 "data": {
     "id": "999999999"
 }
}
```

Mercado Pago siempre incluirá la clave secreta en las notificaciones Webhooks que serán recibidas, lo que permitirá validar su autenticidad para proporcionar mayor seguridad y prevenir posibles fraudes. 

Esta clave será enviada en el _header_ `x-signature`, que será similar al ejemplo debajo.

```x-signature

`ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839`

```

Para confirmar la validación, es necesario extraer la clave contenida en el *header* y compararla con la clave otorgada para tu aplicación en Tus integraciones. Esto podrá ser hecho siguiendo el paso a paso a continuación. Además, al final, disponibilizamos nuestros SDKs con ejemplos de códigos completos para facilitar el proceso.

1. Para extraer el _timestamp_ (`ts`) y la clave del _header_ `x-signature`, divide el contenido del _header_ por el carácter `,`, lo que resultará en una lista de elementos. El valor para el prefijo `ts` es el _timestamp_ (en milisegundos) de la notificación y `v1` es la clave encriptada. Siguiendo el ejemplo presentado anteriormente, `ts=1704908010` y `v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839`.
2. Utilizando el _template_ a continuación, sustituye los parámetros con los datos recibidos en tu notificación.

```template
id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
```

 * Los parámetros con el sufijo `_url` provienen de _query params_. Ejemplo: `[data.id_url]` se sustituirá por el valor correspondiente al ID del evento (`data.id`) y, en este caso, si el `data.id_url` es alfanumérico, deberá enviarse obligatoriamente en minúsculas. Este query param puede ser hallado en la notificación recibida.
 * `[ts_header]` será el valor `ts` extraído del _header_ `x-signature`.
 * `[x-request-id_header]` deberá ser sustituido por el valor recibido en el _header_ `x-request-id`.

> WARNING
>
> Importante
> 
> Si alguno de los valores presentados en el modelo anterior no está presente en la notificación recibida, debes removerlo.

3. En [Tus integraciones](/developers/panel/app), selecciona la aplicación integrada, ve a la sección de Webhooks y revela la clave secreta generada.
4. Genera la contraclave para la validación. Para hacer esto, calcula un [HMAC](https://es.wikipedia.org/wiki/HMAC) con la función de `hash SHA256` en base hexadecimal, utilizando la **clave secreta** como clave y el _template_ con los valores como mensaje.

[[[
```php
$cyphedSignature = hash_hmac('sha256', $data, $key);
```
```node
const crypto = require('crypto');
const cyphedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureTemplateParsed)
    .digest('hex'); 
```
```java
String cyphedSignature = new HmacUtils("HmacSHA256", secret).hmacHex(signedTemplate);
```
```python
import hashlib, hmac, binascii

cyphedSignature = binascii.hexlify(hmac_sha256(secret.encode(), signedTemplate.encode()))
```
]]]

5. Finalmente, compara la clave generada con la clave extraída del _header_, asegurándote de que tengan una correspondencia exacta. Además, puedes usar el _timestamp_ extraído del _header_ para compararlo con un _timestamp_ generado en el momento de la recepción de la notificación, con el fin de establecer una tolerancia de demora en la recepción del mensaje.

A continuación, puedes ver ejemplos de código completo:

[[[
```php
<?php
// Obtain the x-signature value from the header
$xSignature = $_SERVER['HTTP_X_SIGNATURE'];
$xRequestId = $_SERVER['HTTP_X_REQUEST_ID'];

// Obtain Query params related to the request URL
$queryParams = $_GET;

// Extract the "data.id" from the query params
$dataID = isset($queryParams['data.id']) ? $queryParams['data.id'] : '';

// Separating the x-signature into parts
$parts = explode(',', $xSignature);

// Initializing variables to store ts and hash
$ts = null;
$hash = null;

// Iterate over the values to obtain ts and v1
foreach ($parts as $part) {
    // Split each part into key and value
    $keyValue = explode('=', $part, 2);
    if (count($keyValue) == 2) {
        $key = trim($keyValue[0]);
        $value = trim($keyValue[1]);
        if ($key === "ts") {
            $ts = $value;
        } elseif ($key === "v1") {
            $hash = $value;
        }
    }
}

// Obtain the secret key for the user/application from Mercadopago developers site
$secret = "your_secret_key_here";

// Generate the manifest string
$manifest = "id:$dataID;request-id:$xRequestId;ts:$ts;";

// Create an HMAC signature defining the hash type and the key as a byte array
$sha = hash_hmac('sha256', $manifest, $secret);
if ($sha === $hash) {
    // HMAC verification passed
    echo "HMAC verification passed";
} else {
    // HMAC verification failed
    echo "HMAC verification failed";
}
?>
```
```javascript
// Obtain the x-signature value from the header
const xSignature = headers['x-signature']; // Assuming headers is an object containing request headers
const xRequestId = headers['x-request-id']; // Assuming headers is an object containing request headers

// Obtain Query params related to the request URL
const urlParams = new URLSearchParams(window.location.search);
const dataID = urlParams.get('data.id');

// Separating the x-signature into parts
const parts = xSignature.split(',');

// Initializing variables to store ts and hash
let ts;
let hash;

// Iterate over the values to obtain ts and v1
parts.forEach(part => {
    // Split each part into key and value
    const [key, value] = part.split('=');
    if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        if (trimmedKey === 'ts') {
            ts = trimmedValue;
        } else if (trimmedKey === 'v1') {
            hash = trimmedValue;
        }
    }
});

// Obtain the secret key for the user/application from Mercadopago developers site
const secret = 'your_secret_key_here';

// Generate the manifest string
const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

// Create an HMAC signature
const hmac = crypto.createHmac('sha256', secret);
hmac.update(manifest);

// Obtain the hash result as a hexadecimal string
const sha = hmac.digest('hex');

if (sha === hash) {
    // HMAC verification passed
    console.log("HMAC verification passed");
} else {
    // HMAC verification failed
    console.log("HMAC verification failed");
}
```
```python
import hashlib
import hmac
import urllib.parse

# Obtain the x-signature value from the header
xSignature = request.headers.get("x-signature")
xRequestId = request.headers.get("x-request-id")

# Obtain Query params related to the request URL
queryParams = urllib.parse.parse_qs(request.url.query)

# Extract the "data.id" from the query params
dataID = queryParams.get("data.id", [""])[0]

# Separating the x-signature into parts
parts = xSignature.split(",")

# Initializing variables to store ts and hash
ts = None
hash = None

# Iterate over the values to obtain ts and v1
for part in parts:
    # Split each part into key and value
    keyValue = part.split("=", 1)
    if len(keyValue) == 2:
        key = keyValue[0].strip()
        value = keyValue[1].strip()
        if key == "ts":
            ts = value
        elif key == "v1":
            hash = value

# Obtain the secret key for the user/application from Mercadopago developers site
secret = "your_secret_key_here"

# Generate the manifest string
manifest = f"id:{dataID};request-id:{xRequestId};ts:{ts};"

# Create an HMAC signature defining the hash type and the key as a byte array
hmac_obj = hmac.new(secret.encode(), msg=manifest.encode(), digestmod=hashlib.sha256)

# Obtain the hash result as a hexadecimal string
sha = hmac_obj.hexdigest()
if sha == hash:
    # HMAC verification passed
    print("HMAC verification passed")
else:
    # HMAC verification failed
    print("HMAC verification failed")
```
```go
import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Obtain the x-signature value from the header
		xSignature := r.Header.Get("x-signature")
		xRequestId := r.Header.Get("x-request-id")

		// Obtain Query params related to the request URL
		queryParams := r.URL.Query()

		// Extract the "data.id" from the query params
		dataID := queryParams.Get("data.id")

		// Separating the x-signature into parts
		parts := strings.Split(xSignature, ",")

		// Initializing variables to store ts and hash
		var ts, hash string

		// Iterate over the values to obtain ts and v1
		for _, part := range parts {
			// Split each part into key and value
			keyValue := strings.SplitN(part, "=", 2)
			if len(keyValue) == 2 {
				key := strings.TrimSpace(keyValue[0])
				value := strings.TrimSpace(keyValue[1])
				if key == "ts" {
					ts = value
				} else if key == "v1" {
					hash = value
				}
			}
		}

		// Get secret key/token for specific user/application from Mercadopago developers site
		secret := "your_secret_key_here"

		// Generate the manifest string
		manifest := fmt.Sprintf("id:%v;request-id:%v;ts:%v;", dataID, xRequestId, ts)

		// Create an HMAC signature defining the hash type and the key as a byte array
		hmac := hmac.New(sha256.New, []byte(secret))
		hmac.Write([]byte(manifest))

		// Obtain the hash result as a hexadecimal string
		sha := hex.EncodeToString(hmac.Sum(nil))

if sha == hash {
    // HMAC verification passed
    fmt.Println("HMAC verification passed")
} else {
    // HMAC verification failed
    fmt.Println("HMAC verification failed")
}

	})
}
```
]]]

### 3. Simular la recepción de la notificación

Para garantizar que las notificaciones sean configuradas correctamente, es necesario simular su recepción. Para hacerlo, sigue el paso a paso a continuación.

1. Después de configurar las URLs y los Eventos, haz clic en **Guardar** para guardar la configuración.
2. Luego, haz clic en **Simular** para probar si la URL indicada está recibiendo las notificaciones correctamente.
3. En la pantalla de simulación, selecciona la URL que se va a probar, que puede ser **la URL de prueba o la de producción**.
4. A continuación, elige el **tipo de evento** e ingresa la **identificación** que se enviará en el cuerpo de la notificación.
5. Por último, haz clic en **Enviar prueba** para verificar la solicitud, la respuesta proporcionada por el servidor y la descripción del evento.

## Configuración al crear pagos

Durante el proceso de creación de pagos, preferencias u órdenes presenciales, es posible configurar la URL de notificación de forma más específica para cada pago utilizando el campo `notification_url` e implementando un receptor de notificaciones. 

A continuación, explicamos cómo configurar notificaciones al crear un pago utilizando nuestros SDKs.

1. En el campo `notification_url`, indica la URL desde la que se recibirán las notificaciones, como se muestra a continuación. Para recibir exclusivamente Webhooks y no IPN, agrega el parámetro `source_news=webhooks` a la `notification_url`. Por ejemplo: `https://www.yourserver.com/notifications?source_news=webhooks`.

[[[
```php
<?php 
$client = new PaymentClient();

        $body = [
            'transaction_amount' => 100,
            'token' => 'token',
            'description' => 'description',
            'installments' => 1,
            'payment_method_id' => 'visa',
            'notification_url' => 'http://test.com',
            'payer' => array(
                'email' => 'test@test.com',
                'identification' => array(
                    'type' => 'CPF',
                    'number' => '19119119100'
                )
            )
        ];

$client->create(body);
?>
```
```node
const client = new MercadoPagoConfig({ accessToken: 'ACCESS_TOKEN' });
const payment = new Payment(client);

const body = {
 transaction_amount: '100',
  token: 'token',
  description: 'description',
  installments: 1,
  payment_method_id: 'visa',
  notification_url: 'http://test.com',
  payer: {
    email: 'test@test.com',
    identification: {
      type: 'CPF',
      number: '19119119100'
    }
  }
};

payment.create({ body: body, requestOptions: { idempotencyKey: '<SOME_UNIQUE_VALUE>' } }).then(console.log).catch(console.log);
```
```java
MercadoPago.SDK.setAccessToken("YOUR_ACCESS_TOKEN");

Payment payment = new Payment();
payment.setTransactionAmount(Float.valueOf(request.getParameter("transactionAmount")))
      .setToken(request.getParameter("token"))
      .setDescription(request.getParameter("description"))
      .setInstallments(Integer.valueOf(request.getParameter("installments")))
      .setPaymentMethodId(request.getParameter("paymentMethodId"))
      .setNotificationUrl("http://requestbin.fullcontact.com/1ogudgk1");

Identification identification = new Identification(); 

Payer payer = new Payer();
payer.setEmail(request.getParameter("email"))
    .setIdentification(identification);
   
payment.setPayer(payer);

payment.save();

System.out.println(payment.getStatus());

```
```ruby
require 'mercadopago'
sdk = Mercadopago::SDK.new('YOUR_ACCESS_TOKEN')

payment_data = {
 transaction_amount: params[:transactionAmount].to_f,
 token: params[:token],
 description: params[:description],
 installments: params[:installments].to_i,
 payment_method_id: params[:paymentMethodId],
 notification_url: "http://requestbin.fullcontact.com/1ogudgk1",
 payer: {
   email: params[:email],
   identification: {
     number: params[:docNumber]
   }
 }
}

payment_response = sdk.payment.create(payment_data)
payment = payment_response[:response]

puts payment

```
```csharp
using System;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Config;
using MercadoPago.Resource.Payment;

MercadoPagoConfig.AccessToken = "YOUR_ACCESS_TOKEN";

var paymentRequest = new PaymentCreateRequest
{
   TransactionAmount = decimal.Parse(Request["transactionAmount"]),
   Token = Request["token"],
   Description = Request["description"],
   Installments = int.Parse(Request["installments"]),
   PaymentMethodId = Request["paymentMethodId"],
   NotificationUrl = "http://requestbin.fullcontact.com/1ogudgk1",

   Payer = new PaymentPayerRequest
   {
       Email = Request["email"],
       Identification = new IdentificationRequest
       {
           Number = Request["docNumber"],
       },
   },
};

var client = new PaymentClient();
Payment payment = await client.CreateAsync(paymentRequest);

Console.WriteLine(payment.Status);

```
```python
import mercadopago
sdk = mercadopago.SDK("ACCESS_TOKEN")

payment_data = {
   "transaction_amount": float(request.POST.get("transaction_amount")),
   "token": request.POST.get("token"),
   "description": request.POST.get("description"),
   "installments": int(request.POST.get("installments")),
   "payment_method_id": request.POST.get("payment_method_id"),
   "notification_url" =  "http://requestbin.fullcontact.com/1ogudgk1",
   "payer": {
       "email": request.POST.get("email"),
       "identification": {
           "number": request.POST.get("number")
       }
   }
}

payment_response = sdk.payment().create(payment_data)
payment = payment_response["response"]

print(payment)
```
```go
accessToken := "{{ACCESS_TOKEN}}"

cfg, err := config.New(accessToken)
if err != nil {
   fmt.Println(err)
   return
}

client := payment.NewClient(cfg)

request := payment.Request{
   TransactionAmount: <transactionAmount>,
   Token: <token>,
   Description: <description>,
   Installments: <installments>,
   PaymentMethodID:   <paymentMethodId>,
   NotificationURL: "https:/mysite.com/notifications/new",
   Payer: &payment.PayerRequest{
      Email: <email>,
      Identification: &payment.IdentificationRequest{
         Type: <type>,
         Number: <number>,
      },
   },
}

resource, err := client.Create(context.Background(), request)
if err != nil {
fmt.Println(err)
}

fmt.Println(resource)
```
```curl
curl -X POST \
   -H 'accept: application/json' \
   -H 'content-type: application/json' \
   -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
   'https://api.mercadopago.com/v1/payments' \
   -d '{
         "transaction_amount": 100,
         "token": "ff8080814c11e237014c1ff593b57b4d",
         "description": "Blue shirt",
         "installments": 1,
         "payment_method_id": "visa",
         "issuer_id": 310,
         "notification_url": "http://requestbin.fullcontact.com/1ogudgk1",
         "payer": {
           "email": "test@test.com"

         }
   }'

```
]]]

2. Implementa el receptor de notificaciones usando el siguiente código como ejemplo:

```php
<?php
 MercadoPago\SDK::setAccessToken("ENV_ACCESS_TOKEN");
 switch($_POST["type"]) {
     case "payment":
         $payment = MercadoPago\Payment::find_by_id($_POST["data"]["id"]);
         break;
     case "plan":
         $plan = MercadoPago\Plan::find_by_id($_POST["data"]["id"]);
         break;
     case "subscription":
         $plan = MercadoPago\Subscription::find_by_id($_POST["data"]["id"]);
         break;
     case "invoice":
         $plan = MercadoPago\Invoice::find_by_id($_POST["data"]["id"]);
         break;
     case "point_integration_wh":
         // $_POST contiene la informaciòn relacionada a la notificaciòn.
         break;
 }
?>
```

Luego de realizar la configuración  necesaria, la notificación Webhook será enviada con formato `JSON`. Puedes ver a continuación un ejemplo de notificación del tópico `payment`, y las descripciones de la información enviada en la tabla debajo.

> WARNING
>
> Importante
>
> Los pagos de prueba, creados con credenciales de prueba, no enviarán notificaciones. La única vía para probar la recepción de notificaciones es mediante la [Configuración a través de Tus integraciones](/developers/es/docs/your-integrations/notifications/webhooks#configuracinatravsdetusintegraciones).

```json
{
 "id": 12345,
 "live_mode": true,
 "type": "payment",
 "date_created": "2015-03-25T10:04:58.396-04:00",
 "user_id": 44444,
 "api_version": "v1",
 "action": "payment.created",
 "data": {
     "id": "999999999"
 }
}
```

| Atributo | Descripción | Ejemplo en el JSON |
| --- | --- | --- |
| **id** | ID de la notificación | `12345` |
| **live_mode** | Indica si la URL ingresada es válida.| `true` |
| **type** | Tipo de notificacion recebida e acuerdo con el tópico previamente seleccionado (payments, mp-connect, subscription, claim, automatic-payments, etc) | `payment` |
| **date_created** | Fecha de creación del recurso notificado | `2015-03-25T10:04:58.396-04:00` |
| **user_id**| Identificador del vendedor | `44444` |
| **api_version** | Valor que indica la versión de la API que envía la notificación | `v1` |
| **action** | Evento notificado, que indica si es una actualización de un recurso o la creación de uno nuevo | `payment.created` |
| **data.id**  | ID del pago, de la orden comercial o del reclamo. | `999999999` |

## Acciones necesarias después de recibir la notificación

Cuando recibes una notificación en tu plataforma, Mercado Pago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un `HTTP STATUS 200 (OK)` o `201 (CREATED)`. 

El **tiempo de espera** para esa confirmación será de **22 segundos**. Si no se envía esta respuesta, el sistema entenderá que la notificación no fue recibida y realizará un **nuevo intento de envío cada 15 minutos**, hasta que reciba la respuesta. Después del tercer intento, el plazo será prorrogado, pero los envíos continuarán sucediendo.

Luego de responder la notificación, confirmando su recibimiento, puedes obtener toda la información sobre el recurso notificado haciendo una requisición al endpoint correspondiente. Para identificar qué endpoint debes utilizar, consulta la tabla debajo:

Con esta información podrás realizar las actualizaciones necesarias a tu plataforma, como actualizar un pago aprobado.

## Panel de notificaciones

El panel de notificaciones es una herramienta que permite visualizar los eventos disparados sobre una determinada integración, verificar el estado de las notificaciones, y obtener información detallada sobre esos eventos. 

Este Panel será exhibido una vez que hayas configurado tus notificaciones Webhooks, y puedes acceder a él cuando desees, haciendo clic en **Webhooks** dentro de Tus integraciones.

Entre la información disponible en este panel, encontrarás el porcentaje de notificaciones entregadas, así como una visión rápida de cuáles son las URLs y eventos configurados. 

Además, encontrarás una lista completa de las últimas notificaciones enviadas y sus detalles, como **estado de la entrega** (exitoso o fallido), **acción** (acción asociada al evento disparado), **evento** (tipo de evento disparado), y **fecha y hora**.  Si lo deseas, es posible filtrar estos resultados exhibidos por **estado de la entrega** y por **período**.

![panel de notificaciones webhooks](/images/dashboard/notification-dashboard-es.png)

### Detalles del evento

Al hacer clic en una de las notificaciones listadas, podrás acceder a los detalles del evento. Esta sección proporciona mayor información y permite recuperar datos perdidos en caso de fallas en la entrega de la notificación para mantener tu sistema actualizado.
 * **Status:** Estado del evento junto con el código de éxito o error correspondiente.
 * **Evento:** Tipo de evento disparado, en función de los tópicos seleccionados durante la configuración de las notificaciones.
 * **Tipo:** Tópico al que pertenece el evento disparado, en función de la selección hecha durante la configuración.
 * **Fecha y hora del disparo:** Fecha y hora en la que fue disparado el evento.
 * **Descripción:** Descripción detallada del evento.
 * **ID del disparo:** Identificador único de la notificación enviada.
 * **Requisición:** JSON del llamado enviado como notificación. 

![detalles de notificaciones enviadas](/images/dashboard/notification-details-dashboard-es.png)

En caso de una falla en la entrega de la notificación, podrás conocer cuáles fueron los motivos y rectificar la información necesaria para evitar futuros problemas.
