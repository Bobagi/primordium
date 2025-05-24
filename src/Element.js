import interact from "interactjs";
import { useEffect, useRef } from "react";

const Element = ({
  id,
  name,
  x,
  y,
  color = "#3498db",
  image,
  wiki,
  onMove,
  innerRef,
}) => {
  const ref = useRef(null);
  const clickStart = useRef({ x: 0, y: 0 });

  const fontSize = 14;
  const minSize = 60;
  const padding = 20;
  const textWidth = name.length * fontSize * 0.6;
  const size = Math.max(minSize, textWidth + padding);

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

          const trail = document.createElement("div");
          trail.className = "trail";
          document.body.appendChild(trail);
          const rect = t.getBoundingClientRect();
          trail.style.left = `${rect.left + rect.width / 2}px`;
          trail.style.top = `${rect.top + rect.height / 2}px`;
          trail.style.color = color;
          const ang = Math.random() * 2 * Math.PI;
          const dist = 10 + Math.random() * 10;
          trail.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
          trail.style.setProperty("--dy", `${Math.sin(ang) * dist}px`);
          setTimeout(() => trail.remove(), 500);
        },
      },
    });
  }, [id, x, y, onMove, innerRef, color]);

  return (
    <div
      ref={ref}
      className="elemento"
      onMouseDown={(e) => (clickStart.current = { x: e.clientX, y: e.clientY })}
      onMouseUp={(e) => {
        const dx = Math.abs(e.clientX - clickStart.current.x);
        const dy = Math.abs(e.clientY - clickStart.current.y);
        if (dx < 5 && dy < 5 && wiki) {
          window.open(wiki, "_blank", "noopener,noreferrer");
        }
      }}
      style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(${x}px, ${y}px)`,
        zIndex: 2,
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: textColor,
          fontSize: `${fontSize}px`,
          fontWeight: "bold",
          overflow: "hidden",
          padding: "4px",
        }}
      >
        {image && (
          <img
            src={image}
            alt={name}
            style={{
              maxWidth: "60%",
              maxHeight: "60%",
              marginBottom: "2px",
              objectFit: "contain",
            }}
          />
        )}
        <span>{name}</span>
      </div>
    </div>
  );
};

export default Element;
