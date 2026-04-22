'use client';

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Simple Chat</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">A clean and responsive real-time chat room.</p>

        <button
          onClick={() => router.push("/chat")}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          Go to Chat
        </button>
      </section>
    </main>
  );
}
