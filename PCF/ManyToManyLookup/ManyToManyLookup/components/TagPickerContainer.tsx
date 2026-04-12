import * as React from "react";
import { IInputs } from "../generated/ManifestTypes";
import { IContextExtended } from "../types";
import { TagView } from "./TagView";

interface TagPickerContainerProps {
    context: IContextExtended;
    relationshipName: string;
    targetEntityType: string;
}

interface TagItem {
    id: string;
    name: string;
}

export const TagPickerContainer = ({ context, relationshipName, targetEntityType }: TagPickerContainerProps): React.ReactElement => {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const entitySetNamesRef = React.useRef<{ parent: string; related: string } | null>(null);

    React.useEffect(() => {
        if (!targetEntityType || !context.page.entityTypeName) return;
        entitySetNamesRef.current = null;
        const load = async (): Promise<void> => {
            try {
                const [parentMeta, relatedMeta] = await Promise.all([
                    context.utils.getEntityMetadata(context.page.entityTypeName),
                    context.utils.getEntityMetadata(targetEntityType),
                ]);
                entitySetNamesRef.current = {
                    parent: parentMeta.EntitySetName,
                    related: relatedMeta.EntitySetName,
                };
            } catch (e) {
                console.error("Failed to load entity set names:", e);
            }
        };
        void load();
    }, [targetEntityType, context.page.entityTypeName]);

    const selectedTags = React.useMemo<TagItem[]>(() => {
        const { sortedRecordIds, records } = (context as ComponentFramework.Context<IInputs>).parameters.records;
        return sortedRecordIds.map((id) => ({
            id,
            name: records[id].getValue("name") as string ?? records[id].getValue("fullname") as string ?? id,
        }));
    }, [context.parameters.records.sortedRecordIds]);

    const getSetNames = async (): Promise<{ parent: string; related: string }> => {
        if (entitySetNamesRef.current) return entitySetNamesRef.current;
        const [parentMeta, relatedMeta] = await Promise.all([
            context.utils.getEntityMetadata(context.page.entityTypeName),
            context.utils.getEntityMetadata(targetEntityType),
        ]);
        const names = { parent: parentMeta.EntitySetName, related: relatedMeta.EntitySetName };
        entitySetNamesRef.current = names;
        return names;
    };

    const handleOpen = async (): Promise<void> => {
        if (isUpdating) return;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const viewId: string | undefined = (context.parameters.records as any).getViewId?.();
            const result = await context.utils.lookupObjects({
                allowMultiSelect: true,
                entityTypes: [targetEntityType],
                ...(viewId ? { defaultViewId: viewId, viewIds: [viewId] } : {}),
            });
            if (!result?.length) return;

            // lookupObjects returns GUIDs wrapped in curly braces — strip them for OData URLs
            const normalizeId = (id: string): string => id.replace(/^\{|\}$/g, "");
            const toAdd = result
                .map((r) => ({ ...r, id: normalizeId(r.id) }))
                .filter((r) => !selectedTags.some((t) => t.id === r.id));
            if (!toAdd.length) return;

            setIsUpdating(true);
            const setNames = await getSetNames();
            const baseUrl = context.page.getClientUrl();
            await Promise.all(
                toAdd.map(async (record) => {
                    const response = await fetch(
                        `${baseUrl}/api/data/v9.2/${setNames.parent}(${context.page.entityId})/${relationshipName}/$ref`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "OData-MaxVersion": "4.0",
                                "OData-Version": "4.0",
                            },
                            body: JSON.stringify({ "@odata.id": `${baseUrl}/api/data/v9.2/${setNames.related}(${record.id})` }),
                        }
                    );
                    if (!response.ok) throw new Error(`Associate failed: ${response.status}`);
                })
            );
            context.parameters.records.refresh();
        } catch (e) {
            // User cancellation also lands here — only log real errors
            if (e instanceof Error) console.error("Associate failed:", e);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleNavigate = (id: string): void => {
        void context.navigation.openForm({
            entityName: targetEntityType,
            entityId: id,
        });
    };

    const handleRemove = async (
        _e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
        data: { value: string }
    ): Promise<void> => {
        if (!relationshipName) return;
        setIsUpdating(true);
        try {
            const setNames = await getSetNames();
            const baseUrl = context.page.getClientUrl();
            const response = await fetch(
                `${baseUrl}/api/data/v9.2/${setNames.parent}(${context.page.entityId})/${relationshipName}(${data.value})/$ref`,
                {
                    method: "DELETE",
                    headers: {
                        "OData-MaxVersion": "4.0",
                        "OData-Version": "4.0",
                    },
                }
            );
            if (!response.ok) throw new Error(`Disassociate failed: ${response.status}`);
            context.parameters.records.refresh();
        } catch (e) {
            console.error("Disassociate failed:", e);
        } finally {
            setIsUpdating(false);
        }
    };

    const addMoreText = (context as ComponentFramework.Context<IInputs>).parameters.addMoreText?.raw ?? "Add more";

    return React.createElement(TagView, {
        tags: selectedTags,
        onOpen: handleOpen,
        onRemove: handleRemove,
        onNavigate: handleNavigate,
        loading: isUpdating,
        addMoreText,
    });
};
