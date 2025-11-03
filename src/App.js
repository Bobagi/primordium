import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Element from "./Element";
import PhysicsEngine from "./PhysicsEngine";
import { combos } from "./data/elements";
import { createInitialElements } from "./utils/elementFactory";
import "./App.css";

export default function App() {
  const { t, i18n } = useTranslation();

  const [elements, setElements] = useState(() => createInitialElements());
  const [feed, setFeed] = useState([]);
  const [removeOnCombine, setRemoveOnCombine] = useState(true);
  const recentlyCombined = useRef(new Set());
  const elementRefs = useRef({});
  const [, forceUpdate] = useState(0);
  const canvasRef = useRef(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const panState = useRef(null);

  useEffect(() => forceUpdate((n) => n + 1), [elements]);

  const registerCombo = (a, b) => {
    const key = [a, b].sort().join("+");
    recentlyCombined.current.add(key);
    setTimeout(() => recentlyCombined.current.delete(key), 500);
  };

  const mixColors = (h1, h2) => {
    const toRgb = (h) =>
      h.length === 7
        ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
        : [0, 0, 0];
    const [r1, g1, b1] = toRgb(h1);
    const [r2, g2, b2] = toRgb(h2);
    return `rgb(${Math.floor((r1 + r2) / 2)},${Math.floor(
      (g1 + g2) / 2
    )},${Math.floor((b1 + b2) / 2)})`;
  };

  const handleMove = useCallback(
    (id, nx, ny) => {
      setElements((els) =>
        els.map((e) => (e.id === id ? { ...e, x: nx, y: ny } : e))
      );
      const moveBall = elements.find((e) => e.id === id);

      elements
        .filter((e) => e.id !== id)
        .forEach((o) => {
          const id1 = moveBall.baseId || moveBall.id;
          const id2 = o.baseId || o.id;
          const key = [id1, id2].sort().join("+");

          const result = combos[key];
          const dist = Math.hypot(nx - o.x, ny - o.y);

          if (!result || dist >= 60 || recentlyCombined.current.has(key))
            return;

          registerCombo(id1, id2);

          const newId = `${result.id}-${Date.now()}`;
          const newX = (nx + o.x) / 2 + 60;
          const newY = (ny + o.y) / 2;
          setElements((prev) => {
            const base = removeOnCombine
              ? prev.filter((e) => e.id !== id && e.id !== o.id)
              : prev;
            return [
              ...base,
              {
                id: newId,
                baseId: result.id,
                image: result.image,
                x: newX,
                y: newY,
                color: mixColors(moveBall.color, o.color),
              },
            ];
          });

          setFeed((f) => [
            {
              text: `${t(`elements.${id1}.name`)} + ${t(
                `elements.${id2}.name`
              )} = ${t(`elements.${result.id}.name`)}`,
              ts: Date.now(),
            },
            ...f.slice(0, 4),
          ]);
        });
    },
    [elements, removeOnCombine, t]
  );

  const reset = () => {
    setElements(createInitialElements());
    setFeed([]);
    setViewOffset({ x: 0, y: 0 });
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handlePanStart = (event) => {
    if (!canvasRef.current || event.target.closest(".elemento")) return;

    panState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offset: { ...viewOffset },
    };

    canvasRef.current.classList.add("is-panning");
    canvasRef.current.setPointerCapture?.(event.pointerId);
  };

  const handlePanMove = (event) => {
    if (!panState.current || panState.current.pointerId !== event.pointerId)
      return;

    const dx = event.clientX - panState.current.startX;
    const dy = event.clientY - panState.current.startY;

    setViewOffset({
      x: clamp(panState.current.offset.x + dx, -160, 160),
      y: clamp(panState.current.offset.y + dy, -160, 160),
    });
  };

  const handlePanEnd = (event) => {
    if (!panState.current || panState.current.pointerId !== event.pointerId)
      return;

    canvasRef.current?.classList.remove("is-panning");
    canvasRef.current?.releasePointerCapture?.(event.pointerId);
    panState.current = null;
  };

  return (
    <div className="App">
      <PhysicsEngine elements={elements} setElements={setElements} />

      <div
        ref={canvasRef}
        className="playfield"
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
      >
        <svg className="playfield-overlay">
          {elements.map((e1) =>
            elements.map((e2) => {
              if (e1.id >= e2.id) return null;

              const id1 = e1.baseId || e1.id;
              const id2 = e2.baseId || e2.id;
              const comboKey = [id1, id2].sort().join("+");

              if (!combos[comboKey]) return null;

              const n1 = elementRefs.current[e1.id];
              const n2 = elementRefs.current[e2.id];
              if (!n1 || !n2) return null;

              const r1 = n1.getBoundingClientRect();
              const r2 = n2.getBoundingClientRect();
              const offsetTop =
                canvasRef.current?.getBoundingClientRect().top || 0;

              const x1 = r1.left + r1.width / 2;
              const y1 = r1.top + r1.height / 2 - offsetTop;
              const x2 = r2.left + r2.width / 2;
              const y2 = r2.top + r2.height / 2 - offsetTop;

              return (
                <line
                  key={`${e1.id}-${e2.id}`}
                  className="connection"
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              );
            })
          )}
        </svg>

        {elements.map((e) => {
          const baseKey = e.baseId || e.id;
          return (
            <Element
              key={e.id}
              id={e.id}
              x={e.x}
              y={e.y}
              name={t(`elements.${baseKey}.name`)}
              wiki={t(`elements.${baseKey}.wiki`)}
              description={t(`elements.${baseKey}.description`)}
              image={e.image}
              color={e.color}
              offset={viewOffset}
              innerRef={(node) => (elementRefs.current[e.id] = node)}
              onMove={handleMove}
            />
          );
        })}
      </div>

      <header className="hud-topbar" aria-label={t("controlsTitle")}>
        <div className="hud-topbar__content">
          <div className="hud-topbar__group hud-topbar__brand">
            <span className="hud-topbar__logo">Primordium</span>
            <span className="hud-topbar__tip">{t("tipClick")}</span>
          </div>
          <div className="hud-topbar__group hud-topbar__controls">
            <div className="hud-topbar__item hud-topbar__language">
              <span className="hud-topbar__label">{t("language")}</span>
              <select
                id="language-select"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
              </select>
            </div>
            <label className="hud-topbar__item hud-topbar__checkbox">
              <input
                type="checkbox"
                checked={removeOnCombine}
                onChange={(e) => setRemoveOnCombine(e.target.checked)}
              />
              <span>{t("removeOriginals")}</span>
            </label>
            <button className="hud-topbar__button" onClick={reset}>
              {t("reset")}
            </button>
          </div>
          <div className="hud-topbar__group hud-topbar__links">
            <a
              className="hud-topbar__link hud-topbar__book"
              href={t("bookLink")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("buyNow")}
              <span aria-hidden="true">↗</span>
            </a>
            <a
              className="hud-topbar__link"
              href="https://github.com/Bobagi/primordium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("social.github")}
              <span aria-hidden="true">↗</span>
            </a>
            <a
              className="hud-topbar__link"
              href="https://www.linkedin.com/in/gustavoaperin/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("social.linkedin")}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </header>

      <aside className="activity-sidebar" aria-live="polite">
        <div className="activity-sidebar__header">{t("combinations")}</div>
        <ul className="activity-sidebar__list">
          {feed.length === 0 && (
            <li className="activity-sidebar__item activity-sidebar__item--empty">
              —
            </li>
          )}
          {feed.map((item) => (
            <li className="activity-sidebar__item" key={item.ts}>
              {item.text}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
