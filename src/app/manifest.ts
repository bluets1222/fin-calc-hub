import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beesvia Fin | 부동산·세금·금융 통합 계산기",
    short_name: "Beesvia Fin",
    description:
      "부동산 취득세, 중개보수(복비), 주담대·신용대출 DSR, 증여세 간편 모의 계산기",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    lang: "ko",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
