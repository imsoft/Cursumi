import { Footer, Header } from "@/components";

export const metadata = {
  title: "Cursumi",
  description: "Cursumi is a platform for learning and teaching.",
};

export default function WebSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
}
