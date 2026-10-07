import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fredoka } from "next/font/google";
import "./globals.css";

const cuerpo = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cuerpo",
  display: "swap",
});

const titulos = Fredoka({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-titulos",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Pequeña Gran Mente", template: "%s · Pequeña Gran Mente" },
  description: "Agenda y clientes del consultorio Pequeña Gran Mente",
  applicationName: "Pequeña Gran Mente",
};

export const viewport: Viewport = {
  themeColor: "#fde7ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cuerpo.variable} ${titulos.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
