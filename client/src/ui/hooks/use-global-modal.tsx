import * as React from "react";

type ModalRenderer = React.ReactNode | null;

type GlobalModalContextValue = {
  openModal: (renderer: ModalRenderer) => void;
  closeModal: () => void;
};

const GlobalModalContext = React.createContext<GlobalModalContextValue | null>(null);

export function GlobalModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = React.useState<ModalRenderer>(null);

  const value = React.useMemo<GlobalModalContextValue>(
    () => ({
      openModal: (renderer) => setModal(renderer),
      closeModal: () => setModal(null),
    }),
    []
  );

  return (
    <GlobalModalContext.Provider value={value}>
      {children}
      {modal}
    </GlobalModalContext.Provider>
  );
}

export function useGlobalModal() {
  const context = React.useContext(GlobalModalContext);

  if (!context) {
    throw new Error("useGlobalModal must be used within GlobalModalProvider");
  }

  return context;
}
