import React, { createContext, useContext, useState, useEffect } from "react";

const FormContext = createContext();

export const FormProvider = ({
  children,
  allSectionIds = [],
  defaultOpenSections = [],
}) => {
  const [expandedIds, setExpandedIds] = useState(defaultOpenSections);

  const toggleAll = () => {
    if (expandedIds.length === allSectionIds.length) {
      setExpandedIds([]);
    } else {
      setExpandedIds(allSectionIds);
    }
  };

  const isAllExpanded = expandedIds.length === allSectionIds.length;

  return (
    <FormContext.Provider
      value={{
        expandedIds,
        setExpandedIds,
        allSectionIds,
        toggleAll,
        isAllExpanded,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
