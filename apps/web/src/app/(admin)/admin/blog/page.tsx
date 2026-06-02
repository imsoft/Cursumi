import type { Metadata } from "next";
import { AdminBlogList } from "@/components/blog/admin-blog-list";

export const metadata: Metadata = { title: "Blog | Admin" };

export default function AdminBlogPage() {
  return <AdminBlogList />;
}
