import Link from "next/link"

export default function layout ({children}:{children: React.ReactNode}) {
    return(
        <div>
            <nav className="flex justify-end">
                <Link className="p-2" href={"/login"}>Iniciar sesion</Link>
            </nav>
            <main>{children}</main>
        </div>
    )
}