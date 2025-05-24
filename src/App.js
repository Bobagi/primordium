import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Element from "./Element";
import PhysicsEngine from "./PhysicsEngine";

const combos = {
  "ferro+carbono": {
    id: "aco",
    nome: { pt: "Aço", en: "Steel" },
    image: "/img/steel.png",
  },
};

const randomColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

const initialElements = [
  {
    id: "ferro",
    nome: { pt: "Ferro", en: "Iron" },
    x: 100,
    y: 100,
    image: "/img/iron.png",
  },
  {
    id: "carbono",
    nome: { pt: "Carbono", en: "Carbon" },
    x: 250,
    y: 200,
    image: "/img/carbon.png",
  },
];

export default function App() {
  const { t, i18n } = useTranslation();

  const [elements, setElements] = useState(() =>
    initialElements.map((e) => ({ ...e, color: randomColor() }))
  );
  const [feed, setFeed] = useState([]);
  const [removeOnCombine, setRemoveOnCombine] = useState(true);
  const recentlyCombined = useRef(new Set());
  const elementRefs = useRef({});
  const [, forceUpdate] = useState(0);

  // refresha linhas quando elements mudar
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
      // atualiza posição
      setElements((els) =>
        els.map((e) => (e.id === id ? { ...e, x: nx, y: ny } : e))
      );
      const mover = elements.find((e) => e.id === id);

      elements
        .filter((e) => e.id !== id)
        .forEach((o) => {
          const key = [id, o.id].sort().join("+");
          const dist = Math.hypot(nx - o.x, ny - o.y);
          const result = combos[`${id}+${o.id}`] || combos[`${o.id}+${id}`];
          if (!result || dist >= 60 || recentlyCombined.current.has(key))
            return;
          registerCombo(id, o.id);

          // cria a nova bolinha via tradução
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
                nome: result.nome,
                image: result.image,
                x: newX,
                y: newY,
                color: mixColors(mover.color, o.color),
              },
            ];
          });
          setFeed((f) => [
            {
              text: `${mover.nome} + ${o.nome} = ${result.nome}`,
              ts: Date.now(),
            },
            ...f.slice(0, 4),
          ]);
        });
    },
    [elements, removeOnCombine]
  );

  const reset = () => {
    setElements(initialElements.map((e) => ({ ...e, color: randomColor() })));
    setFeed([]);
  };

  return (
    <div className="App" style={{ position: "relative" }}>
      <PhysicsEngine elements={elements} setElements={setElements} />

      {/* idioma + controles */}
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

      {/* conexões */}
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

      {/* bolinhas */}
      {elements.map((e) => (
        <Element
          key={e.id}
          id={e.id}
          x={e.x}
          y={e.y}
          nome={e.nome[i18n.language] || e.nome.pt}
          wiki={t(`elements.${e.id}.wiki`)}
          description={t(`elements.${e.id}.description`)}
          image={
            typeof e.image === "string"
              ? e.image
              : e.image?.[i18n.language] || e.image?.pt
          }
          color={e.color}
          innerRef={(node) => (elementRefs.current[e.id] = node)}
          onMove={handleMove}
        />
      ))}

      {/* histórico */}
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
