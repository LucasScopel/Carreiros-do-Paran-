import React from "react";

interface InfoCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "container";
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  variant = "default",
  className = "",
  children,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-6 bg-gray-50 rounded-xl shadow-md border border-[#D99C6A] flex flex-col ${
        variant === "container" ? "gap-4" : ""
      } ${className}`}
    >
      {title && (
        <h3 className="text-2xl font-bold text-[#263327] mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-lg text-gray-800 mb-4">{description}</p>
      )}

      {children}
    </div>
  );
};
