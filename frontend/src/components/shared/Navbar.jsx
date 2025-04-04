import React from "react";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth";
import ThemeToggle from "../ui/ThemeToggle";
import logo from "../../assets/logo.png"

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <div className="p-4 outline outline-1">
      <div className="flex justify-between w-full md:max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt=""
            srcset=""
            className="w-40 mix-blend-difference "
          />
          <p className="text-2xl">|</p>
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Certification Tracker
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle></ThemeToggle>
          <Button onClick={() => logout()}>Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
