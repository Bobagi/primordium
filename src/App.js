import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Element from "./Element";
import PhysicsEngine from "./PhysicsEngine";
import { combos } from "./data/elements";
import { createInitialElements } from "./utils/elementFactory";
import "./App.css";
import { trackEvent } from "./utils/analytics";

const GithubLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 .5a12 12 0 0 0-3.79 23.38c.6.1.82-.26.82-.58v-2.14c-3.34.73-4.04-1.6-4.04-1.6-.55-1.37-1.33-1.74-1.33-1.74-1.08-.74.08-.73.08-.73 1.2.08 1.82 1.2 1.82 1.2 1.05 1.8 2.78 1.28 3.46.98.1-.76.42-1.28.76-1.58-2.66-.3-5.46-1.32-5.46-5.86 0-1.3.47-2.37 1.23-3.2-.12-.3-.53-1.52.12-3.16 0 0 1-.32 3.3 1.22a11.6 11.6 0 0 1 6 0c2.28-1.54 3.3-1.22 3.3-1.22.65 1.64.24 2.86.12 3.16.76.83 1.23 1.9 1.23 3.2 0 4.55-2.8 5.55-5.48 5.84.44.37.82 1.08.82 2.2v3.27c0 .32.22.68.83.57A12 12 0 0 0 12 .5Z"
    />
  </svg>
);

const LinkedinLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.5 9h5V21h-5V9Zm8 0h4.78v1.71h.07c.66-1.25 2.3-2.56 4.73-2.56 5.05 0 5.98 3.22 5.98 7.41V21h-4.98v-4.8c0-1.15-.02-2.64-1.64-2.64-1.64 0-1.9 1.25-1.9 2.55V21H10.5V9Z"
    />
  </svg>
);

export default function App() {
  const { t, i18n } = useTranslation();

  const [elements, setElements] = useState(() => createInitialElements());
  const [feed, setFeed] = useState([]);
  const [removeOnCombine, setRemoveOnCombine] = useState(true);
  const [isFeedOpen, setFeedOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth > 768;
  });
  const recentlyCombined = useRef(new Set());
  const elementRefs = useRef({});
  const [, forceUpdate] = useState(0);
  const canvasRef = useRef(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const panState = useRef(null);
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const updateHudHeight = () => {
      const rect = node.getBoundingClientRect();
      document.documentElement.style.setProperty(
        "--hud-height",
        `${rect.height}px`
      );
    };

    updateHudHeight();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateHudHeight);
      resizeObserver.observe(node);
    }

    window.addEventListener("resize", updateHudHeight);

    return () => {
      window.removeEventListener("resize", updateHudHeight);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => forceUpdate((n) => n + 1), [elements]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setFeedOpen(true);
      } else {
        setFeedOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    trackEvent("select_language", {
      language: i18n.language,
    });
  }, [i18n.language]);

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
          trackEvent("discover_combo", {
            first_element: id1,
            second_element: id2,
            result_element: result.id,
          });

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
    trackEvent("reset_game");
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
        <div ref={headerRef} className="hud-topbar__content">
          <div className="hud-topbar__left">
            <span className="hud-topbar__brand" aria-label="Primordium">
              <img
                className="hud-topbar__brand-icon"
                src="/favicon.ico"
                alt=""
              />
              <span className="hud-topbar__logo">Primordium</span>
            </span>
            <span className="hud-topbar__tip">{t("tipClick")}</span>
          </div>
          <a
            className="hud-topbar__book"
            href={t("bookLink")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="hud-topbar__book-art"
              src="/img/book/book_cover.jpg"
              alt={t("bookTooltip")}
            />
            <span className="hud-topbar__book-text">{t("buyNow")}</span>
          </a>
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
            <label
              className="hud-topbar__item hud-topbar__checkbox"
              title={t("removeOriginalsHint")}
            >
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
              className="hud-topbar__link"
              href="https://github.com/Bobagi/primordium"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hud-topbar__link-icon">
                <GithubLogo />
              </span>
              {t("social.github")}
              <span aria-hidden="true">↗</span>
            </a>
            <a
              className="hud-topbar__link"
              href="https://www.linkedin.com/in/gustavoaperin/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hud-topbar__link-icon">
                <LinkedinLogo />
              </span>
              {t("social.linkedin")}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </header>

      <button
        type="button"
        className={`activity-toggle${isFeedOpen ? " is-open" : ""}`}
        onClick={() => setFeedOpen((open) => !open)}
        aria-expanded={isFeedOpen}
        aria-controls="activity-feed"
      >
        <span aria-hidden="true">🧪</span>
        <span>{t("combinations")}</span>
      </button>

      <aside
        id="activity-feed"
        className={`activity-sidebar${isFeedOpen ? " is-open" : ""}`}
        aria-live="polite"
      >
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
