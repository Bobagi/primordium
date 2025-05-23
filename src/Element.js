import interact from "interactjs";
import React, { useEffect, useRef } from "react";

const Element = ({ nome, x, y }) => {
  const ref = useRef(null);

  useEffect(() => {
    interact(ref.current).draggable({
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },
    });
  }, []);

  return (
    <div
      ref={ref}
      className="elemento"
      style={{ left: x, top: y, position: "absolute" }}
    >
      {nome}
    </div>
  );
};

export default Element;
