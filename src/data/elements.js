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
    id: "iron-2",
    baseId: "iron",
    x: 170,
    y: 370,
    image: "/img/iron.png",
  },
  {
    id: "iron-3",
    baseId: "iron",
    x: 220,
    y: 300,
    image: "/img/iron.png",
  },
  {
    id: "carbon-2",
    baseId: "carbon",
    x: 300,
    y: 450,
    image: "/img/carbon.png",
  },
  {
    id: "carbon-3",
    baseId: "carbon",
    x: 340,
    y: 370,
    image: "/img/carbon.png",
  },
  {
    id: "wood",
    x: 400,
    y: 340,
    image: "/img/carbon.png",
  },
  {
    id: "wood-2",
    baseId: "wood",
    x: 430,
    y: 430,
    image: "/img/carbon.png",
  },
  {
    id: "wood-3",
    baseId: "wood",
    x: 500,
    y: 370,
    image: "/img/carbon.png",
  },
  {
    id: "wood-4",
    baseId: "wood",
    x: 560,
    y: 420,
    image: "/img/carbon.png",
  },
  {
    id: "wood-5",
    baseId: "wood",
    x: 610,
    y: 340,
    image: "/img/carbon.png",
  },
  {
    id: "stone",
    x: 550,
    y: 300,
    image: "/img/carbon.png",
  },
  {
    id: "stone-2",
    baseId: "stone",
    x: 520,
    y: 250,
    image: "/img/carbon.png",
  },
  {
    id: "stone-3",
    baseId: "stone",
    x: 600,
    y: 260,
    image: "/img/carbon.png",
  },
  {
    id: "stone-4",
    baseId: "stone",
    x: 650,
    y: 300,
    image: "/img/carbon.png",
  },
  {
    id: "stone-5",
    baseId: "stone",
    x: 680,
    y: 360,
    image: "/img/carbon.png",
  },
  {
    id: "stone-6",
    baseId: "stone",
    x: 620,
    y: 470,
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
  "axe+shovel": {
    id: "hoe",
    image: "/img/carbon.png",
  },
  "hoe+stone": {
    id: "seeds",
    image: "/img/carbon.png",
  },
  "hoe+shovel": {
    id: "tilled_soil",
    image: "/img/carbon.png",
  },
  "seeds+tilled_soil": {
    id: "farming",
    image: "/img/carbon.png",
  },
};
