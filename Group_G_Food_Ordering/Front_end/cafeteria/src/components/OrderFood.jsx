import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { money } from "../lib";
import { Basket } from "./Basket";
import { CatalogueSkeleton, Loader } from "./Loader";
import { Search } from "./Search";

export function LoadState({ loading, error, onRetry, skeleton, label, children }) {
  if (loading) return skeleton ?? <Loader label={label} />;
  if (error)
    return (
      <p className="load-state error-state">
        {error} {onRetry && <button onClick={onRetry}>Try again</button>}
      </p>
    );
  return children;
}

// Keeps the UI cart in step with the backend cart. Clicks update the UI
// immediately; a serial queue then reconciles each item with the server.
function useServerCart(studentId, menuItems) {
  const [cart, setCart] = useState([]); // [{ ...menuItem, quantity }]
  const [cartId, setCartId] = useState(null);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [serverTotal, setServerTotal] = useState(null);
  const lines = useRef(new Map()); // menuItemId -> server cart line
  const desired = useRef(new Map()); // menuItemId -> wanted quantity
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const cartIdRef = useRef(null);

  const toCart = (quantities) =>
    [...quantities].flatMap(([menuItemId, quantity]) => {
      const item = menuItems.find((i) => i.id === menuItemId);
      return item && quantity > 0 ? [{ ...item, quantity }] : [];
    });

  async function refreshTotal() {
    if (![...desired.current.values()].some((q) => q > 0)) return setServerTotal(0);
    try {
      setServerTotal(await api.getCartTotal(cartIdRef.current));
    } catch {
      setServerTotal(null); // Basket falls back to adding up the lines itself.
    }
  }

  async function load() {
    setError("");
    try {
      const serverCart = await api.getCart(studentId);
      cartIdRef.current = serverCart.cartId;
      setCartId(serverCart.cartId);
      lines.current = new Map(serverCart.items.map((l) => [l.menuItemId, l]));
      desired.current = new Map(serverCart.items.map((l) => [l.menuItemId, l.quantity]));
      setCart(toCart(desired.current));
      refreshTotal();
    } catch (err) {
      setError(`Couldn't load your cart: ${err.message}`);
    }
  }

  useEffect(() => {
    if (menuItems.length) load();
  }, [studentId, menuItems]);

  async function syncItem(menuItemId) {
    const want = desired.current.get(menuItemId) ?? 0;
    const line = lines.current.get(menuItemId);
    if (want === (line?.quantity ?? 0)) return;
    if (!line) {
      lines.current.set(menuItemId, await api.addCartItem(cartIdRef.current, menuItemId, want));
    } else if (want === 0) {
      await api.removeCartItem(line.lineId);
      lines.current.delete(menuItemId);
    } else {
      lines.current.set(menuItemId, await api.updateCartItem(line, want));
    }
  }

  function enqueue(menuItemId) {
    pending.current += 1;
    setSyncing(true);
    const settled = queue.current
      .then(() => syncItem(menuItemId))
      .catch((err) => {
        // Roll the UI back to what the server actually has.
        setError(`Couldn't update your cart: ${err.message}`);
        desired.current = new Map([...lines.current].map(([id, l]) => [id, l.quantity]));
        setCart(toCart(desired.current));
      })
      .finally(() => {
        pending.current -= 1;
        if (pending.current === 0) {
          setSyncing(false);
          refreshTotal();
        }
      });
    queue.current = settled;
    return settled;
  }

  function setQuantity(item, quantity) {
    setError("");
    desired.current.set(item.id, Math.max(0, quantity));
    setCart(toCart(desired.current));
    return enqueue(item.id);
  }

  const quantityOf = (item) => desired.current.get(item.id) ?? 0;

  // The backend builds the order from the saved cart and may or may not empty it:
  // re-read it, then remove anything still there.
  async function afterOrder() {
    await load();
    const left = [...desired.current].filter(([, quantity]) => quantity > 0);
    await Promise.all(
      left.map(([id]) => {
        const item = menuItems.find((i) => i.id === id);
        return item && setQuantity(item, 0);
      }),
    );
  }

  return {
    cart,
    cartId,
    error,
    syncing,
    serverTotal,
    ready: cartId !== null,
    reload: load,
    change: (item, delta) => setQuantity(item, quantityOf(item) + delta),
    clear: () => Promise.all(cart.map((item) => setQuantity(item, 0))),
    afterOrder,
    flushed: () => queue.current,
  };
}

