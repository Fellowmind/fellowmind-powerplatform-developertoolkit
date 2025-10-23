import { useMemo, useState, useEffect } from "react";
import { Node, Edge } from "@xyflow/react/dist/esm/types";
import { IInputs } from "../generated/ManifestTypes";

import {
  Column,
  EntityMetadata,
  Form,
  RelationshipInfo,
  EntityDefinition,
} from "../interfaces/entity";
import { extractColumns, generateColumns } from "../utils/form";
import { transformEntityToNodes } from "../utils/transform";
import { XrmService } from "./service";
import {
  fetchEntities2,
  fetchEntities,
  fetchParentEntity,
  fetchConfig,
} from "../api";
import { extractParentEntityField } from "../utils/extractParentEntityField";
// import { configArr } from "../configurationExample";

export const useDataverse = (
  context: ComponentFramework.Context<IInputs>,
  entityName?: string,
  id?: string,
  scriptValueParam?: string
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(undefined);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [configuration, setConfiguration] = useState<any>(undefined);
  const [activeForm, setActiveForm] = useState<Form | undefined>(undefined);
  const [configArr, setConfigArr] = useState<any>([]);

  const xrmService = useMemo(() => XrmService.getInstance(), [context]);

  useEffect(() => {
    if (!entityName || !id) return;

    (async () => {
      const config = await fetchConfig(scriptValueParam as string);

      if (!config.data.value || !config.data.value[0]) {
        setError({
          message: `No configuration found with scriptValue parameter ${scriptValueParam}`,
        });
        throw new Error(
          `No configuration found with scriptValue parameter ${scriptValueParam}`
        );
      }
      const scriptValueJson = config.data.value[0].fmfi_scriptvalue;
      const scriptValueJson2 = await JSON.parse(scriptValueJson);

      setConfigArr(scriptValueJson2);
    })();

    // fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [configArr]);

  const fetchData = async () => {
    try {
      console.log("fetchData");
      // const attributes = await fetchAttributes();
      // const [metadata, relationship] = await fetchEntityMetadata();
      // const forms = await fetchQuickViewForms(
      //   relationship,
      //   attributes,
      //   metadata
      // );

      // const configurationEntity = await fetchConfigurationEntity(); // Meiän query
      // setConfiguration(configurationEntity);
      // const activeForm =
      //   forms.find((f) => f.label.includes("Hierarchy")) ?? (forms && forms[0]);
      // setForms(forms);
      // setActiveForm(activeForm);

      if (!forms || forms.length < 0)
        throw Error(context.resources.getString("error-selecting-form"));

      const columns = generateColumns(forms);
      const { nodes, edges } = await fetchHierarchy();

      // relationship,
      // metadata,
      // columns

      setNodes(nodes);
      setEdges(edges);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttributes = async (): Promise<EntityDefinition[]> => {
    console.log("fetchAttributes");
    const query = `api/data/v9.1/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=LogicalName,AttributeType,DisplayName&$filter=AttributeOf eq null&$orderby=DisplayName asc`;
    const result = (await xrmService.fetch(query)) as EntityDefinition[];
    return result;
  };

  const fetchQuickViewForms = async (
    relationship: RelationshipInfo,
    attributes: EntityDefinition[],
    metadata: EntityMetadata
  ): Promise<Form[]> => {
    const result = await context.webAPI.retrieveMultipleRecords(
      "systemform",
      `?$filter=objecttypecode eq '${entityName}' and type eq 6`
    );

    if (!result.entities || result.entities.length <= 0)
      throw new Error("No card form found for this entity.");

    const forms: Form[] = result.entities.map((f, index) => {
      return {
        formId: f.formid,
        label: f.name,
        columns: extractColumns(f.formxml, relationship, attributes, metadata),
      };
    });

    return forms;
  };

  const fetchEntityMetadata = async (): Promise<
    [EntityMetadata, RelationshipInfo]
  > => {
    console.log("fetchEntityMetadata");
    const metadata = (await context.utils.getEntityMetadata(
      entityName!
    )) as EntityMetadata;
    const hierarchicalRelationship = Object.values(
      metadata._entityDescriptor.OneToManyRelationships
    ).find((rel) => rel.IsHierarchical);

    if (!hierarchicalRelationship)
      throw new Error(
        context.resources.getString("error-hierarchical-relationship")
      );

    return [metadata, hierarchicalRelationship ?? null];
  };

  const fetchHierarchy = async (): Promise<any> =>
    // relationship: RelationshipInfo,
    // metadata: EntityMetadata,
    // columnList: Column[]
    {
      console.log("fetchHierarchy");
      const configs = configArr;

      let allNodes: any = [];
      let allEdges: any = [];

      // const alreadyFetchedEntities = [];

      const entityMap: { [key: string]: string[] } = {};

      let currentIndex = 0;

      let hierarchyFetched = false;
      for (let i = 0; i < configs.length; i++) {
        const item = configs[i];

        const isSelfReferential = item.entityType === item.parentEntity;

        // Is the first one in the hierarchy
        if (isSelfReferential && !entityMap[item.entityType]) {
          const fetchSelfCondition = `<filter><condition operator="eq" attribute="${item.idField}" value="${id}"/></filter>`;
          const selfQuery = item.entityQuery.replace(
            "[FILTER]",
            fetchSelfCondition
          );

          const resultSelf = await fetchEntities(selfQuery, item.entityPlural);

          const nodesAndEdgesSelf = transformEntityToNodes(
            id!,
            resultSelf.data.value,
            item.fields || [],
            item.idField || "",
            null,
            item.nameField || "",
            item.entityType,
            true
          );

          allNodes = [...allNodes, ...nodesAndEdgesSelf.nodes];
          allEdges = [...allEdges, ...nodesAndEdgesSelf.edges];

          entityMap[item.entityType + i] = [
            resultSelf.data.value[0][item.idField],
          ];

          do {
            const parentAccounts = entityMap[item.entityType + currentIndex];

            if (parentAccounts && parentAccounts.length > 0) {
              const parentEntityQueryField = extractParentEntityField(
                item.parentEntityField || ""
              );
              //item.parentEntityField?.split("_")[1];
              let parentEntitiesCondition = ``;
              entityMap[item.entityType + currentIndex].forEach((pId) => {
                parentEntitiesCondition =
                  parentEntitiesCondition +
                  `<condition attribute="${parentEntityQueryField}" operator="eq" value="${pId}" />`;
              });

              // const fetchSelfCondition = `<filter><condition operator="eq" attribute="${parentEntityQueryField}" value="${
              //   entityMap[`${item.entityType}${currentIndex}`]
              // }"/></filter>`;

              const parentCondition = `<filter type="or">${parentEntitiesCondition}</filter>`;

              const selfQuery = item.entityQuery.replace(
                "[FILTER]",
                parentCondition
              );

              const resultSelf = await fetchEntities(
                selfQuery,
                item.entityPlural
              );

              const nodesAndEdgesSelf = transformEntityToNodes(
                id!,
                resultSelf.data.value,
                item.fields || [],
                item.idField || "",
                item.parentEntityField,
                item.nameField || "",
                item.entityType,
                true
              );

              allNodes = [...allNodes, ...nodesAndEdgesSelf.nodes];
              allEdges = [...allEdges, ...nodesAndEdgesSelf.edges];

              if (resultSelf.data.value) {
                const entityIds = resultSelf.data.value.map(
                  (i: any) => i[item.idField]
                );

                entityMap[`${item.entityType}${currentIndex + 1}`] = entityIds;
              }
            }

            currentIndex += 1;
          } while (entityMap[item.entityType + currentIndex]);
        }

        // if (alreadyFetchedEntities.indexOf(item.entityType) > -1) return;
        if (!item.parentEntity && !isSelfReferential) {
          const parent: any = configArr.find(
            (c: any) => c.parentEntity === null
          );

          const parentCondition = `<filter type="and"><condition  operator="eq" attribute="${parent.idField}" value="${id}"/></filter>`;
          const parentQuery = parent.entityQuery.replace(
            "[FILTER]",
            parentCondition
          );

          const resultParent: any = await fetchEntities(
            parentQuery,
            parent?.entityPlural || ""
          );

          const nodesAndEdgesParent = transformEntityToNodes(
            id!,
            resultParent.data.value,
            parent?.fields || [],
            parent.idField || "",
            null,
            parent?.nameField || "",
            item.entityType,
            true
          );

          allNodes = [...allNodes, ...nodesAndEdgesParent.nodes];
          allEdges = [...allEdges, ...nodesAndEdgesParent.edges];

          entityMap[item.entityType] = resultParent.data.value.map(
            (e: any) => e[item.idField]
          );

          // alreadyFetchedEntities.push(item.entityType);
        } else if (item.parentEntity && !isSelfReferential) {
          const parent = configArr.find(
            (c: any) => c.entityType === item.parentEntity
          ) as any;
          if (!parent) return;
          const children = configArr.filter(
            (c: any) => c.entityType === item.entityType
          );
          const parentEntityQueryField = extractParentEntityField(
            item.parentEntityField || ""
          );

          //item.parentEntityField?.split("_")[1];

          let parentEntitiesCondition = ``;

          if (
            entityMap[item.parentEntity] &&
            entityMap[item.parentEntity].length > 0
          ) {
            entityMap[item.parentEntity].forEach((paId: any) => {
              parentEntitiesCondition =
                parentEntitiesCondition +
                `<condition attribute="${parentEntityQueryField}" operator="eq" value="${paId}" />`;
            });

            const childQuery = item?.entityQuery.replace(
              "[FILTER]",
              `<filter type="or">${parentEntitiesCondition}</filter>`
            ) as string;

            console.log("parentEntityQueryField: ", parentEntityQueryField);

            const resultChildren: any = await fetchEntities(
              childQuery,
              item?.entityPlural || ""
            );

            const nodesAndEdgesChildren = transformEntityToNodes(
              id!,
              resultChildren.data.value,
              item?.fields || [],
              item.idField || "",
              item.parentEntityField,
              item?.nameField || "",
              item.entityType,
              true //i < 2
            );

            entityMap[item.entityType] = resultChildren.data.value.map(
              (e: any) => e[item.idField]
            );
            allNodes = [...allNodes, ...nodesAndEdgesChildren.nodes];
            allEdges = [...allEdges, ...nodesAndEdgesChildren.edges];
          }
        }

        if (i === configs.length - 1) {
          hierarchyFetched = true;
        }
      }

      if (allEdges.length === 0 && hierarchyFetched) {
        setError({
          message: `No hierarchy found with the configuration.`,
        });
      }

      if (allEdges.length > 0) {
        setError(undefined);
      }
      return {
        nodes: allNodes,
        edges: allEdges,
        error: error,
      };
    };

  const fetchConfigurationEntity = async () => {
    console.log("fetchConfigurationEntity");
    const configurationEntity = await context.webAPI.retrieveMultipleRecords(
      "fmfi_developerkitconfiguration",
      `?$filter=fmfi_name eq '${scriptValueParam}'`
    );
    console.log("configurationEntity: ", configurationEntity);

    return configurationEntity?.entities[0] || undefined;
  };

  return {
    isLoading,
    error,
    nodes,
    edges,
    forms,
    activeForm,
    configuration,
    setActiveForm,
  };
};
