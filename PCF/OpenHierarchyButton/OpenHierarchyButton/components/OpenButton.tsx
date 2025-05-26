import { DefaultButton } from "@fluentui/react";
import React from "react";

interface IOpenButtonProps {
  entityId: string;
  entityTypeName: string;
  scriptName: string;
}

const OpenButton = ({
  scriptName,
  entityId,
  entityTypeName,
}: IOpenButtonProps) => {
  const handleOpenHierarchy = () => {
    const paneInput = {
      pageType: "control",
      controlName: "fmfi_Fellowmind.HierarchyPCFControl",
      data: {
        etn: entityTypeName,
        id: entityId,
        scriptValue: scriptName,
      },
    };

    const navigationOptions = {
      target: 2,
      position: 1,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Xrm.Navigation.navigateTo(paneInput, navigationOptions);
  };
  return <DefaultButton text="Open hierarchy" onClick={handleOpenHierarchy} />;
};

export default OpenButton;
