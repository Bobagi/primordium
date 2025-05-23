import React from "react";
import "./App.css";
import Element from "./Element";

function App() {
  return (
    <div className="App">
      <Element nome="Ferro" x={100} y={100} />
      <Element nome="Carbono" x={200} y={150} />
    </div>
  );
}

export default App;
