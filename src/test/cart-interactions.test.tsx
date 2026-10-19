import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/hooks/cart";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

const slug = "granola-sin-tacc-500g";

function Inspector() {
  const { open, units, setOpen } = useCart();
  return (
    <>
      <p data-testid="cart-open">{String(open)}</p>
      <p data-testid="cart-units">{units}</p>
      <button type="button" onClick={() => setOpen(true)}>Abrir carrito</button>
    </>
  );
}

describe("agregado discreto al carrito", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("suma productos sin abrir automáticamente el panel lateral", () => {
    render(
      <CartProvider>
        <AddToCartButton slug={slug} name="Granola" />
        <Inspector />
      </CartProvider>,
    );
    const add = screen.getByRole("button", { name: "Agregar Granola al carrito" });
    fireEvent.click(add);
    fireEvent.click(add);
    expect(screen.getByTestId("cart-units").textContent).toBe("2");
    expect(screen.getByTestId("cart-open").textContent).toBe("false");
    expect(screen.getByText("Agregado al carrito").className).toContain("opacity-100");

    fireEvent.click(screen.getByRole("button", { name: "Abrir carrito" }));
    expect(screen.getByTestId("cart-open").textContent).toBe("true");
    act(() => vi.advanceTimersByTime(1600));
    expect(screen.getByText("Agregado al carrito").className).toContain("opacity-0");
  });

  it("muestra confirmación en la ficha de producto y mantiene el botón utilizable", () => {
    render(
      <CartProvider>
        <AddToCartButton slug={slug} name="Granola" quantity={3} variant="full" />
        <Inspector />
      </CartProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByRole("button", { name: /Agregado!/ }).getAttribute("disabled")).toBeNull();
    expect(screen.getByTestId("cart-units").textContent).toBe("3");
    expect(screen.getByTestId("cart-open").textContent).toBe("false");
  });
});
