export const initialElements = [
  {
    id: "iron",
    x: 100,
    y: 300,
    image: "/img/iron.png",
  },
  {
    id: "iron-2",
    baseId: "iron",
    x: 170,
    y: 350,
    image: "/img/iron.png",
  },
  {
    id: "carbon",
    x: 250,
    y: 400,
    image: "/img/carbon.png",
  },
  {
    id: "carbon-2",
    baseId: "carbon",
    x: 320,
    y: 440,
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
    x: 470,
    y: 390,
    image: "/img/carbon.png",
  },
  {
    id: "wood-3",
    baseId: "wood",
    x: 530,
    y: 340,
    image: "/img/carbon.png",
  },
  {
    id: "stone",
    x: 560,
    y: 290,
    image: "/img/carbon.png",
  },
  {
    id: "stone-2",
    baseId: "stone",
    x: 620,
    y: 320,
    image: "/img/carbon.png",
  },
  {
    id: "wild_grass",
    x: 690,
    y: 380,
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
  "steel+wood": {
    id: "hoe",
    image: "/img/carbon.png",
  },
  "axe+wild_grass": {
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
