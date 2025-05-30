import * as React from "react";
import { IInputs } from "./generated/ManifestTypes";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { ReactFlowProvider } from "@xyflow/react";

import { ControlContext } from "./context/control-context";
import { useDataverse } from "./hooks/useDataverse";
import Flow from "./components/flow/flow";
import { memo, useEffect } from "react";
import { testGet } from "./api";

interface IProps {
  context: ComponentFramework.Context<IInputs>;
  entityName: string;
  entityId: string;
  scriptValue: string;
  appId: string;
}

const App = memo(
  ({ context, entityName, entityId, scriptValue, appId }: IProps) => {
    const {
      nodes,
      edges,
      isLoading,
      error,
      forms,
      activeForm,
      configuration,
      setActiveForm,
    } = useDataverse(context, entityName, entityId, scriptValue);

    if (error) {
      return <div style={styles.boundaryContainer}>{error.message}</div>;
    }

    if (isLoading && !error) {
      return (
        <div style={styles.boundaryContainer}>
          <Spinner
            label={context.resources.getString("loading-message")}
            size={SpinnerSize.large}
          />
        </div>
      );
    }

    return (
      <ControlContext.Provider
        value={{
          context,
          entityName,
          entityId,
          forms,
          activeForm,
          configuration,
          setActiveForm,
          appId,
        }}
      >
        <ReactFlowProvider>
          <Flow initialNodes={nodes} initialEdges={edges} />
        </ReactFlowProvider>
      </ControlContext.Provider>
    );
  }
);

App.displayName = "App";
export default App;

const styles: { [key: string]: React.CSSProperties } = {
  boundaryContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
};
