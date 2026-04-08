export default function AlertToggleCard() {
  return (
    <div className="p-8 rounded-2xl bg-primary-container text-on-primary-container flex flex-col justify-between">
      <div>
        <span
          className="material-symbols-outlined text-4xl mb-4"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          bolt
        </span>
        <h4 className="text-2xl font-black leading-tight">
          Instant Alerts Enabled
        </h4>
      </div>
      <p className="text-sm font-medium opacity-80 mt-4">
        Connected to Ethereum mainnet via Alchemy WebSocket for real-time transaction visibility.
      </p>
    </div>
  );
}
