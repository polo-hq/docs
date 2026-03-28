const { useMemo, useState } = React;

const PRESETS = {
  tokenFirst: { alpha: 0, minChunkTokens: 1, budget: 120 },
  balanced: { alpha: 1, minChunkTokens: 1, budget: 120 },
  relevanceHeavy: { alpha: 2, minChunkTokens: 1, budget: 120 },
};

const BASE_CHUNKS = [
  { id: "A", score: 0.92, tokenCost: 78 },
  { id: "B", score: 0.81, tokenCost: 42 },
  { id: "C", score: 0.67, tokenCost: 18 },
  { id: "D", score: 0.52, tokenCost: 12 },
  { id: "E", score: 0.45, tokenCost: 8 },
  { id: "F", score: 0.33, tokenCost: 6 },
  { id: "G", score: 0.18, tokenCost: 4 },
  { id: "H", score: 0.11, tokenCost: 3 },
];

function computeRows(chunks, alpha, minChunkTokens) {
  return chunks.map((chunk, index) => {
    const effectiveTokenCost = Math.max(minChunkTokens, chunk.tokenCost);
    const efficiency = Math.pow(Math.max(0, chunk.score), alpha) / effectiveTokenCost;
    return {
      ...chunk,
      sourceIndex: index,
      effectiveTokenCost,
      efficiency,
    };
  });
}

function sortRows(rows, alpha) {
  return [...rows].sort((a, b) => {
    const efficiencyDelta = b.efficiency - a.efficiency;
    if (efficiencyDelta !== 0) return efficiencyDelta;

    // Match runtime behavior: alpha=0 means score does not break ties.
    const scoreDelta = alpha > 0 ? b.score - a.score : 0;
    if (scoreDelta !== 0) return scoreDelta;

    const tokenDelta = a.tokenCost - b.tokenCost;
    if (tokenDelta !== 0) return tokenDelta;

    return a.sourceIndex - b.sourceIndex;
  });
}

function pickRows(rows, budget) {
  const kept = [];
  const dropped = [];
  let usedTokens = 0;

  for (const row of rows) {
    if (usedTokens + row.tokenCost <= budget) {
      kept.push({ ...row, status: "kept", reason: "" });
      usedTokens += row.tokenCost;
    } else {
      dropped.push({ ...row, status: "dropped", reason: "over_budget" });
    }
  }

  return { kept, dropped, usedTokens };
}

export function BudgetStrategyPlayground() {
  const [alpha, setAlpha] = useState(1);
  const [budget, setBudget] = useState(120);
  const [minChunkTokens, setMinChunkTokens] = useState(1);
  const [strategyType, setStrategyType] = useState("score_per_token");

  const model = useMemo(() => {
    const rows = computeRows(BASE_CHUNKS, alpha, minChunkTokens);
    const ranked =
      strategyType === "score_per_token"
        ? sortRows(rows, alpha)
        : [...rows].sort((a, b) => b.score - a.score);
    const { kept, dropped, usedTokens } = pickRows(ranked, budget);
    const rankedRows = [...kept, ...dropped].map((row, rankIndex) => ({
      ...row,
      rank: rankIndex + 1,
    }));

    return {
      rankedRows,
      kept,
      dropped,
      usedTokens,
      remainingTokens: Math.max(0, budget - usedTokens),
      usagePct: budget > 0 ? Math.min(100, Math.round((usedTokens / budget) * 100)) : 0,
    };
  }, [alpha, budget, minChunkTokens, strategyType]);

  function applyPreset(preset) {
    setStrategyType("score_per_token");
    setAlpha(preset.alpha);
    setMinChunkTokens(preset.minChunkTokens);
    setBudget(preset.budget);
  }

  return (
    <div>
      <h3>Presets</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button type="button" onClick={() => applyPreset(PRESETS.tokenFirst)}>
          Token-first (alpha=0)
        </button>
        <button type="button" onClick={() => applyPreset(PRESETS.balanced)}>
          Balanced (alpha=1)
        </button>
        <button type="button" onClick={() => applyPreset(PRESETS.relevanceHeavy)}>
          Relevance-heavy (alpha=2)
        </button>
      </div>

      <h3>Controls</h3>
      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label>
          Strategy
          <div>
            <select value={strategyType} onChange={(event) => setStrategyType(event.target.value)}>
              <option value="score_per_token">score_per_token</option>
              <option value="greedy_score">greedy_score</option>
            </select>
          </div>
        </label>

        <label>
          Alpha: {alpha.toFixed(1)}
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={alpha}
            onChange={(event) => setAlpha(Number(event.target.value))}
            disabled={strategyType !== "score_per_token"}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Budget: {budget} tokens
          <input
            type="range"
            min="20"
            max="220"
            step="5"
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          minChunkTokens: {minChunkTokens}
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={minChunkTokens}
            onChange={(event) => setMinChunkTokens(Number(event.target.value))}
            disabled={strategyType !== "score_per_token"}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <h3>Token budget</h3>
      <div style={{ marginBottom: 8 }}>
        Used {model.usedTokens} / {budget} tokens ({model.usagePct}%)
      </div>
      <div
        style={{
          width: "100%",
          height: 14,
          borderRadius: 999,
          background: "var(--color-gray-200)",
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${model.usagePct}%`,
            height: "100%",
            background: "var(--color-primary)",
          }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        Kept: {model.kept.length} chunks | Dropped: {model.dropped.length} chunks | Remaining: {model.remainingTokens} tokens
      </div>

      <h3>Ranked chunks</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>score</th>
            <th>token cost</th>
            <th>efficiency</th>
            <th>rank</th>
            <th>status</th>
            <th>reason</th>
          </tr>
        </thead>
        <tbody>
          {model.rankedRows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.score.toFixed(2)}</td>
              <td>{row.tokenCost}</td>
              <td>{row.efficiency.toFixed(4)}</td>
              <td>{row.rank}</td>
              <td>{row.status}</td>
              <td>{row.reason || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Polo config from current values</h3>
      <pre>
        <code>{`policies: {
  budget: {
    maxTokens: ${budget},
    strategy: {
      type: "${strategyType}",${
        strategyType === "score_per_token"
          ? `
      options: {
        alpha: ${alpha.toFixed(1)},
        minChunkTokens: ${minChunkTokens}
      }`
          : ""
      }
    }
  }
}`}</code>
      </pre>
    </div>
  );
}
