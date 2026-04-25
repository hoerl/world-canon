'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AddToCrateContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const AddToCrateContext = createContext<AddToCrateContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useAddToCrate() {
  return useContext(AddToCrateContext);
}

export function AddToCrateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AddToCrateContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </AddToCrateContext.Provider>
  );
}
