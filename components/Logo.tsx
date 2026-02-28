import Image from "next/image";
import Link from "next/link";

export const Logo = ({ size = 45, withName }: { size?: number, withName?: boolean }) => {
  return (
    <div className="group/logo flex">
      <Link
        href={"/"}
        className="flex items-center justify-center gap-3 hover:gap-4 transition-all duration-500 ease-out-expo"
      >
        <div className="relative transition-transform duration-500 hover:-rotate-15 hover:scale-105">
          <Image
            src="/openfeed.png"
            alt="OpenFeed Logo"
            width={size}
            height={size}
          />
          <div className="absolute inset-0 rounded-2xl border-2 border-white/30 dark:border-black/20 transition-colors duration-300" />
        </div>
        {withName && <h1 className="pr-2 text-3xl font-extrabold italic bg-linear-to-r from-blue-700 to-green-500 dark:from-yellow-400 dark:to-orange-500 bg-clip-text text-transparent animate-background-shimmer bg-size-[200%_100%]">
          OpenFeed.ink
        </h1>}
      </Link>
    </div>
  );
};
