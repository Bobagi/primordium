import React, { useCallback, useRef, useState } from "react";
import Element from "./Element";
import PhysicsEngine from "./PhysicsEngine";

const combos = {
  "ferro+carbono": { id: "aco", nome: "Aço" },
};

export default function App() {
  const randomColor = () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;

  const [elements, setElements] = useState([
    { id: "ferro", nome: "Ferro", x: 100, y: 100, color: randomColor() },
    { id: "carbono", nome: "Carbono", x: 250, y: 200, color: randomColor() },
  ]);

  const [feed, setFeed] = useState([]);
  const [removeOnCombine, setRemoveOnCombine] = useState(true);
  const recentlyCombined = useRef(new Set());

  function mixColors(hex1, hex2) {
    const toRgb = (hex) =>
      hex.length === 7
        ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
        : [0, 0, 0];
    const [r1, g1, b1] = toRgb(hex1);
    const [r2, g2, b2] = toRgb(hex2);
    const r = Math.floor((r1 + r2) / 2);
    const g = Math.floor((g1 + g2) / 2);
    const b = Math.floor((b1 + b2) / 2);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const registerCombo = (a, b) => {
    const key = [a, b].sort().join("+");
    recentlyCombined.current.add(key);
    setTimeout(() => recentlyCombined.current.delete(key), 500);
  };
  const hasCombinedRecently = (a, b) =>
    recentlyCombined.current.has([a, b].sort().join("+"));

  const handleMove = useCallback(
    (id, nx, ny) => {
      setElements((els) =>
        els.map((e) => (e.id === id ? { ...e, x: nx, y: ny } : e))
      );
      const mover = elements.find((e) => e.id === id);
      elements
        .filter((e) => e.id !== id)
        .forEach((o) => {
          const pairKey = [id, o.id].sort().join("+");
          const dist = Math.hypot(nx - o.x, ny - o.y);
          const result = combos[`${id}+${o.id}`] || combos[`${o.id}+${id}`];

          // só combina se: tem resultado E não combinou antes E estão colidindo
          if (result && dist < 60 && !recentlyCombined.current.has(pairKey)) {
            recentlyCombined.current.add(pairKey); // registra
            setTimeout(() => recentlyCombined.current.delete(pairKey), 2000); // cooldown

            setElements((prev) => {
              const base = removeOnCombine
                ? prev.filter((e) => e.id !== id && e.id !== o.id)
                : prev;
              return [
                ...base,
                {
                  id: `${result.id}-${Date.now()}`,
                  nome: result.nome,
                  x: (nx + o.x) / 2 + 60,
                  y: (ny + o.y) / 2,
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
          }
        });
    },
    [elements, removeOnCombine]
  );

  const reset = () => {
    setElements([
      { id: "ferro", nome: "Ferro", x: 100, y: 100 },
      { id: "carbono", nome: "Carbono", x: 250, y: 200 },
    ]);
    setFeed([]);
  };

  return (
    <div className="App">
      <PhysicsEngine elements={elements} setElements={setElements} />
      {/* Controles */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "#fff",
          padding: "8px",
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={removeOnCombine}
            onChange={(e) => setRemoveOnCombine(e.target.checked)}
          />{" "}
          Remover originais
        </label>
        <button onClick={reset} style={{ marginLeft: 10 }}>
          Reset
        </button>
      </div>

      {/* Linhas */}
      <svg
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none", // 👈 ESSA LINHA
        }}
      >
        {elements.map((e1) =>
          elements.map((e2) => {
            if (e1.id >= e2.id) return null;
            return (
              <line
                key={`${e1.id}-${e2.id}`}
                x1={e1.x + 30}
                y1={e1.y + 30}
                x2={e2.x + 30}
                y2={e2.y + 30}
                stroke="gray"
                strokeWidth={1}
              />
            );
          })
        )}
      </svg>

      {/* Bolinhas */}
      {elements.map((e) => (
        <Element
          key={e.id}
          id={e.id}
          nome={e.nome}
          x={e.x}
          y={e.y}
          color={e.color}
          onMove={handleMove}
        />
      ))}

      {/* Feed */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          fontFamily: "monospace",
          maxWidth: "300px",
          fontSize: "0.9em",
        }}
      >
        <strong>Combinações:</strong>
        {feed.map((item) => (
          <div key={item.ts}>{item.text}</div>
        ))}
      </div>
    </div>
  );
}
