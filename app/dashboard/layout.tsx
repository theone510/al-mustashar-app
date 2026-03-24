import DashboardSidebar from './components/DashboardSidebar'

export const metadata = {
  title: 'المستشار | لوحة تحكم المحامي',
  description: 'إدارة الموكلين والملفات الخاصة بالمحامين',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div dir="rtl" className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden relative">

      {/* Background Ambient Glows */}
      <div className="absolute top-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-amber-600/[0.07] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[40%] h-[40%] rounded-full bg-indigo-600/[0.05] blur-[150px] pointer-events-none" />

      {/* Dashboard Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full h-full relative z-0 overflow-y-auto">
        <div className="p-5 md:p-8 lg:p-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}
