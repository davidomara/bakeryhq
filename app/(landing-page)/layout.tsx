import { Footer } from "@/components/footer";
import { LandingPageHeader } from "@/components/landing-page-header";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingPageHeader
        items={[
          { title: "Home", href: "/" },
          { title: "Features", href: "/#features" },
          { title: "Pricing", href: "/#pricing" },
          { title: "FAQ", href: "/#pricing" },
        ]}
      />
      <main className="flex-1">{props.children}</main>
      <Footer
        builtBy="Nord Projects Uganda"
        builtByLink="https://nordprojects.vercel.app/"
        githubLink="https://github.com/davidomara/bakeryhq"
        twitterLink="https://www.instagram.com/nordlink256/"
        linkedinLink="https://linkedin.com"
      />
    </div>
  );
}
