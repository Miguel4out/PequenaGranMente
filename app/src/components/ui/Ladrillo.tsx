import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ColorLadrillo =
  | "crema"
  | "nube"
  | "pastel"
  | "rosa"
  | "chicle"
  | "frambuesa"
  | "tinta";

type Base = {
  color?: ColorLadrillo;
  /** Dibuja los botones superiores de la pieza */
  botones?: boolean | "centro";
  className?: string;
  children: ReactNode;
};

function clases({ color = "crema", botones, className = "" }: Omit<Base, "children">) {
  return [
    "ladrillo",
    `l-${color}`,
    botones ? "con-botones" : "",
    botones === "centro" ? "botones-centro" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Caja estática con forma de ladrillo */
export function Ladrillo({ children, ...rest }: Base) {
  return <div className={clases(rest)}>{children}</div>;
}

type BotonProps = Base & Omit<ComponentProps<"button">, "className" | "children" | "color">;

/** Botón con forma de ladrillo; se hunde al presionar */
export function BotonLadrillo({
  color,
  botones,
  className = "",
  children,
  type = "button",
  ...rest
}: BotonProps) {
  return (
    <button
      type={type}
      className={clases({
        color,
        botones,
        className: `inline-flex items-center justify-center gap-2 font-bold ${className}`,
      })}
      {...rest}
    >
      {children}
    </button>
  );
}

type EnlaceProps = Base & { href: string; ariaCurrent?: "page" };

/** Enlace con forma de ladrillo */
export function EnlaceLadrillo({ href, color, botones, className = "", children, ariaCurrent }: EnlaceProps) {
  return (
    <Link
      href={href}
      aria-current={ariaCurrent}
      className={clases({
        color,
        botones,
        className: `inline-flex items-center justify-center gap-2 font-bold no-underline ${className}`,
      })}
    >
      {children}
    </Link>
  );
}
