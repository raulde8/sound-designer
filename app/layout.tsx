import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { APP_NAME } from "@engine/version";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} - pré-dimensionamento de som`, template: `%s · ${APP_NAME}` },
  description: "Pré-dimensionamento gratuito de sonorização para igrejas, bares, restaurantes, auditórios e casas de eventos.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topo">
          <div className="container">
            <Link href="/" className="marca">
              {APP_NAME}
            </Link>
            <nav>
              <Link href="/termos/">Termos e privacidade</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="rodape">
          <p>Recomendamos por critérios técnicos. Pré-dimensionamento: não substitui projeto nem medição no local.</p>
          <p>
            <Link href="/termos/">Termos e privacidade</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
