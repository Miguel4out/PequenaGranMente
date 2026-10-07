import Link from "next/link";

export function Volver({ href, etiqueta = "Volver" }: { href: string; etiqueta?: string }) {
  return (
    <Link href={href} aria-label={etiqueta} className="w-12 h-12 flex items-center justify-center rounded-ladrillo hover:bg-rosa-nube-3">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
    </Link>
  );
}
