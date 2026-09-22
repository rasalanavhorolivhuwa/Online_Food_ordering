// Offline food assistant: rule-based, but answers from the app's real data
// (shops, menu, cart, orders — live or mock, whatever the app is using).
// Replace with the backend's /api/assistant once it exists.
import { statusLabel } from "./mappers";

const money = (n) => `R${Number(n).toFixed(2)}`;
const title = (s) => String(s).replace(/(^|\s)\w/g, (c) => c.toUpperCase());
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const SYNONYMS = {
  fries: "chips", chip: "chips", cola: "coke", "coca-cola": "coke", cooldrink: "drink", soda: "drink",
  cooldrinks: "drink", drinks: "drink", bunny: "kota", kotas: "kota", burgers: "burger", hake: "fish",
  chiken: "chicken", chicken: "chicken", meat: "beef", sausage: "russian", colddrink: "drink",
};
const DRINK_WORDS = /\b(coke|fanta|sprite|juice|water|drink|soda|cola|\d+\s?(ml|l))\b/i;
const STOP = new Set("i a an the is are do you have any some me my for of to and or with what how much can get want please is there it its".split(" "));

const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
const tokens = (s) =>
  norm(s)
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t))
    .map((t) => SYNONYMS[t] ?? t.replace(/(?<=\w{3})s$/, ""));

// Allow one typo on longer words ("chiken", "calamri").
function similar(a, b) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

const isDrink = (item) => DRINK_WORDS.test(item.name);

function scoreItem(item, words) {
  const nameWords = tokens(item.name);
  const descWords = tokens(`${item.description} ${item.category ?? ""}`);
  let score = 0;
  for (const w of words) {
    if (w === "drink" && isDrink(item)) score += 2;
    else if (nameWords.some((n) => similar(n, w))) score += 3;
    else if (descWords.some((d) => similar(d, w))) score += 1;
  }
  return score;
}

