import { Sidebar, TopBar } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { LoginPage } from "./components/LoginPage";
import { ListView } from "./components/ListView";
import { DetailView } from "./components/DetailView";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
    setActiveView("detail");
  };

  const handleBackToList = () => {
    setSelectedItemId(null);
    setActiveView("inventory");
  };

  if (!user) {
    return (
      <div className={theme}>
        <LoginPage onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className={theme}>
      <div className="flex min-h-screen bg-background text-foreground overflow-hidden selection:bg-rentr-primary/30 selection:text-white">
        {/* Luxury Background Effects */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rentr-primary/5 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rentr-primary/5 blur-[160px] rounded-full" />
        </div>

        <Sidebar active={activeView} onActiveChange={(id) => {
          setActiveView(id);
          setSelectedItemId(null);
        }} />
        
        <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
          <TopBar theme={theme} onThemeToggle={toggleTheme} onLogout={() => setUser(null)} />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (selectedItemId || "")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1"
            >
              {activeView === "dashboard" ? (
                <Dashboard />
              ) : activeView === "inventory" ? (
                <ListView onItemClick={handleItemClick} />
              ) : activeView === "detail" && selectedItemId ? (
                <DetailView id={selectedItemId} onBack={handleBackToList} />
              ) : (
                <div className="p-24 flex flex-col items-start justify-center min-h-[calc(100vh-96px)] grid-lines">
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="w-24 h-[1px] bg-rentr-primary mb-12 origin-left" 
                  />
                  <h2 className="text-8xl font-brand font-black text-foreground uppercase tracking-tighter leading-none mb-6">
                    {activeView}
                  </h2>
                  <p className="text-xl text-foreground/20 font-serif italic max-w-md">
                    This module is currently being synchronized with the global RENTR network.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
