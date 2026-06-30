export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h1 className="text-xl font-semibold mb-2">{title}</h1>
      <p className="text-sm text-gray-500">
        Trang này sẽ được triển khai ở Phase 2–4.
      </p>
    </div>
  );
}
