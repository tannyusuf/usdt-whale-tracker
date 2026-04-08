export default function AlertToggleCard() {
  return (
    <div className="p-4 md:p-8 rounded-2xl bg-primary-container text-on-primary-container flex flex-col justify-between">
      <div>
        <span
          className="material-symbols-outlined text-3xl md:text-4xl mb-3 md:mb-4"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          bolt
        </span>
        <h4 className="text-xl md:text-2xl font-black leading-tight">
          Instant Alerts Enabled
        </h4>
      </div>
      <p className="text-xs md:text-sm font-medium opacity-80 mt-3 md:mt-4">
        Connected to Ethereum mainnet via Alchemy WebSocket for real-time transaction visibility.
      </p>
    </div>
  );
}
