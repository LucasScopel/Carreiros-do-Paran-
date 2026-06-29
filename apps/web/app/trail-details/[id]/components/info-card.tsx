import React from "react";

interface InfoCardProps {
  title?: string;
  description?: string;
  variant?: "default" | "container";
  className?: string;
  bgColor?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  variant = "default",
  className = "",
  bgColor = "bg-gray-50",
  children,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl shadow-md border border-[#D99C6A] flex flex-col ${
        variant === "container" ? "gap-4" : ""
      } ${bgColor} ${className}`}
    >
      {title && (
        <h3 className="text-2xl font-bold text-[#263327] mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-lg text-gray-800 mb-4 whitespace-pre-line">
          {description}
        </p>
      )}

      {children}
    </div>
  );
};
