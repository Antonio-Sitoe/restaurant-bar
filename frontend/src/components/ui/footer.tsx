import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className={cn("w-full bg-gray-100")}>
      <div className={cn("px-16 py-16 md:py-20", "container mx-auto")}>
        <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16")}>
          <div className={cn("col-span-1")}>
            <Link href="/" className={cn("block mb-2")}>
              <h2
                className={cn(
                  "text-5xl font-extrabold text-purple-800",
                  "transition-colors duration-300",
                )}
              >
                Gifts
              </h2>
            </Link>
            <p className={cn("text-sm font-extrabold text-gray-900")}>
              By Fidli
            </p>
          </div>

          <div className={cn("col-span-1")}>
            <h3 className={cn("text-sm font-bold text-gray-600 mb-4")}>
              Produtos
            </h3>
            <ul className={cn("space-y-2")}>
              <li>
                <Link
                  href="/novidades"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  Novidades
                </Link>
              </li>
              <li>
                <Link
                  href="/em-alta"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  Em Alta
                </Link>
              </li>
              <li>
                <Link
                  href="/marcas"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  Marcas
                </Link>
              </li>
            </ul>
          </div>

          <div className={cn("col-span-1")}>
            <h3 className={cn("text-sm font-bold text-gray-600 mb-4")}>
              Legal
            </h3>
            <ul className={cn("space-y-2")}>
              <li>
                <Link
                  href="/licencas"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  Licenças
                </Link>
              </li>
              <li>
                <Link
                  href="/politicas-reembolso"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  Políticas de Reembolso
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre-nos"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          <div className={cn("col-span-1")}>
            <h3 className={cn("text-sm font-bold text-gray-600 mb-4")}>
              Contactos
            </h3>
            <ul className={cn("space-y-2")}>
              <li>
                <a
                  href="tel:+258840000000"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  +258 84 000 0000
                </a>
              </li>
              <li>
                <a
                  href="mailto:suporte@gifts.co.mz"
                  className={cn(
                    "text-sm text-gray-600",
                    "transition-all duration-300",
                    "hover:text-purple-600 hover:translate-x-1",
                    "relative inline-block",
                    "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600",
                    "after:transition-all after:duration-300",
                    "hover:after:w-full",
                  )}
                >
                  suporte@gifts.co.mz
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={cn("w-full h-4 bg-primary")} />
    </footer>
  );
}
