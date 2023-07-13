import { Footer, HeaderMenu } from "@/components";

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeaderMenu />
      {children}
      <Footer />
    </div>
  );
}
