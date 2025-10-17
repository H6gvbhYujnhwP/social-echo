import NavBar from '@/components/site/NavBar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}

