"use client"
import { useTheme } from "next-themes";
import { useEffect } from "react";


export default function ThemeController({
  theme,
  children,
}: Readonly<{
  children: React.ReactNode;
  theme: string,
}>) {
  const { setTheme } = useTheme()

  useEffect(() => {
    if (theme === "dark" || theme === "light") setTheme(theme)

  }, [theme])

  return (
    <>
      {children}
    </>
  );
}
