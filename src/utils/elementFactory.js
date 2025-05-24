import { initialElements } from "../data/elements";

export const randomColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

export function createInitialElements() {
  return initialElements.map((e) => ({ ...e, color: randomColor() }));
}
