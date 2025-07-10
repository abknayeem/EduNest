import Navbar from "@/components/Navbar";
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer";
import InstructorApplicationDialog from "@/components/InstructorApplicationDialog";
import InstructorBioGuard from "@/components/InstructorBioGuard";

function MainLayout() {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <InstructorApplicationDialog />
      <main className='flex-1 mt-16'>
        <InstructorBioGuard>
            <Outlet />
        </InstructorBioGuard>
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
