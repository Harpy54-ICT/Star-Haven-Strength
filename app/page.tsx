import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-shs-dark px-6 py-16 text-center">
      {/* Ambient radial background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(27,67,50,0.55) 0%, rgba(13,31,18,0) 60%), radial-gradient(circle at 50% 80%, rgba(201,168,76,0.10) 0%, rgba(13,31,18,0) 55%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        {/* Logo */}
        <div className="fade-in-up delay-1">
          <Image
            src="/logo.png"
            alt="Star Haven Strength logo"
            width={1238}
            height={1536}
            quality={100}
            priority
            sizes="(max-width: 640px) 300px, (max-width: 768px) 380px, 460px"
            className="logo-glow logo-crisp h-auto w-[300px] sm:w-[380px] md:w-[460px]"
          />
        </div>

        {/* Tagline */}
        <p className="fade-in-up delay-2 mt-8 text-2xl font-bold tracking-wide text-shs-gold sm:text-3xl md:text-4xl">
          Train like a Star, Feel like a Star.
        </p>

        {/* Brand name */}
        <h1 className="fade-in-up delay-3 gold-outline mt-4 text-4xl font-extrabold uppercase tracking-wider text-white sm:text-5xl md:text-6xl">
          Star Haven Strength
        </h1>

        {/* Coming Soon */}
        <div className="fade-in-up delay-4 mt-6">
          <p className="shimmer-text text-3xl font-extrabold uppercase tracking-[0.2em] sm:text-4xl md:text-5xl">
            Coming Soon
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="fade-in-up delay-4 absolute bottom-6 left-0 right-0 z-10 px-6 text-xs text-white/50 sm:text-sm">
        © 2026 Star Haven Strength. All rights reserved.
      </footer>
    </main>
  );
}
