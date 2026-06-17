import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      {console.log("© Desarrollado por DIEGO POSADA")}
      <body>{children}
        <div className="w-full">© Desarrollado por DIEGO POSADA</div>
      </body>
    </html>
  );
}