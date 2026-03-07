import { Button } from "@/components/ui/button";
import { TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-select";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { useAuth } from "hooks/useAuth";
import {
  BarChart3,
  Key,
  LayoutDashboard,
  LogOut,
  Terminal,
  Zap,
} from "lucide-react";
import { NavLink } from "react-router";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/keys", label: "API Keys", icon: Key },
  { to: "/metrics", label: "Metrics", icon: BarChart3 },
  { to: "/playground", label: "Playground", icon: Terminal },
];
const Sidebar = () => {
  const { user, logout } = useAuth();
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-screen w-60 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Open Router
          </span>
        </div>

        <Separator className="bg-sidebar-border" />

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border border-primary/20"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex items-center justify-center size-8 rounded-lg bg-accent text-accent-foreground font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {user?.email}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {user?.credits?.toLocaleString()} credits
            </p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={logout}
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Sign Out</TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
