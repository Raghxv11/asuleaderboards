import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass-container p-10 text-center max-w-md w-full">
        <h1 className="text-7xl font-extrabold gradient-text mb-8">404</h1>
        <p className="text-xl text-gray-700 mb-10">
          Oops! This page flexed too hard and disappeared.
        </p>
        <Button asChild className="app-button">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
