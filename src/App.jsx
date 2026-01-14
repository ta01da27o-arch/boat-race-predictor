import { useState } from "react";
import StadiumGrid from "./components/StadiumGrid";
import Predictor from "./components/Predictor";

export default function App() {
  const [stadium, setStadium] = useState(null);

  return (
    <div style={{ padding: 12, fontFamily: "sans-serif" }}>
      {!stadium ? (
        <StadiumGrid onSelect={setStadium} />
      ) : (
        <Predictor stadium={stadium} onBack={() => setStadium(null)} />
      )}
    </div>
  );
}