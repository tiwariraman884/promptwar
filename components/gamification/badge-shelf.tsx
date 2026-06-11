export type BadgeShelfItem = {
  slug: string;
  title: string;
  description: string;
  earned: boolean;
};

export function BadgeShelf({ badges }: { badges: BadgeShelfItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {badges.map((badge) => (
        <div
          className={`min-h-32 rounded-card border p-4 transition ${
            badge.earned
              ? "border-primary bg-primary-light text-primary-dark"
              : "border-line bg-slate-100 text-ink/45 grayscale dark:border-white/10 dark:bg-white/5 dark:text-white/35"
          }`}
          key={badge.slug}
        >
          <p className="font-heading text-lg font-extrabold leading-tight">
            {badge.title}
          </p>
          <p className="mt-2 text-sm font-bold leading-5">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
