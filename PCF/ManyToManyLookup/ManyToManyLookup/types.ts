import { IInputs } from "./generated/ManifestTypes";

interface IPage {
    entityId: string;
    entityTypeName: string;
    getClientUrl: () => string;
}

export interface IContextExtended extends ComponentFramework.Context<IInputs> {
    page: IPage;
}
