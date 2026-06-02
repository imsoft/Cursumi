import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { BlogPostForm } from "@/components/blog/blog-post-form";

export const metadata: Metadata = { title: "Nuevo artículo | Admin" };

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo artículo" description="Crea un nuevo artículo para el blog de Cursumi." />
      <BlogPostForm mode="create" />
    </div>
  );
}
