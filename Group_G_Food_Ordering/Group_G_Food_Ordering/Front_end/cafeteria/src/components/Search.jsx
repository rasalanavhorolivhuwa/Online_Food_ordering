import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { money } from "../lib";

const norm = (s) => String(s ?? "").trim().toLowerCase();

const mergeById = (local, remote) =>
  remote && !local.some((x) => x.id === remote.id) ? [remote, ...local] : local;

// Search shops and menu items by name. Partial matches come from what's already
// loaded; the backend's by-name endpoints add exact matches (e.g. newly added items).
export function Search({ shops, menuItems, onPickShop, onPickItem }) {
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState({ shop: null, item: null, loading: false });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const q = norm(query);

  useEffect(() => {
    setRemote({ shop: null, item: null, loading: q.length >= 2 });
    if (q.length < 2) return undefined;
    let cancelled = false;
    const id = setTimeout(async () => {
      const [shop, item] = await Promise.all([
        api.getShopByName(query.trim()).catch(() => null),
        api.getMenuItemByName(query.trim()).catch(() => null),
      ]);
      if (!cancelled) setRemote({ shop, item, loading: false });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const shopResults = q ? mergeById(shops.filter((s) => norm(s.name).includes(q)), remote.shop) : [];
  const itemResults = q ? mergeById(menuItems.filter((i) => norm(i.name).includes(q)), remote.item).slice(0, 8) : [];
  const shopName = (id) => shops.find((s) => s.id === id)?.name ?? "";

  function pick(fn, value) {
    fn(value);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="search" ref={ref}>
      <div className="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") {
              if (itemResults[0]) pick(onPickItem, itemResults[0]);
              else if (shopResults[0]) pick(onPickShop, shopResults[0]);
            }
          }}
          placeholder="Search shops or food, e.g. kota"
          aria-label="Search shops and menu items"
        />
        {query && (
          <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </div>

      {open && q && (
        <div className="search-results" role="listbox">
          {shopResults.length > 0 && (
            <>
              <p className="kicker">SHOPS</p>
              {shopResults.map((s) => (
                <button key={`s-${s.id}`} className="result" onClick={() => pick(onPickShop, s)}>
                  <span className="result-icon" style={{ background: s.accent }}>{s.name[0]}</span>
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.isOpen ? "Open" : "Closed"}</small>
                  </span>
                </button>
              ))}
            </>
          )}
          {itemResults.length > 0 && (
            <>
              <p className="kicker">MENU ITEMS</p>
              {itemResults.map((i) => (
                <button key={`i-${i.id}`} className="result" onClick={() => pick(onPickItem, i)}>
                  <span className="result-icon">{i.name[0]}</span>
                  <span>
                    <strong>{i.name}</strong>
                    <small>
                      {shopName(i.shopId)}
                      {!i.available && " · Sold out"}
                    </small>
                  </span>
                  <b>{money(i.price)}</b>
                </button>
              ))}
            </>
          )}
          {!shopResults.length && !itemResults.length && (
            <p className="search-empty">{remote.loading ? "Searching…" : `No shops or food called “${query.trim()}”.`}</p>
          )}
        </div>
      )}
    </div>
  );
}