export function OrderFood({ student, onOrderPlaced, onPermissionHint }) {
  const [shops, setShops] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [shopId, setShopId] = useState(null);
  const [category, setCategory] = useState("All");
  const [highlightId, setHighlightId] = useState(null);
  const cart = useServerCart(student.id, menuItems);

  async function loadCatalogue() {
    setStatus({ loading: true, error: "" });
    try {
      const [shopList, items] = await Promise.all([api.getShops(), api.getMenuItems()]);
      setShops(shopList);
      setMenuItems(items);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  useEffect(() => {
    loadCatalogue();
  }, []);

  // Open the shop the saved cart belongs to, else the first open shop.
  useEffect(() => {
    if (shopId != null || !shops.length || (!cart.ready && !cart.error)) return;
    setShopId(cart.cart[0]?.shopId ?? shops.find((s) => s.isOpen)?.id ?? shops[0].id);
  }, [shops, cart.ready, cart.error]);

  const shop = shops.find((s) => s.id === shopId);
  const menu = menuItems.filter((i) => i.shopId === shopId);
  const categories = useMemo(() => [...new Set(menu.map((i) => i.category).filter(Boolean))], [menu]);
  const visibleItems = menu.filter((i) => category === "All" || i.category === category);
  const otherShopItems = cart.cart.filter((i) => i.shopId !== shopId);

  function chooseShop(id) {
    setShopId(id);
    setCategory("All");
  }

  // Search can return shops/items the page hasn't loaded yet (added since).
  function pickShop(found) {
    setShops((list) => (list.some((s) => s.id === found.id) ? list : [...list, found]));
    chooseShop(found.id);
  }

  function pickItem(found) {
    setMenuItems((list) => (list.some((i) => i.id === found.id) ? list : [...list, found]));
    chooseShop(found.shopId);
    setHighlightId(found.id);
  }

  useEffect(() => {
    if (highlightId == null) return undefined;
    document.querySelector(`[data-item-id="${highlightId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const id = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(id);
  }, [highlightId, shopId]);

  async function placeOrder(paymentMethod) {
    await cart.flushed();
    const order = await api.placeOrder({
      studentId: student.id,
      cartId: cart.cartId,
      shopId,
      shopName: shop.name,
      cart: cart.cart,
      paymentMethod,
    });
    if (order.paymentUrl) {
      window.location.assign(order.paymentUrl);
      return;
    }
    cart.afterOrder().catch(() => {});
    onPermissionHint?.();
    onOrderPlaced(order);
  }

  return (
    <div style={{ "--accent": shop?.accent ?? "#174d38" }}>
      <section className="welcome">
        <p className="kicker">ORDER FROM CAMPUS</p>
        <h1>What are you in the mood for?</h1>
        <p>Choose a shop, build your order, and collect it when it is ready.</p>
      </section>

      <LoadState {...status} onRetry={loadCatalogue} skeleton={<CatalogueSkeleton />}>
        <Search shops={shops} menuItems={menuItems} onPickShop={pickShop} onPickItem={pickItem} />
        {shops.length === 0 && <p className="load-state">No shops yet.</p>}
        <section className="restaurant-tabs" aria-label="Shops">
          {shops.map((s) => (
            <button
              key={s.id}
              onClick={() => chooseShop(s.id)}
              disabled={!s.isOpen}
              style={{ "--accent": s.accent }}
              className={s.id === shopId ? "restaurant active-restaurant" : "restaurant"}
            >
              <span className="restaurant-icon">{s.name[0]}</span>
              <span>
                <strong>{s.name}</strong>
                <small>{s.isOpen ? s.description || "Open now" : "Closed right now"}</small>
              </span>
            </button>
          ))}
        </section>

        {shop && (
          <>
            <section className="restaurant-heading">
              <div>
                <p className="kicker">NOW ORDERING</p>
                <h2>{shop.name}</h2>
                {shop.description && <p>{shop.description}</p>}
              </div>
              <div className="collection">
                Collection in <strong>{shop.prepTime}</strong>
              </div>
            </section>

            <div className="order-layout">
              <section>
                {categories.length > 1 && (
                  <div className="filters">
                    {["All", ...categories].map((c) => (
                      <button key={c} className={c === category ? "selected" : ""} onClick={() => setCategory(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                {visibleItems.length === 0 && <p className="load-state">Nothing on the menu here yet.</p>}
                <div className="menu-grid">
                  {visibleItems.map((item) => {
                    const inCart = cart.cart.find((entry) => entry.id === item.id);
                    return (
                      <article
                        key={item.id}
                        data-item-id={item.id}
                        className={`menu-card${item.available ? "" : " sold-out"}${item.id === highlightId ? " highlight" : ""}`}
                      >
                        <div className="card-visual">
                          {item.image && (
                            <img src={item.image} alt={item.name} onError={(e) => (e.currentTarget.style.display = "none")} />
                          )}
                          <span>{item.available ? item.category ?? shop.name : "Sold out"}</span>
                          <b>{shop.name[0]}</b>
                        </div>
                        <div className="card-content">
                          <h3>{item.name}</h3>
                          <p>{item.description}</p>
                          <div className="card-bottom">
                            <strong>{money(item.price)}</strong>
                            {inCart ? (
                              <div className="quantity">
                                <button aria-label={`Remove ${item.name}`} onClick={() => cart.change(item, -1)}>
                                  −
                                </button>
                                <span>{inCart.quantity}</span>
                                <button aria-label={`Add ${item.name}`} onClick={() => cart.change(item, 1)}>
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                className="add-button"
                                disabled={!item.available || !cart.ready || otherShopItems.length > 0}
                                title={otherShopItems.length ? "Your cart has items from another shop" : undefined}
                                onClick={() => cart.change(item, 1)}
                              >
                                Add +
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <Basket
                shop={shop}
                cart={cart}
                otherShop={otherShopItems.length ? shops.find((s) => s.id === otherShopItems[0].shopId) : null}
                onGoToShop={chooseShop}
                onPlaceOrder={placeOrder}
              />
            </div>
          </>
        )}
      </LoadState>
    </div>
  );
}
