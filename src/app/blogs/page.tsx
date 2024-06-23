import { BlogCard, MessageComponent } from "@/components";
import { getPostsMeta } from "@/lib/posts";

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
