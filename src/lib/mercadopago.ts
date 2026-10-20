import { getProduct } from "@/data/catalog";
import { MAX_QTY } from "@/lib/cart-math";

type Query = {
  bind(...params: (string | number | null)[]): {
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
  };
};
export interface PaymentEnv {
  ORDERS_DB?: { prepare(sql: string): Query };
  MP_ACCESS_TOKEN?: string;
  MP_WEBHOOK_SECRET?: string;
  MP_ENABLED?: string;
  MP_MODE?: "test" | "production";
  MP_LIVE_CONFIRMED?: string;
  MP_SHIPPING_READY?: string;
}

interface OrderRow {
  id: string;
  status: string;
  amount_cents: number;
  preference_id: string | null;
}
type CartItem = { slug: string; qty: number };

const API_ROOT = "https://api.mercadopago.com";
const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };

function respond(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

/** Nunca activamos cobros sin D1, token, firma webhook y habilitación deliberada. */
export function paymentConfigured(env: PaymentEnv): boolean {
  return !!(
    env.ORDERS_DB && env.MP_ACCESS_TOKEN && env.MP_WEBHOOK_SECRET &&
    env.MP_ENABLED === "true" &&
    (env.MP_MODE === "test" || (env.MP_MODE === "production" && env.MP_LIVE_CONFIRMED === "true" && env.MP_SHIPPING_READY === "true"))
  );
}

/** Cotización exclusiva del servidor; ignora absolutamente cualquier precio del cliente. */
export function checkoutItems(value: unknown): {
  items: { id: string; title: string; quantity: number; currency_id: "ARS"; unit_price: number }[];
  amountCents: number;
} | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = (value as { items?: unknown }).items;
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 30) return null;
  const seen = new Set<string>();
  const items: { id: string; title: string; quantity: number; currency_id: "ARS"; unit_price: number }[] = [];
  let totalCents = 0;

  for (const line of raw) {
    if (!line || typeof line !== "object" || Array.isArray(line)) return null;
    const { slug, qty } = line as Partial<CartItem>;
    if (typeof slug !== "string" || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY || seen.has(slug)) return null;
    const product = getProduct(slug);
    const price = product?.currentPrice;
    if (!product || product.availability !== "disponible" || typeof price !== "number" || !Number.isSafeInteger(price) || price <= 0) return null;
    seen.add(slug);
    totalCents += price * qty * 100;
    if (!Number.isSafeInteger(totalCents) || totalCents > 100_000_000_00) return null;
    items.push({ id: slug, title: product.name.slice(0, 250), quantity: qty, currency_id: "ARS", unit_price: price });
  }
  return { items, amountCents: totalCents };
}

function validMercadoPagoLink(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      (url.hostname === "mercadopago.com" || url.hostname.endsWith(".mercadopago.com") ||
       url.hostname === "mercadopago.com.ar" || url.hostname.endsWith(".mercadopago.com.ar"));
  } catch {
    return false;
  }
}

export async function checkMpWebhookSignature(
  secret: string, signature: string | null, requestId: string | null, paymentId: string,
  now = Date.now(),
): Promise<boolean> {
  if (!signature || !requestId || !/^[0-9]{1,24}$/.test(paymentId) || requestId.length > 160) return false;
  const parts = Object.fromEntries(signature.split(",").map((p) => p.trim().split("=", 2)));
  const ts = parts["ts"];
  const hash = parts["v1"];
  if (!ts || !/^\d{10,13}$/.test(ts) || !hash || !/^[a-f0-9]{64}$/i.test(hash)) return false;
  const timestamp = Number(ts) * (ts.length === 10 ? 1000 : 1);
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > 15 * 60_000) return false;
  const manifest = "id:" + paymentId.toLowerCase() + ";request-id:" + requestId + ";ts:" + ts + ";";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const hexBytes = new Uint8Array((hash.match(/.{2}/g) ?? []).map((part) => Number.parseInt(part, 16)));
  return crypto.subtle.verify("HMAC", key, hexBytes, new TextEncoder().encode(manifest));
}

async function startCheckout(request: Request, env: PaymentEnv): Promise<Response> {
  // Origin protege contra CSRF al iniciar transacciones, además del Same-Origin del navegador.
  const origin = new URL(request.url).origin;
  if (new URL(request.url).protocol !== "https:" || request.headers.get("origin") !== origin) {
    return respond(403, { error: "Origen no autorizado." });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return respond(415, { error: "Formato inválido." });
  }
  const body = await request.text();
  if (body.length > 5500) return respond(413, { error: "Carrito demasiado grande." });
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return respond(400, { error: "JSON inválido." }); }
  const checkout = checkoutItems(payload);
  if (!checkout) return respond(409, { error: "Hay artículos sin precio vigente o disponibilidad confirmada. Actualizá el carrito." });

  const db = env.ORDERS_DB!;
  const id = crypto.randomUUID();
  const now = Date.now();
  const snapshot = JSON.stringify(checkout.items);
  await db.prepare(
    "INSERT INTO orders (id, status, currency, amount_cents, items_json, created_at, updated_at) VALUES (?, 'created', 'ARS', ?, ?, ?, ?)",
  ).bind(id, checkout.amountCents, snapshot, now, now).run();

  const callback = origin + "/pago?pedido=" + encodeURIComponent(id);
  const preference = {
    items: checkout.items,
    external_reference: id,
    back_urls: { success: callback, pending: callback, failure: callback },
    auto_return: "approved",
    notification_url: origin + "/api/mercadopago/webhook",
    statement_descriptor: "MINIGAINS",
  };
  let response: Response;
  try {
    response = await fetch(API_ROOT + "/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.MP_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return respond(502, { error: "Mercado Pago no está disponible en este momento." });
  }
  if (!response.ok) return respond(502, { error: "No se pudo iniciar el pago. No se realizó ningún cobro." });
  const data = await response.json() as { id?: unknown; init_point?: unknown; sandbox_init_point?: unknown };
  const link = env.MP_MODE === "test" ? data.sandbox_init_point : data.init_point;
  if (!validMercadoPagoLink(link) || typeof data.id !== "string" || data.id.length > 200) {
    return respond(502, { error: "Mercado Pago devolvió una respuesta inesperada." });
  }
  await db.prepare("UPDATE orders SET status='awaiting_payment', preference_id=?, updated_at=? WHERE id=?")
    .bind(data.id, Date.now(), id).run();
  return respond(200, { url: link, orderId: id });
}

