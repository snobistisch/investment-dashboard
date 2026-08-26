interface EmbeddedDashboardProps {
  /** Path under public/, e.g. 'dashboards/robotics.html'. */
  src: string
  title: string
}

// Hosts a standalone, self-contained HTML dashboard (its own styling + charts)
// in a full-height iframe so it renders exactly as authored, inside the app shell.
export function EmbeddedDashboard({ src, title }: EmbeddedDashboardProps) {
  return (
    <iframe
      src={`${import.meta.env.BASE_URL}${src}`}
      title={title}
      className="h-full w-full border-0"
    />
  )
}
