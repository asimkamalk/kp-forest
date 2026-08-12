"use client";

import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { PublicVideoCard } from "@/lib/data/site";
import { toEmbedUrl } from "@/lib/validators/media";

type Props = {
  videos: PublicVideoCard[];
};

export function VideosGrid({ videos }: Props) {
  if (videos.length === 0) {
    return (
      <p className="mt-10 text-sm text-moss">
        No videos published yet. Interviews and field clips appear here when
        ready.
      </p>
    );
  }

  return (
    <Stagger className="mt-10 grid gap-8 sm:grid-cols-2" gap={0.1}>
      {videos.map((video) => {
        const embed = toEmbedUrl(video.videoUrl);
        return (
          <StaggerItem key={video.id}>
            <article className="overflow-hidden rounded-[12px] border border-mist bg-white shadow-[var(--shadow-card)]">
              <div className="relative aspect-video w-full bg-bark">
                {embed ? (
                  <iframe
                    src={embed}
                    title={video.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-moss">
                    Video link could not be embedded.
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <h2 className="font-display text-xl text-bark">{video.title}</h2>
                {video.summary && (
                  <p className="text-sm leading-relaxed text-moss">{video.summary}</p>
                )}
              </div>
            </article>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
