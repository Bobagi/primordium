import interact from "interactjs";
import React, { useEffect, useRef } from "react";

const Element = ({ nome, x, y, id, onMove, innerRef }) => {
  const ref = useRef(null);

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
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#3498db",
        color: "white",
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
