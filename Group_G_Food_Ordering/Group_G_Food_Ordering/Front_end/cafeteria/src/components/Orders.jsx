import React, { useState } from "react";
import { api, ORDER_STEPS, PAYMENT_METHODS, STATUS_LABELS, statusLabel } from "../api";
import { formatTime, money, useOrderUpdates, usePolling } from "../lib";
import { Spinner } from "./Loader";
import { LoadState } from "./OrderFood";

const isFinished = (status) => status === "COLLECTED" || status === "CANCELLED";

function StatusPill({ status }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}>{statusLabel(status)}</span>;
}

// Students may cancel only before the shop starts preparing.
function CancelOrder({ order, onCancelled }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setBusy(true);
    setError("");
    try {
      onCancelled(await api.cancelOrder(order.id));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (!confirming)
    return (
      <button className="cancel-order" onClick={() => setConfirming(true)}>
        Cancel order
      </button>
    );
  return (
    <div className="cancel-confirm" role="alertdialog" aria-label="Cancel this order?">
      <p>
        Cancel <strong>{order.orderNumber}</strong>? The shop won't prepare it.
      </p>
      {error && <p className="cancel-error" role="alert">{error}</p>}
      <div>
        <button className="danger" onClick={cancel} disabled={busy}>
          {busy ? <><Spinner /> Cancelling…</> : "Yes, cancel it"}
        </button>
        <button className="ghost" onClick={() => setConfirming(false)} disabled={busy}>
          Keep my order
        </button>
      </div>
    </div>
  );
}

export function OrderTracker({ orderId, justPlaced, onBack }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setOrder(await api.getOrder(orderId));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }
  usePolling(refresh, 5000, !order || !isFinished(order.status));
  useOrderUpdates(refresh);

  if (!order) return <LoadState loading={!error} error={error} label="Finding your order…" />;

  const currentStep = ORDER_STEPS.indexOf(order.status);
  const payAtCounter = order.paymentMethod === PAYMENT_METHODS.PAY_AT_COUNTER;

  return (
    <section className="tracker">
      <button className="back-link" onClick={onBack}>← My orders</button>
      <div className="tracker-card">
        {justPlaced && <p className="placed-banner">✓ Order placed</p>}
        <p className="kicker">ORDER NUMBER</p>
        <h1 className="order-number">{order.orderNumber}</h1>
        <p className="tracker-sub">
          {[order.shopName, formatTime(order.createdAt)].filter(Boolean).join(" · ")} · Show this number when you collect.
        </p>

        {!ORDER_STEPS.includes(order.status) && order.status !== "CANCELLED" && (
          <p className="live-note">Status: {statusLabel(order.status)}</p>
        )}
        {order.status === "CANCELLED" ? (
          <p className="cancelled-note">This order was cancelled.</p>
        ) : (
          <ol className="steps">
            {ORDER_STEPS.map((step, i) => (
              <li key={step} className={i < currentStep ? "done" : i === currentStep ? "current" : ""}>
                <span className="dot">{i < currentStep ? "✓" : i + 1}</span>
                <span>{STATUS_LABELS[step]}</span>
              </li>
            ))}
          </ol>
        )}
        {!isFinished(order.status) && <p className="live-note"><span className="live-dot" /> Updates automatically</p>}

        <div className="tracker-items">
          {order.items.length === 0 && <p className="payment-line">Item details aren't available for this order.</p>}
          {order.items.map((item, i) => (
            <div key={i}>
              <span>{item.quantity} × {item.name}</span>
              <span>{money(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="tracker-total">
            <strong>Total</strong>
            <strong>{money(order.total)}</strong>
          </div>
        </div>
        {order.status === "PENDING" && <CancelOrder order={order} onCancelled={setOrder} />}

        {order.paymentMethod && (
          <p className="payment-line">
            {payAtCounter ? `Pay ${money(order.total)} at the counter when you collect` : "Paid"}
          </p>
        )}
      </div>
    </section>
  );
}

export function MyOrders({ onTrack, onOrderFood }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  usePolling(async () => {
    try {
      setOrders(await api.getMyOrders());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, 5000);

  return (
    <section className="orders-page">
      <p className="kicker">MY ORDERS</p>
      <h1>Track your orders</h1>
      <LoadState loading={!orders && !error} error={!orders ? error : ""} label="Fetching your orders…">
        {orders?.length === 0 ? (
          <div className="orders-empty">
            <p>You haven't placed any orders yet.</p>
            <button className="place-order" onClick={onOrderFood}>Browse shops</button>
          </div>
        ) : (
          <ul className="orders-list">
            {orders?.map((order) => (
              <li key={order.id}>
                <button onClick={() => onTrack(order.id)}>
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <small>{[order.shopName, formatTime(order.createdAt)].filter(Boolean).join(" · ")}</small>
                  </div>
                  <StatusPill status={order.status} />
                  <b>{money(order.total)}</b>
                </button>
              </li>
            ))}
          </ul>
        )}
      </LoadState>
    </section>
  );
}
