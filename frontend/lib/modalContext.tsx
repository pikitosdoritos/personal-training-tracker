"use client";

import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext<{ setModalOpen: (v: boolean) => void; isModalOpen: boolean }>({
  setModalOpen: () => {},
  isModalOpen: false,
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ isModalOpen, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
