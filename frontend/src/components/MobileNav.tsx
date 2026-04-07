export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md flex items-center justify-around border-t border-outline-variant/10 px-4 z-50">
      <button className="flex flex-col items-center gap-1 text-primary">
        <span className="material-symbols-outlined">dashboard</span>
        <span className="text-[10px] font-bold">Logs</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined">monitoring</span>
        <span className="text-[10px]">Stats</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined">notifications_active</span>
        <span className="text-[10px]">Alerts</span>
      </button>
    </div>
  );
}
