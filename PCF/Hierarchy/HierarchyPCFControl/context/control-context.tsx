import { createContext } from "react";
import { IInputs } from "../generated/ManifestTypes";
import { EntityMetadata, Form } from "../interfaces/entity";

interface IControlContext {
  context: ComponentFramework.Context<IInputs>;
  entityName: string;
  entityId: string;
  forms: Form[];
  activeForm: Form | undefined;
  configuration: any;
  setActiveForm: React.Dispatch<React.SetStateAction<Form | undefined>>;
  appId: string;
}

export const ControlContext = createContext<IControlContext>(undefined!);
