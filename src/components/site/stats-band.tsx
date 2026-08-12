import { getStatCounters } from "@/lib/data/site";
import { Counter } from "@/components/motion/reveal";

export async function StatsBand() {
  const counters = await getStatCounters();
  if (counters.length === 0) return null;

  return (
    <section id="stats-band" aria-label="Key figures" className="bg-bark">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 md:grid-cols-4">
        {counters.map((stat, i) => (
          <div
            key={stat.id}
            className={`px-6 py-10 md:py-12 ${
              i % 2 === 1 ? "border-l border-deodar" : ""
            } ${i >= 2 ? "border-t border-deodar md:border-t-0" : ""} ${
              i > 0 ? "md:border-l md:border-deodar" : ""
            }`}
          >
            <p className="text-[32px] leading-none text-paper">
              <Counter
                value={stat.value}
                prefix={stat.prefix ?? ""}
                suffix={stat.suffix ?? ""}
                className="text-[32px] text-paper"
              />
            </p>
            <p className="mt-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-moss">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
