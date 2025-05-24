import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Element from "./Element";
import PhysicsEngine from "./PhysicsEngine";
import { combos } from "./data/elements";
import { createInitialElements } from "./utils/elementFactory";

export default function App() {
  const { t, i18n } = useTranslation();

  const [elements, setElements] = useState(() => createInitialElements());
  const [feed, setFeed] = useState([]);
  const [removeOnCombine, setRemoveOnCombine] = useState(true);
  const recentlyCombined = useRef(new Set());
  const elementRefs = useRef({});
  const [, forceUpdate] = useState(0);

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
          const key = [id, o.id].sort().join("+");
          const dist = Math.hypot(nx - o.x, ny - o.y);
          const result = combos[`${id}+${o.id}`] || combos[`${o.id}+${id}`];
          if (!result || dist >= 60 || recentlyCombined.current.has(key))
            return;

          registerCombo(id, o.id);

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
              text: `${t(`elements.${moveBall.baseId || moveBall.id}.name`)} + ${t(
                `elements.${o.baseId || o.id}.name`
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
  };

  return (
    <div className="App" style={{ position: "relative" }}>
      <PhysicsEngine elements={elements} setElements={setElements} />

      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "#fff",
          padding: "8px",
          zIndex: 2,
          fontSize: "0.9em",
          border: "1px solid #ccc",
        }}
      >
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="pt">Português</option>
          <option value="en">English</option>
        </select>{" "}
        <label>
          <input
            type="checkbox"
            checked={removeOnCombine}
            onChange={(e) => setRemoveOnCombine(e.target.checked)}
          />{" "}
          {t("removeOriginals")}
        </label>
        <button onClick={reset} style={{ marginLeft: 10 }}>
          {t("reset")}
        </button>
        <div style={{ marginTop: 6, color: "#444" }}>{t("tipClick")}</div>
      </div>

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {elements.map((e1) =>
          elements.map((e2) => {
            if (e1.id >= e2.id) return null;
            const n1 = elementRefs.current[e1.id];
            const n2 = elementRefs.current[e2.id];
            if (!n1 || !n2) return null;
            const r1 = n1.getBoundingClientRect();
            const r2 = n2.getBoundingClientRect();
            const x1 = r1.left + r1.width / 2;
            const y1 = r1.top + r1.height / 2;
            const x2 = r2.left + r2.width / 2;
            const y2 = r2.top + r2.height / 2;
            return (
              <line
                key={`${e1.id}-${e2.id}`}
                className="connection"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="gray"
                strokeWidth={1}
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
            innerRef={(node) => (elementRefs.current[e.id] = node)}
            onMove={handleMove}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          fontFamily: "monospace",
          maxWidth: 300,
          fontSize: "0.9em",
          zIndex: 2,
        }}
      >
        <strong>{t("combinations")}:</strong>
        {feed.map((item) => (
          <div key={item.ts}>{item.text}</div>
        ))}
      </div>
    </div>
  );
}
