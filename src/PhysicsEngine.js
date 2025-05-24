import Matter from "matter-js";
import { useEffect, useRef } from "react";

export default function PhysicsEngine({ elements, setElements }) {
  const engineRef = useRef(Matter.Engine.create());
  const bodiesRef = useRef({});

  useEffect(() => {
    const engine = engineRef.current;
    const { World, Bodies, Runner, Composite } = Matter;

    // Zera gravidade
    engine.gravity.y = 0;
    engine.gravity.x = 0;

    World.clear(engine.world);
    Matter.Engine.clear(engine);
    bodiesRef.current = {};

    // Cria bolinhas
    elements.forEach((el) => {
      const body = Bodies.circle(el.x + 30, el.y + 30, 30, {
        id: el.id,
        label: el.name,
        restitution: 0.9,
        friction: 0.05,
        frictionAir: 0.02,
      });
      bodiesRef.current[el.id] = body;
      World.add(engine.world, body);
    });

    // Cria bordas do mundo
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wallThickness = 100;

    const walls = [
      Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, {
        isStatic: true,
      }),
      Bodies.rectangle(
        width / 2,
        height + wallThickness / 2,
        width,
        wallThickness,
        { isStatic: true }
      ),
      Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
      }),
      Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height,
        { isStatic: true }
      ),
    ];
    World.add(engine.world, walls);

    // Rodar física
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Sync posições com estado React
    const interval = setInterval(() => {
      setElements((prev) =>
        prev.map((el) => {
          const body = bodiesRef.current[el.id];
          if (!body) return el;
          return {
            ...el,
            x: body.position.x - 30,
            y: body.position.y - 30,
          };
        })
      );
    }, 1000 / 60);

    return () => {
      clearInterval(interval);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
    };
  }, [elements, setElements]);

  return null; // componente invisível
}
