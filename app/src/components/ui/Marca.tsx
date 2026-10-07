import Image from "next/image";

/** Logotipo: texto + mascota. Las imágenes vienen del trazo original en public/marca. */
export function Marca({ conMascota = true, alto = 56 }: { conMascota?: boolean; alto?: number }) {
  const anchoTexto = Math.round(alto * 2.19);
  const altoMascota = Math.round(alto * 0.95);
  const anchoMascota = Math.round(altoMascota * 1.12);
  return (
    <span className="inline-flex items-center gap-1">
      <Image src="/marca/texto.png" alt="pequeña gran mente" width={anchoTexto} height={alto} priority />
      {conMascota && (
        <Image src="/marca/mascota.png" alt="" width={anchoMascota} height={altoMascota} priority />
      )}
    </span>
  );
}
