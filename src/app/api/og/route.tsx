import { ImageResponse } from "next/og";
export async function GET(request: Request) {
  const en = new URL(request.url).searchParams.get("lang") === "en";
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#192c28",
        color: "#edf2e9",
        padding: "65px 75px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 23,
        }}
      >
        <span>ESPOIR MULELA MASTOLO</span>
        <span style={{ color: "#bde486" }}>KINSHASA / RD CONGO</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 70,
          lineHeight: 1.1,
          letterSpacing: "-3px",
        }}
      >
        <span>{en ? "Software engineer." : "Ingénieur informatique."}</span>
        <span style={{ color: "#bde486" }}>
          {en ? "Full-Stack developer." : "Développeur Full-Stack."}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #496154",
          paddingTop: 25,
          fontSize: 22,
        }}
      >
        <span>
          {en
            ? "Understand. Build. Evolve."
            : "Comprendre. Construire. Faire évoluer."}
        </span>
        <span>↳</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
