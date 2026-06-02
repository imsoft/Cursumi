import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { BlogPostForm } from "@/components/blog/blog-post-form";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Editar artículo | Admin" };

export default async function EditBlogPostPage({ params }: Params) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      tags: true,
      published: true,
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Editar artículo" description={post.title} />
      <BlogPostForm
        mode="edit"
        postId={post.id}
        initialValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? "",
          tags: post.tags,
          published: post.published,
        }}
      />
    </div>
  );
}
