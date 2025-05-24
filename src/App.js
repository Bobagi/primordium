import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Element from "./Element";
import "./index.css";
import PhysicsEngine from "./PhysicsEngine";
import "./style.css";

const combos = {
  "ferro+carbono": { id: "aco", nome: "Aço" },
};

// Gera cor aleatória
const randomColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

// Base de elementos iniciais (sem cor)
const initialElements = [
  {
    id: "ferro",
    nome: "Ferro",
    x: 100,
    y: 100,
    wiki: "https://pt.wikipedia.org/wiki/Ferro",
    image: "/img/ferro.png",
  },
  {
    id: "carbono",
    nome: "Carbono",
    x: 250,
    y: 200,
    wiki: "https://pt.wikipedia.org/wiki/Carbono",
    image: "/img/carbono.png",
  },
];

export default function App() {
  // Estado com cores randomizadas
  const [elements, setElements] = useState(() =>
    initialElements.map((e) => ({ ...e, color: randomColor() }))
  );
  const [feed, setFeed] = useState([]);
  const [removeOnCombine, setRemoveOnCombine] = useState(true);
  const recentlyCombined = useRef(new Set());
  const elementRefs = useRef({});
  const [, forceUpdate] = useState(0);

  // Força re-render das linhas quando elements muda
  useEffect(() => {
    forceUpdate((n) => n + 1);
  }, [elements]);

  // Evita múltiplas combinações seguidas
  const registerCombo = (a, b) => {
    const key = [a, b].sort().join("+");
    recentlyCombined.current.add(key);
    setTimeout(() => recentlyCombined.current.delete(key), 500);
  };

  // Mix de cores para resultado do combo
  const mixColors = (hex1, hex2) => {
    const toRgb = (hex) =>
      hex.length === 7
        ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
        : [0, 0, 0];
    const [r1, g1, b1] = toRgb(hex1);
    const [r2, g2, b2] = toRgb(hex2);
    return `rgb(${Math.floor((r1 + r2) / 2)},${Math.floor(
      (g1 + g2) / 2
    )},${Math.floor((b1 + b2) / 2)})`;
  };

  // Quando move uma bolinha
  const handleMove = useCallback(
    (id, nx, ny) => {
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

          // Atualiza bolinhas, removendo ou não as originais
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

          // Adiciona ao feed
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

  // Reset sem duplicar manualmente
  const reset = () => {
    setElements(
      initialElements.map((e) => ({
        ...e,
        color: randomColor(),
      }))
    );
    setFeed([]);
  };

  return (
    <div className="App" style={{ position: "relative" }}>
      <PhysicsEngine elements={elements} setElements={setElements} />

      {/* Controles e Dica */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "#fff",
          padding: "8px",
          zIndex: 2,
          border: "1px solid #ccc",
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
        <div style={{ marginTop: 8, fontSize: "0.85em" }}>
          💡 Clique em uma bolinha para abrir um link com mais informações.
        </div>
      </div>

      {/* Conexões */}
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

      {/* Bolinhas */}
      {elements.map((e) => (
        <Element
          key={e.id}
          id={e.id}
          nome={e.nome}
          x={e.x}
          y={e.y}
          color={e.color}
          image={e.image}
          wiki={e.wiki}
          innerRef={(node) => (elementRefs.current[e.id] = node)}
          onMove={handleMove}
        />
      ))}

      {/* Histórico de Combinações */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          fontFamily: "monospace",
          maxWidth: 300,
          fontSize: "0.9em",
          zIndex: 9999,
          textAlign: "left",
        }}
      >
        <strong>Combinações:</strong>
        {feed.length === 0 ? (
          <div style={{ fontStyle: "italic", color: "#888" }}>
            Nenhuma ainda.
          </div>
        ) : (
          feed.map((item) => <div key={item.ts}>{item.text}</div>)
        )}
      </div>
    </div>
  );
}
