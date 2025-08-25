import * as React from "react";
import * as ReactDOM from "react-dom";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "@xyflow/react/dist/style.css";
import App from "./app";

export class HierarchyPCFControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private container: HTMLDivElement;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.container = container;
    context.mode.trackContainerResize(true);
    this.renderControl(context);
  }

  private renderControl(context: ComponentFramework.Context<IInputs>) {
    const contextInfo = (context.mode as any).contextInfo;
    const params = (context.mode as any).fullPageParam;

    const props = {
      context,
      entityName: contextInfo?.entityTypeName ?? params?.etn,
      entityId: contextInfo?.entityId ?? params?.id,
      scriptValue: params?.scriptValue || "account_contact_hierarchy",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      appId: (context as any).page.appId,
    } as any;

    console.log("props: ", props);

    if (window.location.href.includes("localhost")) {
      props.entityName = "account";
      props.entityId = "3c1773f2-30e5-ee11-904d-000d3a43f82f";
      // props.entityId = "e53ca800-8171-e911-a81d-000d3a3a6ca3";
    }
    console.log("Context: ", context);
    ReactDOM.render(React.createElement(App, props), this.container);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.renderControl(context);
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    ReactDOM.unmountComponentAtNode(this.container);
  }
}
