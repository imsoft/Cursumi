import React from "react";
import { BlogCard, MessageComponent } from "@/components";
import { getPostsMeta } from "@/lib/posts";

// const articles: IBlogCard[] = [
//   {
//     id: 1,
//     blogTitle: "Boost your conversion rate",
//     blogHref: "#",
//     description:
//       "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80",
//     date: "Mar 16, 2020",
//     datetime: "2020-03-16",
//     category: { categoryTitle: "Marketing", categoryHref: "#" },
//     author: {
//       name: "Michael Foster",
//       role: "Co-Founder / CTO",
//       href: "#",
//       authorImageUrl:
//         "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//     },
//   },
//   {
//     id: 2,
//     blogTitle: "Boost your conversion rate",
//     blogHref: "#",
//     description:
//       "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80",
//     date: "Mar 16, 2020",
//     datetime: "2020-03-16",
//     category: { categoryTitle: "Marketing", categoryHref: "#" },
//     author: {
//       name: "Michael Foster",
//       role: "Co-Founder / CTO",
//       href: "#",
//       authorImageUrl:
//         "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//     },
//   },
//   {
//     id: 3,
//     blogTitle: "Boost your conversion rate",
//     blogHref: "#",
//     description:
//       "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
//     imageUrl:
//       "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80",
//     date: "Mar 16, 2020",
//     datetime: "2020-03-16",
//     category: { categoryTitle: "Marketing", categoryHref: "#" },
//     author: {
//       name: "Michael Foster",
//       role: "Co-Founder / CTO",
//       href: "#",
//       authorImageUrl:
//         "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//     },
//   },
// ];

const BlogPage = async () => {
  const posts = await getPostsMeta();

  if (!posts) {
    return (
      <MessageComponent
        topic={"Perdón por las molestias"}
        message={"No hay Posts 😔"}
        comment={"Te recomendamos volver más tarde o recargar el sitio"}
      />
    );
  }

  return (
    <>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nuestro blog
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Desbloquea las habilidades de programación que necesitas para
              triunfar en el mundo digital, gracias a nuestros consejos y trucos
              en los lenguajes de programación más efectivos.
            </p>
            <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
              {posts.map((post) => (
                <BlogCard key={post.title} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
