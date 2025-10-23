import NavBar from '@/components/site/NavBar';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}

