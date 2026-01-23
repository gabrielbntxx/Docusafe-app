import Image from "next/image";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizes = {
  sm: { icon: 32, text: "text-lg" },
  md: { icon: 48, text: "text-2xl" },
  lg: { icon: 64, text: "text-3xl" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-2xl bg-white shadow-lg overflow-hidden"
        style={{ width: icon, height: icon }}
      >
        <Image
          src="/logo.png"
          alt="DocuSafe"
          width={icon}
          height={icon}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-white ${text}`}>
          DocuSafe
        </span>
      )}
    </div>
  );
}
