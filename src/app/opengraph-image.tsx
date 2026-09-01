import { ImageResponse } from "next/og";

export const alt = "Doggy World — El mundo de tu perro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fffaf2",
        color: "#20352d",
        padding: 80,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 760 }}>
        <div style={{ color: "#196b52", fontSize: 34, fontWeight: 700 }}>DOGGY WORLD 🐾</div>
        <div style={{ fontSize: 76, fontWeight: 750, lineHeight: 1.05, marginTop: 28 }}>
          Todo el mundo de tu perro, en un solo lugar.
        </div>
        <div style={{ color: "#66756f", fontSize: 30, marginTop: 28 }}>
          Su identidad. Sus gustos. Sus amigos.
        </div>
      </div>
      <div
        style={{
          width: 260,
          height: 340,
          borderRadius: 54,
          background: "#196b52",
          color: "#ffe3cc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 130,
          transform: "rotate(5deg)",
        }}
      >
        🐶
      </div>
    </div>,
    size,
  );
}
