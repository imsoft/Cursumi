import Link from "next/link";
import { CourseCard } from "@/components";

const courses = [
  {
    _id: "1",
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/courses/course-profile",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    _id: "2",
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/courses/course-profile",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    _id: "3",
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/courses/course-profile",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    _id: "4",
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/courses/course-profile",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    _id: "5",
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/courses/course-profile",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
  {
    _id: "6",
    name: "Curso HTML 5",
    category: "Coding",
    price: "$499",
    href: "/courses/course-profile",
    imageSrc:
      "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Miniatura%20Cursos%2Fprogramming.jpg?alt=media&token=2ec644f8-c96b-4c71-8aeb-355c5945e73d",
    imageAlt: "Curso de HTML 5",
  },
];

const CoursesPage = () => {
  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Nuestros cursos
            </h2>
            <Link
              href="#"
              className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block"
            >
              Registrate
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
            {courses.map((course) => (
              <CourseCard key={course._id} {...course} />
            ))}
          </div>

          <div className="mt-8 text-sm md:hidden">
            <Link
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Registrate
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesPage;
