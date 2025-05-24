import interact from "interactjs";
import React, { useEffect, useRef } from "react";

const Element = ({ nome, x, y, id, onMove, innerRef, color = "#3498db" }) => {
  const ref = useRef(null);
  const fontSize = 14;
  const minSize = 60;
  const padding = 20;
  const textWidth = nome.length * fontSize * 0.6; // aprox.
  const size = Math.max(minSize, textWidth + padding);

  function getTextColor(bgColor) {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? "black" : "white";
  }

  const textColor = getTextColor(color);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.setAttribute("data-x", x);
      el.setAttribute("data-y", y);
      el.style.transform = `translate(${x}px, ${y}px)`; // <-- aplica só uma vez
      if (innerRef) innerRef(el);
    }

    interact(el).draggable({
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);

          onMove(id, x, y);
        },
      },
    });
  }, [x, y, innerRef]);

  return (
    <div
      ref={ref}
      className="elemento"
      style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: color,
        color: textColor,
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
        willChange: "transform",
      }}
    >
      {nome}
    </div>
  );
};

export default Element;
