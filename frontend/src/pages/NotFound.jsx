import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/Auth";
import React from "react";
import { Link } from "react-router";

const NotFound = () => {
  const { user } = useAuth();
  return (
    <div className="w-full mt-20 flex flex-col items-center justify-center gap-8">
      <div className="text-4xl font-bold">404 Not found</div>
      <Link to={`/${user?.role?.roleName.toLowerCase()}/dashboard`}>
        <Button>Go to dashboad</Button>
      </Link>
    </div>
  );
};

export default NotFound;
