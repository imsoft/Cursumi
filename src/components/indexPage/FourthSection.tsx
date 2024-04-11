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
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nuestros cursos
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Conoce los cursos que tenemos para ti.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col items-start justify-between"
              >
                <div className="relative w-full">
                  <Image
                    src={product.imageSrc}
                    alt=""
                    className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                    width={300}
                    height={300}
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div className="max-w-xl">
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time dateTime={product.name} className="text-gray-500">
                      {product.name}
                    </time>
                    <Link
                      href={product.name}
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                    >
                      {product.name}
                    </Link>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                      <Link href={product.href}>
                        <span className="absolute inset-0" />
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                      {product.name}
                    </p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <Image
                      src={product.imageSrc}
                      alt=""
                      className="h-10 w-10 rounded-full bg-gray-100"
                      width={40}
                      height={40}
                    />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        <Link href={product.name}>
                          <span className="absolute inset-0" />
                          {product.name}
                        </Link>
                      </p>
                      <p className="text-gray-600">{product.name}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
