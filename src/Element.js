import React, { useRef, useEffect } from "react";
import interact from "interactjs";

const Element = ({ id, nome, x, y, color = "#3498db", onMove, innerRef }) => {
  const ref = useRef(null);

  // calcula tamanho baseado no texto
  const fontSize = 14;
  const minSize = 60;
  const padding = 20;
  const textWidth = nome.length * fontSize * 0.6;
  const size = Math.max(minSize, textWidth + padding);

  // escolhe cor do texto (preto ou branco) conforme contraste
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 150 ? "black" : "white";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-x", x);
    el.setAttribute("data-y", y);
    el.style.transform = `translate(${x}px, ${y}px)`;
    if (innerRef) innerRef(el);

    interact(el).draggable({
      listeners: {
        move(event) {
          const t = event.target;
          const nx = (parseFloat(t.getAttribute("data-x")) || 0) + event.dx;
          const ny = (parseFloat(t.getAttribute("data-y")) || 0) + event.dy;
          t.style.transform = `translate(${nx}px, ${ny}px)`;
          t.setAttribute("data-x", nx);
          t.setAttribute("data-y", ny);
          onMove(id, nx, ny);
        },
      },
    });
  }, [x, y]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        // só faz translate aqui, não escala
        transform: `translate(${x}px, ${y}px)`,
        zIndex: 2, // acima das linhas
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <div
        className="pulse-content"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textColor,
          fontSize: `${fontSize}px`,
          fontWeight: "bold",
          animation: "pulse 3s ease-in-out infinite",
          boxShadow: "0 0 8px rgba(0,0,0,0.3)",
        }}
      >
        {nome}
      </div>
    </div>
  );
};

export default Element;
