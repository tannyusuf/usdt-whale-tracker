export default function TransferSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl ${
            i % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
          } gap-4`}
        >
          <div className="flex flex-col gap-2">
            <div className="h-7 w-48 bg-surface-container-high rounded animate-skeleton" />
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 bg-surface-container-high rounded animate-skeleton" />
              <div className="h-4 w-4 bg-surface-container-high rounded animate-skeleton" />
              <div className="h-4 w-28 bg-surface-container-high rounded animate-skeleton" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-4 w-24 bg-surface-container-high rounded animate-skeleton" />
            <div className="h-3 w-16 bg-surface-container-high rounded animate-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