function findItems(menu, text) {
  const words = tokens(text);
  if (!words.length) return [];
  return menu
    .map((item) => ({ item, score: scoreItem(item, words) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .map((x) => x.item);
}

function findShop(shops, text) {
  const t = norm(text);
  return shops.find((s) => {
    const name = norm(s.name).trim();
    const key = name.split(/\s+/).find((w) => w.length >= 4) ?? name;
    return t.includes(name) || t.includes(key.replace(/'s$/, ""));
  });
}

function parseBudget(text) {
  const m = text.match(/\br\s?(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s?(rand|bucks)\b|(?:under|below|less than|budget(?: of| is)?|only have|i have|got)\s*r?\s?(\d+(?:[.,]\d+)?)/i);
  if (!m) return null;
  return Number((m[1] ?? m[2] ?? m[4]).replace(",", "."));
}

// Drop the shop's own words so "fish and chips" the shop isn't read as food.
const withoutShop = (text, shop) =>
  shop ? norm(shop.name).split(/\s+/).filter(Boolean).reduce((t, w) => t.replace(new RegExp(`\\b${escapeRe(w)}\\b`, "gi"), " "), text) : text;

const mealTime = () => {
  const h = new Date().getHours();
  return h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 18 ? "an afternoon snack" : "supper";
};

export function createAssistantBrain({ getShops, getMenuItems, getMyOrders, getCart }) {
  let cache = null;
  const memory = { last: null, shown: new Set(), budget: null, filter: "" };

  async function data() {
    if (!cache || Date.now() - cache.at > 60_000) {
      const [shops, items] = await Promise.all([getShops(), getMenuItems()]);
      cache = { at: Date.now(), shops, items };
    }
    return cache;
  }

  const shopOf = (shops, item) => title(shops.find((s) => s.id === item.shopId)?.name ?? "");
  const line = (shops, item) =>
    `• ${item.name} — ${money(item.price)} at ${shopOf(shops, item)}${item.available ? "" : " (sold out)"}`;

  function budgetAnswer({ shops, items }, budget, people = 1) {
    const perPerson = budget / people;
    const available = items.filter((i) => i.available);
    const meals = available.filter((i) => !isDrink(i));
    const drinks = available.filter(isDrink);
    const combos = [];
    for (const meal of meals) {
      if (meal.price > perPerson) continue;
      const drink = drinks
        .filter((d) => d.shopId === meal.shopId && meal.price + d.price <= perPerson)
        .sort((a, b) => b.price - a.price)[0];
      combos.push({ meal, drink, total: meal.price + (drink?.price ?? 0) });
    }
    const who = people > 1 ? ` each (for ${people} people)` : "";
    if (!combos.length) {
      const cheapest = [...available].sort((a, b) => a.price - b.price)[0];
      return cheapest
        ? `${money(perPerson)}${who} is a bit tight — the cheapest thing on campus right now is the ${cheapest.name} at ${money(cheapest.price)} (${shopOf(shops, cheapest)}).`
        : "Nothing is available to order right now, sorry.";
    }
    combos.sort((a, b) => b.total - a.total);
    const fresh = combos.filter((c) => !memory.shown.has(c.meal.id));
    const top = (fresh.length ? fresh : combos).slice(0, 3);
    top.forEach((c) => memory.shown.add(c.meal.id));
    const rows = top.map(
      (c) =>
        `• ${c.meal.name}${c.drink ? ` + ${c.drink.name}` : ""} — ${money(c.total)} at ${shopOf(shops, c.meal)} (R${(perPerson - c.total).toFixed(2)} left)`,
    );
    return `With ${money(perPerson)}${who}, you could get:\n${rows.join("\n")}`;
  }

  function recommend({ shops, items }, { filter = "", shop = null, maxPrice = Infinity } = {}) {
    let pool = items.filter((i) => i.available && i.price <= maxPrice && (!shop || i.shopId === shop.id));
    if (filter) {
      const matched = findItems(pool, filter);
      if (matched.length) pool = matched;
      else if (tokens(filter).length) return `I couldn't find anything like "${filter.trim()}"${shop ? ` at ${title(shop.name)}` : ""}. Try "recommend something" for any ideas.`;
    }
    const meals = pool.filter((i) => !isDrink(i));
    const fresh = (meals.length ? meals : pool).filter((i) => !memory.shown.has(i.id));
    const choice = pickRandom(fresh.length ? fresh : meals.length ? meals : pool);
    if (!choice) return maxPrice < Infinity ? `Nothing cheaper than ${money(maxPrice)} I'm afraid.` : "Nothing is available right now, sorry.";
    memory.shown.add(choice.id);
    const drink = items.find((d) => d.available && isDrink(d) && d.shopId === choice.shopId);
    const extra = drink && !isDrink(choice) ? ` Add a ${drink.name} (${money(drink.price)}) and it's ${money(choice.price + drink.price)}.` : "";
    return `For ${mealTime()}, try the ${choice.name} from ${shopOf(shops, choice)} — ${choice.description ? choice.description.toLowerCase() : "a solid choice"}, ${money(choice.price)}.${extra}`;
  }

  async function orderAnswer(text) {
    const orders = await getMyOrders();
    if (!orders.length) return "You haven't placed any orders yet. Pick a shop, add something to your cart and hit Place order.";
    const wanted = text.match(/\b(?:ord|uv)-?\s?([a-z0-9]{4,})\b/i);
    const suffix = (n) => String(n).toUpperCase().replace(/^(ORD|UV)-?/, "");
    const order = wanted ? orders.find((o) => suffix(o.orderNumber) === wanted[1].toUpperCase()) : orders[0];
    if (!order) return `I can't find order ${wanted[0].toUpperCase()}. Your latest is ${orders[0].orderNumber}.`;
    const status = statusLabel(order.status);
    const tip = {
      PENDING: "The shop has it and will start soon.",
      PREPARING: "It's on the go — usually ready in 10–15 minutes.",
      READY: `Head over to ${order.shopName ? title(order.shopName) : "the shop"}${order.paymentMethod === "PAY_AT_COUNTER" ? ` and pay ${money(order.total)} at the counter` : ""}. Show your order number.`,
      COLLECTED: "Enjoy your meal!",
      CANCELLED: "If that's unexpected, ask at the counter.",
    }[order.status] ?? "";
    const active = orders.filter((o) => !["COLLECTED", "CANCELLED"].includes(o.status)).length;
    return `${order.orderNumber} (${[order.shopName && title(order.shopName), money(order.total)].filter(Boolean).join(", ")}): ${status}. ${tip}${active > 1 && !wanted ? `\nYou have ${active} active orders — check My orders for all of them.` : ""}`;
  }

  async function cartAnswer({ shops, items }) {
    const cart = await getCart();
    const rows = cart.items
      .map((l) => ({ l, item: items.find((i) => i.id === l.menuItemId) }))
      .filter((x) => x.item);
    if (!rows.length) return "Your cart is empty. Want a suggestion? Just say \"recommend something\".";
    const total = rows.reduce((s, x) => s + x.item.price * x.l.quantity, 0);
    return `In your cart:\n${rows.map((x) => `• ${x.l.quantity} × ${x.item.name} — ${money(x.item.price * x.l.quantity)}`).join("\n")}\nTotal: ${money(total)} at ${shopOf(shops, rows[0].item)}.`;
  }

  async function reply(message) {
    const text = message.trim();
    const t = text.toLowerCase();
    const d = await data();
    const shop = findShop(d.shops, t);
    const budget = parseBudget(t);
    const people = Number(t.match(/for (\d+)\s*(people|of us|persons|friends)?/)?.[1]) || 1;

    if (/^(hi|hello|hey|heita|sawubona|ndaa|aa|dumela|good (morning|afternoon|evening))\b/.test(t) && t.split(" ").length <= 4)
      return `Hey! 👋 It's ${mealTime()} time. I can find food within your budget, check prices, suggest a meal, or track your order. What are you in the mood for?`;
    if (/\b(thanks|thank you|ndo livhuwa|dankie|shap|sharp)\b/.test(t)) return "Anytime! Enjoy your food 🍽️";
    if (/\bcancel\b/.test(t))
      return "Go to My orders, open the order and tap Cancel order. You can cancel while it's still \"Order received\" — once the shop starts preparing it, ask at the counter instead.";
    if (/\b((ord|uv)-?\s?[a-z0-9]{4,}|my order|order status|track|where is|is it ready|ready yet)\b/.test(t)) return orderAnswer(t);
    if (/\b(cart|basket)\b/.test(t)) return cartAnswer(d);
    if (/\b(pay|payment|cash|card|counter)\b/.test(t))
      return "Two options when you place an order:\n• Pay now — it's marked paid straight away.\n• Pay at counter — pay when you collect.\nEither way, show your order number (like ORD-1A2B3C4D) at the shop.";
    if (/\b(open|closed|hours|which shops|what shops|shops)\b/.test(t) && !shop) {
      const open = d.shops.filter((s) => s.isOpen);
      return open.length
        ? `Open right now: ${open.map((s) => title(s.name)).join(", ")}.${d.shops.length > open.length ? ` Closed: ${d.shops.filter((s) => !s.isOpen).map((s) => title(s.name)).join(", ")}.` : ""}`
        : "All shops are closed right now.";
    }

    // Follow-ups on the previous answer.
    if (/\b(cheaper|less expensive|too expensive|too much)\b/.test(t) && memory.last) {
      const cap = memory.budget ? memory.budget * 0.75 : Math.min(...d.items.filter((i) => memory.shown.has(i.id)).map((i) => i.price)) - 0.01;
      if (memory.last === "budget") return budgetAnswer(d, (memory.budget = cap), people);
      return recommend(d, { filter: memory.filter, maxPrice: cap });
    }
    if (/^(another|something else|more|other|next|else)\b|\b(another one|something else)\b/.test(t) && memory.last) {
      return memory.last === "budget" ? budgetAnswer(d, memory.budget, people) : recommend(d, { filter: memory.filter });
    }

    if (budget || /\b(cheap|cheapest|budget|broke|afford|student price)\b/.test(t)) {
      memory.last = "budget";
      if (budget) return budgetAnswer(d, (memory.budget = budget), people);
      const food = findItems(d.items, t.replace(/\b(cheap|cheapest|budget|broke|afford|student price|what'?s|options?)\b/g, ""));
      const cheapest = (food.length ? food : d.items).filter((i) => i.available).sort((a, b) => a.price - b.price);
      const unique = cheapest.filter((i, n) => cheapest.findIndex((j) => j.name === i.name) === n).slice(0, 4);
      memory.budget = unique.at(-1)?.price ?? null;
      return `Easiest on the wallet right now:\n${unique.map((i) => line(d.shops, i)).join("\n")}\nTell me your budget (e.g. "I have R50") and I'll build a meal around it.`;
    }
    if (/\b(expensive|priciest|best|premium|treat)\b/.test(t)) {
      const top = [...d.items].filter((i) => i.available).sort((a, b) => b.price - a.price).slice(0, 3);
      return `Treat yourself:\n${top.map((i) => line(d.shops, i)).join("\n")}`;
    }

    const asksPrice = /\b(how much|price|cost|costs)\b/.test(t);
    const asksHave = /\b(do you have|do they have|is there|any|sell|available|got)\b/.test(t);
    const rest = withoutShop(text, shop);
    const matches = findItems(shop ? d.items.filter((i) => i.shopId === shop.id) : d.items, rest);

    if ((asksPrice || asksHave) && matches.length) {
      const [first, ...rest] = matches;
      const alt = !first.available && d.items.find((i) => i.available && i.shopId === first.shopId && !isDrink(i));
      return `${first.available ? "Yes!" : "Sorry,"} ${first.name} is ${money(first.price)} at ${shopOf(d.shops, first)}${first.available ? "." : `, but it's sold out right now.${alt ? ` The ${alt.name} (${money(alt.price)}) is available instead.` : ""}`}${rest.length ? `\nAlso:\n${rest.slice(0, 3).map((i) => line(d.shops, i)).join("\n")}` : ""}`;
    }

    const wantsIdea = /\b(recommend|suggest|hungry|starving|craving|what should|what can i|idea|surprise|feel like|something)\b/.test(t);
    if (wantsIdea || shop || matches.length) {
      memory.last = "recommend";
      memory.filter = wantsIdea || shop ? rest.replace(/\b(recommend|suggest|something|i'?m|hungry|starving|craving|what should i (eat|get|have)|from|at|with|surprise me|feel like|please)\b/gi, "") : text;
      if (shop && !wantsIdea && !matches.length) {
        const menu = d.items.filter((i) => i.shopId === shop.id);
        if (!menu.length) return `${title(shop.name)} has nothing on the menu yet.`;
        return `${title(shop.name)} is ${shop.isOpen ? "open" : "closed"}. On the menu:\n${menu.slice(0, 6).map((i) => line(d.shops, i)).join("\n")}${menu.length > 6 ? `\n…and ${menu.length - 6} more.` : ""}`;
      }
      return recommend(d, { filter: memory.filter, shop });
    }

    const words = tokens(t);
    if (asksPrice || asksHave || (words.length && words.length <= 3)) {
      const thing = text.replace(/\b(how much|is|are|a|an|the|do you have|any|price|cost|costs|\?)\b|\?/gi, " ").replace(/\s+/g, " ").trim();
      memory.last = "recommend";
      memory.filter = "";
      return `No ${thing ? `"${thing}"` : "match"} on any campus menu today, sorry. ${recommend(d)}`;
    }

    return `I'm not sure I got that 🤔 Here's what I can do:\n• "I have R60" — meals that fit your budget\n• "How much is a kota?" — prices\n• "Recommend something with chicken"\n• "Where is my order?"\n• "What's in my cart?"`;
  }

  return { reply };
}
