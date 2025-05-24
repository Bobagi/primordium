import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Element from "./Element";
import "./index.css";
import PhysicsEngine from "./PhysicsEngine";
import "./style.css";

const combos = {
  "ferro+carbono": { id: "aco", nome: "Aço" },
};

export default function App() {
  // Gera cor hex aleatória
  const randomColor = () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;

  // Mix de duas cores
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

  // Calcula tamanho da bolinha baseado no texto
  const getSize = (nome) => {
    const fontSize = 14;
    const minSize = 60;
    const padding = 20;
    const textWidth = nome.length * fontSize * 0.6;
    return Math.max(minSize, textWidth + padding);
  };

  // Estado principal
  const [elements, setElements] = useState([
    {
      id: "ferro",
      nome: "Ferro",
      x: 100,
      y: 100,
      color: randomColor(),
      wiki: "https://pt.wikipedia.org/wiki/Ferro",
      image: "/img/ferro.png", // coloque essa imagem em public/img/ferro.png
    },
    {
      id: "carbono",
      nome: "Carbono",
      x: 250,
      y: 200,
      color: randomColor(),
      wiki: "https://pt.wikipedia.org/wiki/Carbono",
      image: "/img/carbono.png",
    },
  ]);

  const [feed, setFeed] = useState([]);
  const [removeOnCombine, setRemoveOnCombine] = useState(true);

  // Para evitar múltiplas combinações seguidas
  const recentlyCombined = useRef(new Set());

  // Refs dos nodes DOM das bolinhas
  const elementRefs = useRef({});

  // Força re-render das linhas quando elements muda
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    forceUpdate((n) => n + 1);
  }, [elements]);

  // Registra combo e limpa após cooldown
  const registerCombo = (a, b) => {
    const key = [a, b].sort().join("+");
    recentlyCombined.current.add(key);
    setTimeout(() => recentlyCombined.current.delete(key), 500);
  };

  // Lógica de mover + detectar combinação
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

          if (!result || dist >= 60 || recentlyCombined.current.has(pairKey))
            return;

          registerCombo(id, o.id);

          // atualiza bolinhas
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

          // log no feed
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

  // Reset ao estado inicial (com novas cores aleatórias)
  const reset = () => {
    setElements([
      {
        id: "ferro",
        nome: "Ferro",
        x: 100,
        y: 100,
        color: randomColor(),
        image: "/img/ferro.png",
        wiki: "https://pt.wikipedia.org/wiki/Ferro",
      },
      {
        id: "carbono",
        nome: "Carbono",
        x: 250,
        y: 200,
        color: randomColor(),
        image: "/img/carbono.png",
        wiki: "https://pt.wikipedia.org/wiki/Carbono",
      },
    ]);
    setFeed([]);
  };

  return (
    <div className="App" style={{ position: "relative" }}>
      <PhysicsEngine elements={elements} setElements={setElements} />

      {/* controles */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "#fff",
          padding: "8px",
          zIndex: 2,
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

      {/* conexões via SVG, sempre atrás */}
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

      {/* feed */}
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
        <strong>Combinações:</strong>
        {feed.map((item) => (
          <div key={item.ts}>{item.text}</div>
        ))}
      </div>
    </div>
  );
}
