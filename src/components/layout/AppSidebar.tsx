import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings,
  Bot,
  X,
  LogOut,
  Loader2,
  ShoppingCart,
  Megaphone
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "لوحة التحكم" },
  { to: "/inbox", icon: MessageSquare, label: "صندوق الوارد" },
  { to: "/leads", icon: Users, label: "تصنيف العملاء" },
  { to: "/orders", icon: ShoppingCart, label: "إدارة الطلبات" },
  { to: "/bot-brain", icon: Bot, label: "عقل البوت" },
  { to: "/marketing", icon: Megaphone, label: "مركز التسويق" },
  { to: "/settings", icon: Settings, label: "إعدادات البوت" },
];

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop: static, Mobile: fixed slide-in from right */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out",
          // Desktop: static sidebar that takes space in layout
          "lg:static lg:translate-x-0 lg:w-64 lg:shrink-0",
          // Mobile: fixed overlay sidebar
          "fixed top-0 right-0 z-50 h-full w-64",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Pixel Media</h1>
                <p className="text-xs text-sidebar-foreground/70">لوحة التحكم</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                      : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer with User Info */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* User Email */}
            {user && (
              <div className="bg-sidebar-accent/50 rounded-xl p-3">
                <p className="text-xs text-sidebar-foreground/60 mb-1">مسجل الدخول كـ</p>
                <p className="text-sm font-medium truncate" dir="ltr">
                  {user.email}
                </p>
              </div>
            )}
            
            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full justify-center gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
