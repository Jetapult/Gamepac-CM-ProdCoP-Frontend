import React from "react";
import { AppSidebar } from "./components/AppSidebar";

export default function GameDesignDocumentLayout({ children }) {
  return (
    <div className="bg-background min-h-screen">
      <AppSidebar />
      
      <main className="ml-64 min-h-screen">
        {children}
      </main>
      
      <div id="toast-container" className="fixed top-4 right-4 z-50"></div>
    </div>
  );
}
