export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
            GREEN-API
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Ваш мессенджер
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}