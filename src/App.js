import React, { useState, useCallback, useRef } from "react";
import Element from "./Element";

const combos = {
  "ferro+carbono": { id: "aco", nome: "Aço" },
};

const removeOnCombine = true;

export default function App() {
  const [elements, setElements] = useState([
    { id: "ferro", nome: "Ferro", x: 100, y: 100 },
    { id: "carbono", nome: "Carbono", x: 250, y: 200 },
  ]);
  const [feed, setFeed] = useState([]);
  const recentlyCombined = useRef(new Set());

  const registerCombo = (id1, id2) => {
    const key = [id1, id2].sort().join("+");
    recentlyCombined.current.add(key);
    setTimeout(() => recentlyCombined.current.delete(key), 1000); // cooldown de 1s
  };

  const hasCombinedRecently = (id1, id2) => {
    const key = [id1, id2].sort().join("+");
    return recentlyCombined.current.has(key);
  };

  const handleMove = useCallback(
    (id, nx, ny) => {
      setElements((els) =>
        els.map((e) => (e.id === id ? { ...e, x: nx, y: ny } : e))
      );

      const mover = elements.find((e) => e.id === id);
      const outros = elements.filter((e) => e.id !== id);

      for (const o of outros) {
        if (hasCombinedRecently(id, o.id)) continue;

        const dx = nx - o.x;
        const dy = ny - o.y;
        if (Math.hypot(dx, dy) < 60) {
          const key = `${id}+${o.id}`;
          const result = combos[key] || combos[`${o.id}+${id}`];
          if (result) {
            registerCombo(id, o.id);
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
        }
      }
    },
    [elements]
  );

  return (
    <div className="App">
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: 5,
          background: "#fff",
        }}
      >
        Remover originais: {removeOnCombine ? "Sim" : "Não"}
      </div>

      <svg
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          zIndex: 0,
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

      {elements.map((e) => (
        <Element
          key={e.id}
          id={e.id}
          nome={e.nome}
          x={e.x}
          y={e.y}
          onMove={handleMove}
        />
      ))}

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
