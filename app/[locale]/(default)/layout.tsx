import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";
import { ReactNode } from "react";
import { getLandingPage } from "@/services/page";
import Feedback from "@/components/feedback";
import SignModal from "@/components/sign/modal";
import AuthMigrator from "@/components/auth-migrator";

export default async function DefaultLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let page: Awaited<ReturnType<typeof getLandingPage>> | null = null;
  try {
    page = await getLandingPage(locale);
  } catch (e) {
    console.error("[DefaultLayout] getLandingPage failed:", e);
  }

  return (
    <>
      {page?.header && <Header header={page.header} />}
      <main className="overflow-x-hidden">{children}</main>
      {page?.footer && <Footer footer={page.footer} />}
      <Feedback socialLinks={page?.footer?.social?.items} />
      <SignModal />
      <AuthMigrator />
    </>
  );
}
