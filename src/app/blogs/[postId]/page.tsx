import { getPostByName, getPostsMeta, getPostsMetaRandom } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogCard } from "@/components";

export const revalidate = 86400; // un dia en segundos

type Props = {
  params: {
    postId: string;
  };
};

export const generateStaticParams = async () => {
  const posts = await getPostsMeta();

  if (!posts) return [];

  return posts.map((post) => ({
    postId: post._id,
  }));
};

export const generateMetadata = async ({ params: { postId } }: Props) => {
  const post = await getPostByName(`${postId}.mdx`);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.requiredMetatags.title,
    description: post.requiredMetatags.description,
    keywords: post.requiredMetatags.keywords,
    url: post.requiredMetatags.url,
    twitter: {
      card: "summary_large_image",
      title: post.requiredMetatags.title,
      description: post.requiredMetatags.description,
      images: {
        url: post.requiredMetatags.image,
        alt: post.requiredMetatags.title,
      },
    },
    openGraph: {
      title: post.requiredMetatags.title,
      description: post.requiredMetatags.description,
      type: "article",
      publishedTime: post.requiredMetatags.date,
      authors: [post.requiredMetatags.author],
      url: post.requiredMetatags.url,
      images: [
        {
          url: post.requiredMetatags.image,
          width: 783,
          height: 783,
          alt: post.requiredMetatags.title,
        },
      ],
    },
  };
};

const BlogPage = async ({ params: { postId } }: Props) => {
  const recommendationsPosts = await getPostsMetaRandom(3);
  const post = await getPostByName(`${postId}.mdx`); // deduped!

  if (!post) notFound();

  if (!recommendationsPosts) notFound();

  const { requiredMetatags, content } = post;

  const tags = requiredMetatags.tags.map((tag, i) => (
    <Link
      key={i}
      className={`inline-flex items-center justify-center gap-x-1 ${
        i === 0 ? "hidden" : ""
      } rounded-full bg-blue-100 px-2 py-2 text-xs font-medium text-blue-700`}
      href={`/tags/${tag}`}
    >
      <svg
        className="h-1.5 w-1.5 fill-blue-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      {tag}
    </Link>
  ));

  return (
    <>
      <div className="mx-auto max-w-7xl items-center px-4 py-5 sm:px-6 sm:py-4 md:justify-start lg:px-8">
        <div className="prose prose-lg prose-slate max-w-screen-lg mx-auto mt-6">
          <article>{content}</article>
        </div>
        <section className="mt-24">
          <h3 className="text-3xl mb-10 font-bold tracking-tight text-blue-500 sm:text-4xl">
            Artículos relacionados:
          </h3>
          <div className="space-y-4 space-x-4 flex flex-wrap items-center justify-center mb-10">
            {tags}
          </div>
        </section>
        <section className="mt-24">
          <h3 className="text-3xl mb-10 font-bold tracking-tight text-blue-500 sm:text-4xl">
            Tambien puedes leer:
          </h3>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-4xl">
              <div className="mt-8 space-y-20 lg:mt-10 lg:space-y-10">
                {recommendationsPosts.map((post) => (
                  <BlogCard key={post.title} post={post} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
