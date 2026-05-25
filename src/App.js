import { useState } from "react";
import QuantityService from "./services/QuantityService";
import "./App.css";

const UNITS = [
  "FEET", "INCHES", "YARDS", "CENTIMETERS",
  "KILOGRAM", "GRAM", "POUND",
  "LITRE", "MILLILITRE", "GALLON",
  "CELSIUS", "FAHRENHEIT"
];

function App() {
  const [value1, setValue1] = useState("");
  const [unit1, setUnit1] = useState("FEET");
  const [value2, setValue2] = useState("");
  const [unit2, setUnit2] = useState("INCHES");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOperation = async (operation) => {
    if (!value1 || !value2) {
      setError("Please enter both values!");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const q1 = { value: parseFloat(value1), unit: unit1 };
    const q2 = { value: parseFloat(value2), unit: unit2 };

    try {
      const response = await QuantityService[operation](q1, q2);
      setResult({ operation, data: response.data });
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    const { operation, data } = result;

    if (operation === "compare") {
      return data ? "✅ Both quantities are EQUAL" : "❌ Quantities are NOT EQUAL";
    } else if (operation === "divide") {
      return `Result: ${data}`;
    } else {
      return `Result: ${data.value} ${data.unit}`;
    }
  };

  return (
    <div className="app">
      <h1>Quantity Measurement App</h1>
      <p className="subtitle">BridgeLabz Training — Sameer Katta</p>

      <div className="card">
        <h2>Enter Quantities</h2>

        <div className="input-row">
          <input
            type="number"
            placeholder="Value 1"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
          />
          <select value={unit1} onChange={(e) => setUnit1(e.target.value)}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="input-row">
          <input
            type="number"
            placeholder="Value 2"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
          />
          <select value={unit2} onChange={(e) => setUnit2(e.target.value)}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="button-row">
          {["add", "compare", "subtract", "divide"].map((op) => (
            <button
              key={op}
              onClick={() => handleOperation(op)}
              disabled={loading}
              className={`btn btn-${op}`}
            >
              {loading ? "..." : op.charAt(0).toUpperCase() + op.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result-card">
          <h2>Result</h2>
          <p>{renderResult()}</p>
        </div>
      )}
    </div>
  );
}

export default App;
