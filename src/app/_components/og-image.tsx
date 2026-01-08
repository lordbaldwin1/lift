import { ImageResponse } from "next/og";

interface OGImageProps {
  title: string;
  description?: string;
}

export function generateOGImage({ title, description }: OGImageProps) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#171717",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #2a2420 0%, #171717 70%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#c9a066",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            lift
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 500,
              color: "#ffffff",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 24,
                color: "#a3a3a3",
                textAlign: "center",
                maxWidth: "700px",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#737373",
            fontSize: 20,
          }}
        >
          liftthings.up.railway.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

