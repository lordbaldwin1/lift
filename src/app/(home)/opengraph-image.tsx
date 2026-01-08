import { generateOGImage } from "~/app/_components/og-image";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Track Your Progress",
    description: "Simple workout tracking for lifters who want results",
  });
}

