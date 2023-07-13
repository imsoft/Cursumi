import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/cursos/perfil-curso",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    id: 2,
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/cursos/perfil-curso",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    id: 3,
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/cursos/perfil-curso",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    id: 4,
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/cursos/perfil-curso",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
];

export const FourthSection = () => {
  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <h2 className="text-5xl font-bold tracking-tight text-gray-900">
              Nuestros cursos
            </h2>
            <Link
              href="/cursos"
              className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block"
            >
              Ver cursos
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <div className="h-56 w-full overflow-hidden rounded-md bg-white group-hover:opacity-75 lg:h-72 xl:h-40">
                  <Image
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    className="h-full w-full object-scale-down object-center"
                    width={1920}
                    height={1080}
                  />
                </div>
                <h3 className="mt-4 text-sm text-gray-700">
                  <Link href={product.href}>
                    <span className="absolute inset-0" />
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {product.price}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-sm md:hidden">
            <Link
              href="/cursos"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ver cursos
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
