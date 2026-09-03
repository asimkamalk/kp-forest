import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/data/site";
import { resolveSiteIconUrl } from "@/lib/site-icon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const settings = await getSiteSettings();
  const src = resolveSiteIconUrl(settings);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#10251B",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            width={180}
            height={180}
            style={{ width: 180, height: 180, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              color: "#F1F3EC",
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "sans-serif",
            }}
          >
            KP
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
