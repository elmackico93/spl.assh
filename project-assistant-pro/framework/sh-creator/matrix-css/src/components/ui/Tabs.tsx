import * as React from 'react';
import { cn } from '@/utils/cn';

const TabsContext = React.createContext<{
  selectedTab: string;
  setSelectedTab: (id: string) => void;
}>({
  selectedTab: '',
  setSelectedTab: () => {},
});

interface TabsProps {
  defaultTab?: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultTab, children, className }) => {
  const [selectedTab, setSelectedTab] = React.useState<string>(defaultTab || '');

  // Set first tab as default if none provided
  React.useEffect(() => {
    if (!defaultTab && React.Children.toArray(children).length > 0) {
      const firstTab = React.Children.toArray(children)[0] as React.ReactElement;
      if (firstTab && firstTab.props && firstTab.props.id) {
        setSelectedTab(firstTab.props.id);
      }
    }
  }, [defaultTab, children]);

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={cn('', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex border-b border-matrix-border mb-4 overflow-x-auto',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
};

interface TabProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ id, children, className }) => {
  const { selectedTab, setSelectedTab } = React.useContext(TabsContext);
  const isActive = selectedTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      id={`tab-${id}`}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px',
        isActive
          ? 'border-matrix-text-bright text-matrix-text-bright'
          : 'border-transparent text-matrix-text hover:text-matrix-text-bright hover:border-matrix-text-dim',
        className
      )}
      onClick={() => setSelectedTab(id)}
    >
      {children}
    </button>
  );
};

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, children, className }) => {
  const { selectedTab } = React.useContext(TabsContext);
  const isActive = selectedTab === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      id={`tabpanel-${id}`}
      className={cn('focus:outline-none', className)}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

