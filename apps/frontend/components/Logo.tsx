import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  theme?: "light" | "dark";
  className?: string;
  href?: string;
}

export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Drawscape Logo"
      width={size}
      height={size}
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 select-none object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

export function Logo({
  size = "md",
  showText = true,
  theme = "light",
  className = "",
  href = "/",
}: LogoProps) {
  const iconSizes = {
    sm: 28,
    md: 34,
    lg: 42,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const textColor = theme === "dark" ? "text-white" : "text-[#0d253d]";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      <LogoIcon size={iconSizes[size]} />
      {showText && (
        <span
          className={`font-semibold tracking-tight ${textSizes[size]} ${textColor} transition-colors`}
        >
          Drawscape
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
