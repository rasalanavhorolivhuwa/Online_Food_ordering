import React, { useState } from "react";
import { PAYMENT_METHODS } from "../api";
import { money } from "../lib";
import { Spinner } from "./Loader";

export function Basket({ shop, cart, otherShop, onGoToShop, onPlaceOrder }) {
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.PAY_AT_COUNTER);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const items = cart.cart;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const localTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Prefer the backend's total once it has caught up with the latest change.
  const total = !cart.syncing && cart.serverTotal != null ? cart.serverTotal : localTotal;

  async function placeOrder() {
    setPlacing(true);
    setError("");
    try {
      await onPlaceOrder(paymentMethod);
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  return (
    <aside className="basket">
      <div className="basket-title">
        <div>
          <p className="kicker">YOUR CART</p>
          <h2>{otherShop?.name ?? shop.name}</h2>
        </div>
        <span>
          {cart.syncing ? <><Spinner /> Saving</> : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        </span>
      </div>

      {cart.error && (
        <p className="basket-error" role="alert">
          {cart.error} {!cart.ready && <button onClick={cart.reload}>Retry</button>}
        </p>
      )}

      {items.length === 0 ? (
        <div className="empty-basket">
          <div>+</div>
          <h3>Your cart is empty</h3>
          <p>Add something from the menu to get started.</p>
        </div>
      ) : (
        <>
          <div className="basket-items">
            {items.map((item) => (
              <div className="basket-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{money(item.price)} each</small>
                </div>
                <div className="basket-qty">
                  <button aria-label={`Remove one ${item.name}`} onClick={() => cart.change(item, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button aria-label={`Add one ${item.name}`} onClick={() => cart.change(item, 1)}>+</button>
                </div>
                <b>{money(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="basket-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          {otherShop ? (
            <div className="other-shop">
              <p>Your cart is from {otherShop.name}. Orders go to one shop at a time.</p>
              <button className="place-order" onClick={() => onGoToShop(otherShop.id)}>
                Back to {otherShop.name}
              </button>
              <button className="cancel-payment" onClick={cart.clear}>Empty cart</button>
            </div>
          ) : (
            <>
              <fieldset className="payment-choice">
                <legend>Payment method</legend>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === PAYMENT_METHODS.PAY_NOW}
                    onChange={() => setPaymentMethod(PAYMENT_METHODS.PAY_NOW)}
                  />
                  Pay now
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === PAYMENT_METHODS.PAY_AT_COUNTER}
                    onChange={() => setPaymentMethod(PAYMENT_METHODS.PAY_AT_COUNTER)}
                  />
                  Pay at counter
                </label>
              </fieldset>

              {error && <p className="basket-error" role="alert">{error}</p>}
              <button className="place-order" onClick={placeOrder} disabled={placing}>
                {placing
                  ? <><Spinner /> Placing order…</>
                  : paymentMethod === PAYMENT_METHODS.PAY_NOW
                    ? `Place order and pay ${money(total)}`
                    : "Place order"}
              </button>
              <p className="basket-note">
                {paymentMethod === PAYMENT_METHODS.PAY_NOW
                  ? "You'll pay securely before we start preparing it."
                  : "Pay when you collect your order."}
              </p>
            </>
          )}
        </>
      )}
    </aside>
  );
}
