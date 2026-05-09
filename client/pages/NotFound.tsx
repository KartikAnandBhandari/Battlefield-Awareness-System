import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home, MessageSquare } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="w-16 h-16 text-accent" />
        </div>
        <h1 className="text-5xl font-bold mb-2 text-foreground">404</h1>
        <p className="text-2xl font-semibold text-foreground mb-4">Page Not Found</p>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for doesn't exist yet. This could be a placeholder for a future feature.
        </p>

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">Current Path:</span>
          </p>
          <code className="font-mono text-xs text-primary bg-background/50 p-3 rounded block overflow-auto">
            {location.pathname}
          </code>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 border border-border text-foreground rounded-lg hover:bg-card/50 transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Want this page to exist? Continue prompting the AI to build more features!
        </p>
      </div>
    </div>
  );
};

export default NotFound;
