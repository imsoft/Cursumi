import Link from "next/link";
import Image from "next/image";

interface CourseCard {
  _id: string;
  name: string;
  category: string;
  price: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

interface Props extends CourseCard {}

export const CourseCard = ({
  _id,
  name,
  category,
  price,
  href,
  imageSrc,
  imageAlt,
}: Props) => {
  return (
    <>
      <div key={_id} className="group relative">
        <div className="h-56 w-full overflow-hidden rounded-md bg-white group-hover:opacity-75 lg:h-72 xl:h-40">
          <Image
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-scale-down object-center"
            width={1920}
            height={1080}
          />
        </div>
        <h3 className="mt-4 text-sm text-gray-700">
          <Link href={href}>
            <span className="absolute inset-0" />
            {name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500">{category}</p>
        <p className="mt-1 mb-10 text-sm font-medium text-gray-900">{price}</p>
      </div>
    </>
  );
};
