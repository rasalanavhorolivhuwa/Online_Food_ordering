import React, { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import { formatTime, useOrderUpdates, usePolling } from "../lib";

function showBrowserNotification(n) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(n.title, { body: n.message });
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

export function useNotifications() {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);
  const seen = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const list = await api.getNotifications();
      // Only announce notifications that arrive after the first load.
      if (seen.current) {
        const fresh = list.filter((n) => !n.read && !seen.current.has(n.id));
        fresh.forEach(showBrowserNotification);
        if (fresh.length) setToast(fresh[0]);
      }
      seen.current = new Set(list.map((n) => n.id));
      setItems(list);
    } catch {
      // Keep the last list; try again on the next poll.
    }
  }, []);

  usePolling(refresh, 5000);
  useOrderUpdates(refresh);

  const markRead = useCallback(async (id) => {
    setItems((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.markNotificationRead(id);
    } catch {
      // Not critical.
    }
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return {
    items,
    unread: items.filter((n) => !n.read).length,
    markRead,
    refresh,
    toast,
    dismissToast,
  };
}

export function NotificationBell({ notifications, onOpenOrder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="bell-wrap" ref={ref}>
      <button className="icon-button" aria-label={`Notifications (${notifications.unread} unread)`} onClick={() => setOpen((o) => !o)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {notifications.unread > 0 && <span className="badge">{notifications.unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <p className="kicker">NOTIFICATIONS</p>
          {notifications.items.length === 0 ? (
            <p className="notif-empty">No notifications yet. We'll let you know when your order moves.</p>
          ) : (
            <ul>
              {notifications.items.map((n) => (
                <li key={n.id}>
                  <button
                    className={n.read ? "" : "unread"}
                    onClick={() => {
                      notifications.markRead(n.id);
                      if (n.orderId) onOpenOrder(n.orderId);
                      setOpen(false);
                    }}
                  >
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                    <small>{formatTime(n.createdAt)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function Toast({ notification, onClose, onOpen }) {
  useEffect(() => {
    if (!notification) return undefined;
    const id = setTimeout(onClose, 6000);
    return () => clearTimeout(id);
  }, [notification, onClose]);

  if (!notification) return null;
  return (
    <div className="toast" role="status">
      <button className="toast-body" onClick={onOpen}>
        <strong>{notification.title}</strong>
        <span>{notification.message}</span>
      </button>
      <button className="toast-close" aria-label="Dismiss" onClick={onClose}>×</button>
    </div>
  );
}
