import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NeutralBackground from "@/components/background/NeutralBackground";

const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", window.location.pathname);
  }, []);

  const popularLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/goals", label: "Goals", icon: Compass },
    { to: "/transactions", label: "Transactions", icon: ArrowLeft },
    { to: "/help", label: "Help Center", icon: Search },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to help page with search query
      navigate(`/help?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NeutralBackground />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Header */}
          <div className="space-y-4">
            <h1 className="text-9xl font-display font-bold text-foreground/20">
              404
            </h1>
            <h2 className="text-3xl font-display font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
              Let's help you find what you need.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help, features, or pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-base"
              />
            </div>
          </form>

          {/* Popular Links */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Popular Pages
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {popularLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link to="/welcome">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground pt-8">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
