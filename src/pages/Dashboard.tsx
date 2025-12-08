import { MessageSquare, Users, Package, Bot } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { 
    messagesCount, 
    newLeadsCount, 
    productsCount, 
    botSettings,
    recentMessages,
    isLoading 
  } = useDashboardData();

  const isBotActive = botSettings?.bot_active ?? false;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="إجمالي الرسائل"
          value={messagesCount ?? 0}
          icon={MessageSquare}
          isLoading={isLoading}
        />
        <KPICard
          title="عملاء جدد"
          value={newLeadsCount ?? 0}
          icon={Users}
          isLoading={isLoading}
          variant="warning"
        />
        <KPICard
          title="المنتجات"
          value={productsCount ?? 0}
          icon={Package}
          isLoading={isLoading}
        />
        <KPICard
          title="حالة البوت"
          value={isBotActive ? "نشط 🟢" : "متوقف 🔴"}
          icon={Bot}
          isLoading={isLoading}
          variant={isBotActive ? "success" : "destructive"}
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityChart />
        <RecentActivity messages={recentMessages || []} isLoading={isLoading} />
      </div>
    </div>
  );
}