async function receivePayment(request: Request, env: PaymentEnv): Promise<Response> {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";
  if (type !== "payment") return respond(200, { received: true });
  if (!(await checkMpWebhookSignature(env.MP_WEBHOOK_SECRET!, request.headers.get("x-signature"), request.headers.get("x-request-id"), id))) {
    return respond(401, { error: "Firma no válida." });
  }
  let response: Response;
  try {
    response = await fetch(API_ROOT + "/v1/payments/" + id, {
      headers: { "Authorization": "Bearer " + env.MP_ACCESS_TOKEN },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return respond(503, { error: "Temporalmente no se pudo consultar el estado." });
  }
  if (!response.ok) return respond(503, { error: "Mercado Pago no confirmó el estado." });
  const payment = await response.json() as {
    id?: unknown; status?: unknown; external_reference?: unknown;
    currency_id?: unknown; transaction_amount?: unknown;
  };
  if (String(payment.id) !== id || typeof payment.external_reference !== "string" ||
      !uuidPattern.test(payment.external_reference)) {
    return respond(422, { error: "Notificación inconsistente." });
  }
  const order = await env.ORDERS_DB!.prepare("SELECT id, status, amount_cents, preference_id FROM orders WHERE id=?")
    .bind(payment.external_reference).first<OrderRow>();
  if (!order) return respond(200, { received: true }); // puede ser de otra aplicación de Mercado Pago
  if (payment.currency_id !== "ARS" || !Number.isFinite(payment.transaction_amount) ||
      Math.round((payment.transaction_amount as number) * 100) !== order.amount_cents) {
    return respond(422, { error: "El importe del pago no coincide con la orden." });
  }

  const allowed = ["approved", "pending", "in_process", "rejected", "cancelled", "refunded", "charged_back"];
  const state = typeof payment.status === "string" && allowed.includes(payment.status)
    ? payment.status === "in_process" ? "pending" : payment.status
    : "pending";
  // Nunca degradar un pago aprobado por otro intento rechazado. Los reembolsos y contracargos sí se registran.
  await env.ORDERS_DB!.prepare(
    "UPDATE orders SET status=?, payment_id=?, updated_at=? WHERE id=? AND status NOT IN ('refunded','charged_back') AND (status!='approved' OR ? IN ('refunded','charged_back'))",
  ).bind(state, id, Date.now(), order.id, state).run();
  return respond(200, { received: true });
}

async function paymentStatus(request: Request, env: PaymentEnv): Promise<Response> {
  const orderId = new URL(request.url).searchParams.get("pedido") ?? "";
  if (!uuidPattern.test(orderId)) return respond(400, { error: "Pedido inválido." });
  const row = await env.ORDERS_DB!.prepare("SELECT id, status, amount_cents FROM orders WHERE id=?")
    .bind(orderId).first<{ id: string; status: string; amount_cents: number }>();
  if (!row) return respond(404, { error: "Pedido no encontrado." });
  // Nunca exponemos datos de compradores ni datos de Mercado Pago en esta consulta.
  return respond(200, { orderId: row.id, status: row.status, amount: row.amount_cents / 100, currency: "ARS" });
}

/** Rutas privadas del Worker, fuera de React; retornos del navegador no marcan pagos aprobados. */
export async function handleMercadoPago(request: Request, envValue: unknown): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/api/mercadopago/")) return null;
  const env = (envValue ?? {}) as PaymentEnv;
  if (request.method === "GET" && path === "/api/mercadopago/config") {
    return respond(200, { enabled: paymentConfigured(env), provider: "mercadopago" });
  }
  if (!paymentConfigured(env)) return respond(503, { error: "Pagos en preparación. Podés consultar por WhatsApp." });
  try {
    if (request.method === "POST" && path === "/api/mercadopago/checkout") return await startCheckout(request, env);
    if (request.method === "POST" && path === "/api/mercadopago/webhook") return await receivePayment(request, env);
    if (request.method === "GET" && path === "/api/mercadopago/status") return await paymentStatus(request, env);
    return respond(404, { error: "Ruta no encontrada." });
  } catch {
    return respond(503, { error: "Servicio temporalmente no disponible." });
  }
}
