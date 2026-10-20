import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/hooks/cart";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { MAX_QTY } from "@/lib/cart-math";

const slug = "granola-sin-tacc-500g";

function Inspector() {
  const { open, units, setOpen, setQty, clear } = useCart();
  return (
    <>
      <p data-testid="cart-open">{String(open)}</p>
      <p data-testid="cart-units">{units}</p>
      <button type="button" onClick={() => setOpen(true)}>Abrir carrito</button>
      <button type="button" onClick={() => setQty(slug, 0)}>Eliminar desde carrito</button>
      <button type="button" onClick={() => setQty(slug, MAX_QTY)}>Poner máximo desde carrito</button>
      <button type="button" onClick={clear}>Vaciar carrito</button>
    </>
  );
}

describe("contador discreto y sincronizado por producto", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("reemplaza el + por − cantidad + sin abrir el carrito y conserva la confirmación temporal", () => {
    render(
      <CartProvider>
        <AddToCartButton slug={slug} name="Granola" />
        <Inspector />
      </CartProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agregar Granola al carrito" }));
    const counter = screen.getByRole("group", { name: "Cantidad de Granola en el carrito" });
    expect(within(counter).getByText("1")).toBeTruthy();
    expect(screen.getByTestId("cart-open").textContent).toBe("false");
    expect(screen.getByText("Agregado al carrito").className).toContain("opacity-100");

    fireEvent.click(within(counter).getByRole("button", { name: "Agregar una unidad de Granola" }));
    fireEvent.click(within(counter).getByRole("button", { name: "Agregar una unidad de Granola" }));
    expect(within(counter).getByText("3")).toBeTruthy();
    expect(screen.getByTestId("cart-units").textContent).toBe("3");
    expect(screen.getByTestId("cart-open").textContent).toBe("false");

    act(() => vi.advanceTimersByTime(1600));
    expect(screen.getByRole("group", { name: "Cantidad de Granola en el carrito" })).toBeTruthy();
    expect(screen.getByText("Agregado al carrito").className).toContain("opacity-0");
    fireEvent.click(within(counter).getByRole("button", { name: "Restar una unidad de Granola" }));
    expect(within(counter).getByText("2")).toBeTruthy();
  });

  it("eliminar la última unidad restaura el + inicial", () => {
    render(
      <CartProvider>
        <AddToCartButton slug={slug} name="Granola" />
        <Inspector />
      </CartProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agregar Granola al carrito" }));
    fireEvent.click(screen.getByRole("button", { name: "Restar una unidad de Granola" }));
    expect(screen.getByTestId("cart-units").textContent).toBe("0");
    expect(screen.getByRole("button", { name: "Agregar Granola al carrito" })).toBeTruthy();
  });

  it("todos los botones del mismo producto se sincronizan y reaccionan a cambios desde el carrito", () => {
    render(
      <CartProvider>
        <AddToCartButton slug={slug} name="Granola" />
        <AddToCartButton slug={slug} name="Granola" />
        <Inspector />
      </CartProvider>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Agregar Granola al carrito" })[0]!);
    expect(screen.getAllByRole("group", { name: "Cantidad de Granola en el carrito" })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Agregar una unidad de Granola" })[1]!);
    expect(screen.getAllByRole("group", { name: "Cantidad de Granola en el carrito" }).map((x) => x.textContent)).toEqual(["2", "2"]);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar desde carrito" }));
    expect(screen.getAllByRole("button", { name: "Agregar Granola al carrito" })).toHaveLength(2);
  });

  it("respeta el máximo y habilita quitar una unidad", () => {
    render(
      <CartProvider>
        <AddToCartButton slug={slug} name="Granola" />
        <Inspector />
      </CartProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agregar Granola al carrito" }));
    fireEvent.click(screen.getByRole("button", { name: "Poner máximo desde carrito" }));
    const increase = screen.getByRole("button", { name: "Agregar una unidad de Granola" });
    expect(increase.hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Restar una unidad de Granola" }));
    expect(increase.hasAttribute("disabled")).toBe(false);
    expect(screen.getByTestId("cart-units").textContent).toBe(String(MAX_QTY - 1));
  });

  it("muestra contador también en la ficha después de agregar cantidad inicial", () => {
    render(
      <CartProvider>
        <AddToCartButton slug={slug} name="Granola" quantity={3} variant="full" />
        <Inspector />
      </CartProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    const counter = screen.getByRole("group", { name: "Cantidad de Granola en el carrito" });
    expect(within(counter).getByText("3")).toBeTruthy();
    fireEvent.click(within(counter).getByRole("button", { name: "Agregar una unidad de Granola" }));
    expect(screen.getByTestId("cart-units").textContent).toBe("4");
    expect(screen.getByTestId("cart-open").textContent).toBe("false");
  });
});
