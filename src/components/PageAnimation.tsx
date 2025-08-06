import { ReactNode, useEffect, useState } from "react";

interface PageAnimationProps {
  children: ReactNode;
  className?: string;
}

export const PageAnimation = ({
  children,
  className = "",
}: PageAnimationProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulacija učitavanja stranice (može biti replaced sa stvarnim učitavanjem)
    // ili uklonite ovaj timeout ako želite da se animacija odmah pokrene
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={className}>
      {isLoaded ? (
        <div className="">
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default PageAnimation; 