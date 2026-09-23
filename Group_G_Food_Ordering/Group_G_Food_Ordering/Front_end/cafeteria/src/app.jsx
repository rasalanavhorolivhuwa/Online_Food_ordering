import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, MOCKED_FEATURES } from "./api";
import { Assistant } from "./components/Assistant";
import { Login } from "./components/Login";
import {
  NotificationBell,
  requestNotificationPermission,
  Toast,
  useNotifications,
} from "./components/Notifications";
import { OrderFood } from "./components/OrderFood";
import { MyOrders, OrderTracker } from "./components/Orders";
import "./app.css";

function Shell({ student, onLogout }) {
  // view: { name: "menu" } | { name: "orders" } | { name: "track", orderId, justPlaced }
  const [view, setView] = useState({ name: "menu" });
  const notifications = useNotifications();
  const trackOrder = (orderId, justPlaced = false) => setView({ name: "track", orderId, justPlaced });

  return (
    <div className="campus-app">
      <header className="topbar">
        <div className="site-brand" aria-label="University of Venda">
          <span className="univen-logo">UV</span>
          <div>
            <strong>UNIVEN Eats</strong>
            <small>University of Venda</small>
          </div>
        </div>
        <nav className="main-nav">
          <button className={view.name === "menu" ? "active" : ""} onClick={() => setView({ name: "menu" })}>
            Order food
          </button>
          <button className={view.name !== "menu" ? "active" : ""} onClick={() => setView({ name: "orders" })}>
            My orders
          </button>
        </nav>
        <div className="topbar-actions">
          <NotificationBell notifications={notifications} onOpenOrder={(id) => trackOrder(id)} />
          <div className="student-chip">
            <span>{student.name ?? student.studentNumber}</span>
            <button onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {view.name === "menu" && (
          <OrderFood
            student={student}
            onPermissionHint={requestNotificationPermission}
            onOrderPlaced={(order) => {
              notifications.refresh();
              trackOrder(order.id, true);
            }}
          />
        )}
        {view.name === "orders" && (
          <MyOrders onTrack={(id) => trackOrder(id)} onOrderFood={() => setView({ name: "menu" })} />
        )}
        {view.name === "track" && (
          <OrderTracker
            key={view.orderId}
            orderId={view.orderId}
            justPlaced={view.justPlaced}
            onBack={() => setView({ name: "orders" })}
          />
        )}
      </main>

      <Toast
        notification={notifications.toast}
        onClose={notifications.dismissToast}
        onOpen={() => {
          const { id, orderId } = notifications.toast;
          notifications.markRead(id);
          notifications.dismissToast();
          if (orderId) trackOrder(orderId);
        }}
      />
      <Assistant />
    </div>
  );
}

function App() {
  const [student, setStudent] = useState(() => api.currentStudent());

  useEffect(() => {
    const expire = () => setStudent(null);
    window.addEventListener("auth-expired", expire);
    return () => window.removeEventListener("auth-expired", expire);
  }, []);

  if (!student) return <Login onLogin={setStudent} />;
  return (
    <Shell
      student={student}
      onLogout={() => {
        api.logout();
        setStudent(null);
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(<App />);
