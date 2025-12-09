import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "./NotificationCenter";

interface AppHeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function AppHeader({ onMenuClick, title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}