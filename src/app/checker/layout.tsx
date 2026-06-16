import Link from "next/link"

export default function layout ({children}:{children: React.ReactNode}) {
    return(
        <div>
            <nav className="flex justify-end">
                <Link className="p-2" href={"/login"}>Iniciar sesion</Link>
            </nav>
            <main>{children}</main>
            <footer className="w-full">© Desarrollado por DIEGO POSADA</footer>
        </div>
    )
}