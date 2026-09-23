# UNIVEN Eats

Campus food-ordering UI for University of Venda students: browse shops, search shops and food by name, build a cart, pay now or at the counter, track the order, cancel it before it's being prepared, get notified when it's ready, and ask the food assistant.

It talks to the Spring Boot `food_order_system` backend. Features whose controllers aren't built yet run on in-browser sample data, so the whole flow works today.

## 1. Install Node.js

The app needs **Node.js 20 or newer** (it includes `npm`).

1. Download the **LTS** version from [nodejs.org](https://nodejs.org/) and run the installer (Windows `.msi`, macOS `.pkg`), or use a package manager: `brew install node` on macOS, `winget install OpenJS.NodeJS.LTS` on Windows.
2. Open a new terminal and check it worked:

   ```sh
   node -v   # v20.x or newer
   npm -v
   ```

## 2. Run locally

From this project folder:

```sh
npm install                  # first time only
cp .env.example .env.local   # then edit it (see below)
npm run dev                  # opens on http://127.0.0.1:5173
```

On Windows PowerShell, use `npm.cmd` instead of `npm` and `copy` instead of `cp`.

Sign in with a student-number email such as `12345678@mvula.univen.ac.za` and any password of 6+ characters. Login is sample data until `/api/auth/login` exists.

Restart `npm run dev` after changing `.env.local`.

## 3. Connect the backend

`.env.local` decides which features hit the real API:

| Variable | Purpose |
| --- | --- |
| `VITE_LIVE` | Features served by the backend, comma-separated: `auth, shops, menu, cart, orders, notifications, assistant`, or `all`. The rest use sample data. |
| `API_PROXY_TARGET` | Where the dev server forwards `/api/*`: `http://localhost:8080` or an ngrok URL. |
| `VITE_DEV_STUDENT_ID` | Backend student id to act as while auth is sample data. |
| `VITE_DEMO_STATUS_SECONDS` | Demo only: after an order is placed, the app moves it to Preparing, then Ready for collection, every N seconds (standing in for the shop). `0` turns it off. |

What's wired to the backend today:

| Feature | Backend |
| --- | --- |
| Shops, search by name | `GET /api/shops`, `GET /api/shops/{shopName}` |
| Menu, search by name | `GET /api/menu-items`, `GET /api/menu-items/{name}` |
| Cart | `/api/carts/{studentId}`, `/api/cart-items` |
| Orders | `POST /api/orders/{studentId}`, `GET /api/orders/{studentId}/history`, `PUT /api/orders/{id}/status` |
| Login, notifications, assistant, payment | Sample data / offline (payment is mock-only by design) |

When a new controller lands, add or update its file in `src/api/services/`, align field names in `src/api/mappers.js`, and add the feature to `VITE_LIVE`.

## Project layout

```
src/
  app.jsx                  App shell: header, navigation, views
  api/
    services/              One file per backend controller (shop, menu, cart, student, order, …)
    mappers.js             Backend DTO → UI model (the only place that knows DTO field names)
    mockApi.js, mockData.js  Sample-data stand-in with the same functions as the services
    assistantBrain.js      Offline food assistant (budgets, prices, suggestions, order status)
    orderExtras.js         Shop/items/payment remembered per order until OrderDto includes them
    http.js                fetch wrapper (auth header, errors, retries)
    config.js, session.js
  components/              Login, OrderFood (shops + menu), Search, Basket, Orders, Notifications, Assistant, Loader
  app.css                  All styles
```

## Build for production

```sh
npm run build   # output in dist/
```
