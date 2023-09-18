import { ICalloutContentStyles, ISearchBoxStyles, IStackItemStyles, IStackStyles, IStackTokens, ITextFieldStyles } from "@fluentui/react";

export const asyncSearchBoxStyles: Partial<ITextFieldStyles> = { root: { width: "15.5vw" }, fieldGroup: { border: "none" }};
 
export const calloutStyles: Partial<ICalloutContentStyles> = { root: { width: "calc(15.5vw + 0.5rem)" } };

export const stackStyles: Partial<IStackStyles> = { root: { maxHeight: "30vh", overflowY: "auto", overflowX: "hidden" } };

export const stackItemStyles: Partial<IStackItemStyles> = { root: { borderBottom: "1px solid #909090", padding: "1rem", display: "flex", flexDirection: "column", cursor: "pointer", width: "calc(100% - 1rem)", "&:hover": { background: "#E2E2E2" } } };

export const configureStackTokens: IStackTokens = { childrenGap: "0.5rem" };

export const container = { maxWidth: "15.5vw", display: "flex", alignItems: "center", padding: "0 0.5rem"}