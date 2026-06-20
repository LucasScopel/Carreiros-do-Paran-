import React from "react";

interface InfoCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "container";
  className?: string;
  children?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  variant = "default",
  className = "",
  children,
}) => {
  return (
    <div
      className={`p-6 bg-gray-50 rounded-xl shadow-md border border-[#D99C6A] ${
        variant === "container" ? "flex flex-col gap-4 bg-gray-50" : ""
      } ${className}`}
    >
      {title && <h3 className="text-2xl font-bold text-[#263327]">{title}</h3>}
      {description && <p className="text-lg text-gray-800">{description}</p>}

      {children && <div>{children}</div>}
    </div>
  );
};
