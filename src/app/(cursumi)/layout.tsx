import { Footer, HeaderMenu } from "@/components";

export default function HeaderFooterLayout({
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
