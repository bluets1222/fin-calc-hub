import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "14px",
          border: "3px solid #d4af37",
          color: "#ffffff",
          fontSize: "30px",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontFamily: "sans-serif",
        }}
      >
        BF
      </div>
    ),
    {
      ...size,
    }
  );
}
