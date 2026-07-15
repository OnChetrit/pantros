import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

type TabBarVisibilityContextValue = {
  isTabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue | undefined>(undefined);

export function TabBarVisibilityProvider({children}: PropsWithChildren) {
  const [isTabBarHidden, setTabBarHidden] = useState(false);

  const value = useMemo(
    () => ({
      isTabBarHidden,
      setTabBarHidden,
    }),
    [isTabBarHidden]
  );

  return <TabBarVisibilityContext.Provider value={value}>{children}</TabBarVisibilityContext.Provider>;
}

export function useTabBarVisibility() {
  const value = useContext(TabBarVisibilityContext);

  if (!value) {
    throw new Error('useTabBarVisibility must be used inside TabBarVisibilityProvider');
  }

  return value;
}
