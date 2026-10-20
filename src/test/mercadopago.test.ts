// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/catalog", () => ({
  getProduct: (slug: string) => slug === "verificado"
    ? { slug, name: "Granola MiniGains", currentPrice: 12500, availability: "disponible" }
    : slug === "historico"
    ? { slug, name: "Budín", referencePrice: 9000, currentPrice: null, availability: "consultar" }
    : undefined,
}));

import { checkMpWebhookSignature, checkoutItems, handleMercadoPago, paymentConfigured } from "@/lib/mercadopago";

describe("Mercado Pago: total calculado en el servidor", () => {
  it("rechaza artículos sin precio actual o stock, cantidades inválidas y slugs duplicados", () => {
    expect(checkoutItems({ items: [{ slug: "historico", qty: 1 }] })).toBeNull();
    expect(checkoutItems({ items: [{ slug: "desconocido", qty: 1 }] })).toBeNull();
    expect(checkoutItems({ items: [{ slug: "verificado", qty: 21 }] })).toBeNull();
    expect(checkoutItems({ items: [{ slug: "verificado", qty: 0 }] })).toBeNull();
    expect(checkoutItems({ items: [{ slug: "verificado", qty: 1.5 }] })).toBeNull();
    expect(checkoutItems({ items: [{ slug: "verificado", qty: 1 }, { slug: "verificado", qty: 1 }] })).toBeNull();
  });
  it("nunca acepta precios arbitrarios del navegador", () => {
    const data = checkoutItems({ items: [{ slug: "verificado", qty: 2, unit_price: 1, amount: 1 }] });
    expect(data?.amountCents).toBe(2_500_000);
    expect(data?.items[0]?.unit_price).toBe(12500);
    expect(data?.items[0]?.quantity).toBe(2);
  });
});

describe("Mercado Pago: cobros deshabilitados por defecto", () => {
  const db = { prepare: () => ({ bind: () => ({ run: async () => ({}), first: async () => null }) }) };
  const env = { ORDERS_DB: db, MP_ACCESS_TOKEN: "test", MP_WEBHOOK_SECRET: "secret", MP_ENABLED: "true", MP_MODE: "production" as const };
  it("requiere credenciales, confirmación del vendedor y política de entrega", async () => {
    expect(paymentConfigured({})).toBe(false);
    expect(paymentConfigured(env)).toBe(false);
    expect(paymentConfigured({ ...env, MP_LIVE_CONFIRMED: "true", MP_SHIPPING_READY: "true" })).toBe(true);
    const config = await handleMercadoPago(new Request("https://minigains.example/api/mercadopago/config"), {});
    expect(await config?.json()).toMatchObject({ enabled: false });
    const post = await handleMercadoPago(new Request("https://minigains.example/api/mercadopago/checkout", { method: "POST" }), {});
    expect(post?.status).toBe(503);
  });
});

describe("Mercado Pago: firma HMAC del webhook", () => {
  it("acepta la firma legítima y rechaza manipulaciones o notificaciones caducadas", async () => {
    const now = Date.now();
    const ts = String(now);
    const requestId = "example-request";
    const paymentId = "1234567";
    const secret = "test-key";
    const message = "id:" + paymentId + ";request-id:" + requestId + ";ts:" + ts + ";";
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const hex = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message))))
      .map((x) => x.toString(16).padStart(2, "0")).join("");
    const signed = "ts=" + ts + ",v1=" + hex;
    expect(await checkMpWebhookSignature(secret, signed, requestId, paymentId, now)).toBe(true);
    expect(await checkMpWebhookSignature(secret, signed, requestId, "9876543", now)).toBe(false);
    expect(await checkMpWebhookSignature(secret, signed.replace(hex, "f".repeat(64)), requestId, paymentId, now)).toBe(false);
    expect(await checkMpWebhookSignature(secret, signed, requestId, paymentId, now + 30 * 60_000)).toBe(false);
  });
});
