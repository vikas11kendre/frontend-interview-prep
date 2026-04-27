import Link from "next/link";

const problems = [
  {
    slug: "smart-product-search",
    title: "Smart Product Search",
    description: "Debounced search with suggestions",
    difficulty: "Medium",
  },
  {
    slug: "csv-file-analyser",
    title: "csv-file-analyser using web workers",
    description: "Web Workers",
    difficulty: "Medium",
  },
];

export default function MachineCodingPage() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>
        Machine Coding Problems
      </h1>

      <div style={{ display: "grid", gap: "16px" }}>
        {problems.map((problem) => (
          <Link
            key={problem.slug}
            href={`/machine-coding/${problem.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              <h2 style={{ margin: "0 0 8px 0" }}>
                {problem.title}
              </h2>

              <p style={{ margin: "0 0 8px 0", color: "#555" }}>
                {problem.description}
              </p>

              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background:
                    problem.difficulty === "Easy"
                      ? "#e0f7e9"
                      : problem.difficulty === "Medium"
                      ? "#fff4e5"
                      : "#fdecea",
                }}
              >
                {problem.difficulty}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}