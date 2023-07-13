import Link from "next/link";
import { SocialMediaBanner } from "./SocialMediaBanner";
import { IFooter } from "@/interfaces";

const footerNavigation: IFooter[] = [
  { name: "Inicio", href: "/" },
  { name: "Cursos", href: "/cursos" },
  { name: "Blog", href: "/blog" },
  { name: "Contacto", href: "/contacto" },
];

export const Footer = () => {
  return (
    <>
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
          <nav
            className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
            aria-label="Footer"
          >
            {footerNavigation.map((item) => (
              <div key={item.name} className="pb-6">
                <Link
                  href={item.href}
                  className="text-base leading-6 text-gray-600 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </nav>
          <SocialMediaBanner
            iconStyle={"text-gray-400 hover:text-primary-500"}
          />
          <p className="mt-10 text-center text-xs leading-5 text-gray-500">
            &copy; 2023 Cursumi. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
};
