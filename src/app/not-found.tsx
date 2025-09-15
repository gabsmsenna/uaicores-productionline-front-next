import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center text-center px-6 py-12 md:py-16">
      <h1 className="text-7xl md:text-9xl font-extrabold leading-none tracking-tight">404</h1>

      <h2 className="mt-4 text-2xl md:text-3xl font-bold">
        Something is wrong
      </h2>

      <h3 className="mt-2 max-w-2xl text-base md:text-lg font-normal text-gray-600 dark:text-gray-400">
        The page you are looking for was moved, removed, renamed or might never existed!
      </h3>

      <Link
        href="/"
        aria-label="Go back to home page"
        className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
      >
        {/* Ícone de casa (sem texto) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11l9-7 9 7" />
          <path d="M9 22V12h6v10" />
        </svg>
      </Link>
    </main>
  );
}