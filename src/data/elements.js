export const initialElements = [
  {
    id: "iron",
    x: 100,
    y: 300,
    image: "/img/iron.png",
  },
  {
    id: "carbon",
    x: 250,
    y: 400,
    image: "/img/carbon.png",
  },
  {
    id: "wood",
    x: 400,
    y: 340,
    image: "/img/carbon.png",
  },
  {
    id: "stone",
    x: 550,
    y: 300,
    image: "/img/carbon.png",
  },
];

// The elements in combo should be in alphabetical order
export const combos = {
  "carbon+iron": {
    id: "steel",
    image: "/img/steel.png",
  },
  "stone+wood": {
    id: "axe",
    image: "/img/carbon.png",
  },
  "axe+steel": {
    id: "shovel",
    image: "/img/carbon.png",
  },
};
