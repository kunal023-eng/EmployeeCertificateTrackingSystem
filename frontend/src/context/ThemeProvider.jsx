import { ThemeProvider } from "next-themes";

function ThemeProviderComponent({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}

export default ThemeProviderComponent;
