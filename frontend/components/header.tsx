"use client"

import { Sun, Moon, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex items-center justify-between bg-background border-b border-border px-6 py-4">
      <h1 className="text-2xl font-bold text-foreground">Attention Flow Analyzer</h1>
        
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" title="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>
            
        <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme">
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
              ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}