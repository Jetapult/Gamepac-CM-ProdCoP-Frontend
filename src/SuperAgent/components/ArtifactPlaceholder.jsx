import React from "react";
import { FileText } from "lucide-react";

const ArtifactPlaceholder = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-[#e0e0e0]">
        <FileText size={120} strokeWidth={1} />
        <p
          className="text-xl font-medium mt-4 text-[#d0d0d0]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Artifact Preview
        </p>
      </div>
    </div>
  );
};

export default ArtifactPlaceholder;
