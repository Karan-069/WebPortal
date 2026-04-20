import { cn } from "../../lib/utils";
import { FormProvider } from "./FormContext";

const FormPage = ({
  children,
  className,
  allSectionIds = [],
  defaultOpenSections = [],
}) => {
  return (
    <FormProvider
      allSectionIds={allSectionIds}
      defaultOpenSections={defaultOpenSections}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24",
          className,
        )}
      >
        {children}
      </div>
    </FormProvider>
  );
};

export default FormPage;
