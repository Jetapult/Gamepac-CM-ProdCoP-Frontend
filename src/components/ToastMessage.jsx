import { useEffect, useState } from "react";
import { X } from "lucide-react";

const ToastMessage = ({ message, setToastMessage }) => {
  const [progress, setProgress] = useState(0);
  const duration = 3000; // 3 seconds

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increment by 2% every ~60ms (100% in 3 seconds)
      });
    }, 60);

    // Close toast after duration
    const timer = setTimeout(() => {
      if (typeof setToastMessage === "function") {
        setToastMessage(false);
      }
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  // Get title and subtitle from message
  const getTitle = () => {
    if (message.title) return message.title;
    // Extract title from message if it contains a colon or newline
    if (message.message?.includes(":")) {
      return message.message.split(":")[0];
    }
    return message.type === "error" ? "Error" : "Success";
  };

  const getSubtitle = () => {
    if (message.subtitle) return message.subtitle;
    // Extract subtitle from message
    if (message.message?.includes(":")) {
      return message.message.split(":").slice(1).join(":").trim();
    }
    return message.message || "";
  };

  const title = getTitle();
  const subtitle = getSubtitle();

  return (
    <div
      id="toast-success"
      className="fixed top-4 right-4 w-full max-w-sm bg-white z-50 rounded-lg shadow-lg border border-[#e7eaee] overflow-hidden"
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-urbanist font-semibold text-sm text-[#141414] mb-1">
              {title}
            </h3>
            {subtitle && (
              <p className="font-urbanist text-sm text-[#6d6d6d]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            className="flex-shrink-0 text-gray-400 hover:text-gray-900 transition-colors p-1"
            aria-label="Close"
            onClick={() => {
              if (typeof setToastMessage === "function") {
                setToastMessage(false);
              }
            }}
          >
            <X size={16} color="#6d6d6d" />
          </button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="h-1 bg-[#e7eaee] relative overflow-hidden">
        <div
          className={`h-full transition-all ease-linear ${
            message.type === "error" ? "bg-red-500" : "bg-[#1F6744]"
          }`}
          style={{
            width: `${progress}%`,
            transition: "width 0.06s linear",
          }}
        />
      </div>
    </div>
  );
};

export default ToastMessage;
