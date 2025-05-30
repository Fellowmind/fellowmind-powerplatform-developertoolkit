import * as React from "react";
import { useContext, useMemo, useCallback, useRef, memo } from "react";
import { Attribute, NodeRecord } from "../../../types/node";
import { Text } from "@fluentui/react/lib/Text";
import { IconButton } from "@fluentui/react/lib/Button";
import { PersonaSize } from "@fluentui/react/lib/Persona";
import { Handle, HandleType, Position } from "@xyflow/react";
import { NodeProps } from "@xyflow/react/dist/esm/types";

import { FlowContext } from "../../../context/flow-context";
import NodeExpandButton from "./expand-node";
import { colors, nodeHeight, nodeWidth } from "../../../utils/constants";
import { Badge } from "../../badge/badge";
import LookupField from "../../lookup/lookup";
import { useNavigation } from "../../../hooks/useNavigation";
import { ControlContext } from "../../../context/control-context";

const NodeCard = memo((props: NodeProps<NodeRecord>) => {
  const { id, data } = props;

  console.log("node data: ", data);

  const { context, entityName, entityId, activeForm, appId } =
    useContext(ControlContext);
  const { selectedNode, moveToNode, getChildrenIds, direction } =
    useContext(FlowContext);
  const { openForm } = useNavigation(context);
  const detailRef = useRef<HTMLDivElement>(null);

  const nodeHeight = getNodeCardHeight(
    Object.keys(data.attributes as any).length
  );

  const cardStyle = useMemo(() => {
    return selectedNode?.id === id
      ? { ...styles.card, ...styles.activeCard, height: nodeHeight + "px" }
      : { ...styles.card, height: nodeHeight + "px" };
  }, [selectedNode, id]);

  const hasChildrens = useMemo(() => {
    const childrens = getChildrenIds(id);
    return childrens && childrens.length > 0;
  }, [id, getChildrenIds]);

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      moveToNode(id);
    },
    [id, moveToNode]
  );

  const handleOpenRecord = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      // openForm(entityName, id);
      window.open(
        `${window.origin}/main.aspx?appid=${appId}&pagetype=entityrecord&etn=${data?.entityType}&id=${data.entityId}`,
        "_blank"
      );
    },
    [id]
  );

  const attributes = useMemo(() => {
    // const filteredAttributes =
    //   !data.attributes || data.attributes.length < 0
    //     ? []
    //     : Object.keys(data.attributes).filter(
    //         (key) =>
    //           activeForm?.columns.some((c) => c.logicalName == key) &&
    //           key != "_ownerid_value" &&
    //           key != "statecode"
    //       );
    if (!data.attributes) return;
    return Object.values(data.attributes)
      .map((key: any) => {
        if (key.attributeType === "primaryKey") {
          return <></>;
        }

        return (
          <div key={`${data.entityId}-${key.displayName}`} style={styles.info}>
            <Text style={styles.infoLabel} nowrap block>
              {key.displayName}
            </Text>
            <Text style={styles.infoValue} nowrap block>
              {key.attributeType === "lookup" ? (
                <LookupField item={key} />
              ) : (
                // data.attributes![key].value
                key.value
              )}
            </Text>
          </div>
        );
      })
      .sort((a: any, b: any) => {
        const aIndex = activeForm?.columns.findIndex(
          (c) => c.logicalName === a.key
        );
        const bIndex = activeForm?.columns.findIndex(
          (c) => c.logicalName === b.key
        );
        return (aIndex ?? 0) - (bIndex ?? 0);
      });
  }, [activeForm, data.attributes]);

  const owner = useMemo(() => {
    if (
      data.attributes &&
      Object.keys(data.attributes).includes("_ownerid_value")
    ) {
      return data.attributes!["_ownerid_value"]
        .value as ComponentFramework.LookupValue;
    }

    return undefined;
  }, [data.attributes]);

  const state = useMemo(() => {
    if (data.attributes && Object.keys(data.attributes).includes("statecode")) {
      return data.attributes!["statecode"] as Attribute;
    }

    return undefined;
  }, [data.attributes]);

  const handles: { type: HandleType; position: Position }[] = useMemo(
    () => [
      {
        type: "source",
        position: direction == "TB" ? Position.Bottom : Position.Right,
      },
      {
        type: "target",
        position: direction == "TB" ? Position.Top : Position.Left,
      },
    ],
    [direction]
  );

  return (
    <div style={cardStyle} onClick={handleCardClick}>
      <div style={styles.header}>
        <Badge
          name={data.label}
          etn={entityName}
          id={entityId}
          size={PersonaSize.size48}
          nameStyle={styles.cardBadgeName}
        />
        {state && <span style={styles.statusBadge}>{state.value}</span>}
      </div>
      <div ref={detailRef} style={styles.detailsContainer}>
        {attributes}
        {/* {data.attributes ? (
          Object.values(data.attributes).map((at: any) => (
            <p>
              {at.displayName}: {at.value}
            </p>
          ))
        ) : (
          <></>
        )} */}
      </div>
      <div
        style={{
          ...styles.footerContainer,
          justifyContent: owner ? "space-between" : "flex-end",
        }}
      >
        {owner && (
          <Badge
            name={owner.name}
            etn={owner.entityType}
            id={owner.id}
            size={PersonaSize.size32}
            nameStyle={styles.ownerText}
            isClickable
          />
        )}
        <IconButton
          iconProps={{ iconName: "OpenInNewWindow" }}
          onClick={handleOpenRecord}
        />
      </div>
      {hasChildrens && <NodeExpandButton {...props} />}
      {handles.map((handle) => (
        <Handle
          key={handle.type}
          type={handle.type}
          position={handle.position}
          isConnectable={false}
          style={styles.handle}
          id={handle.position}
        />
      ))}
    </div>
  );
});

NodeCard.displayName = "NodeCard";
export default NodeCard;

const getNodeCardHeight = (amountOfFields: number) => {
  return nodeHeight + amountOfFields * 21.5 - 100;
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    width: nodeWidth - 100,
    minHeight: nodeHeight - 100,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    backgroundColor: "white",
    borderRadius: "0.75rem",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },
  cardBadgeName: {
    fontSize: 22,
    fontWeight: 600,
    maxWidth: 300,
  },
  activeCard: {
    border: `2px solid ${colors.active75}`,
    boxShadow: `0px 10px 15px -3px ${colors.active75}`,
  },
  header: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  icon: {
    width: "3rem",
    height: "3rem",
    borderRadius: "50%",
    border: "2px solid #dcfce7",
    backgroundColor: "#f0fdf4",
  },
  detailsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1.5rem",
    overflowY: "auto",
  },
  info: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    flexWrap: "nowrap",
    alignItems: "center",
    textAlign: "center",
    gap: 16,
  },
  infoLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#6b7280",
    width: 150,
    textAlign: "end",
  },
  infoValue: {
    width: "100%",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    backgroundColor: colors.secondaryBackground,
    padding: 8,
    borderRadius: 8,
    textAlign: "start",
  },
  footerContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    marginTop: "1.5rem",
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 500,
    backgroundColor: colors.badgeColor,
    color: "white",
  },
  handle: {
    border: 0,
    backgroundColor: "transparent",
  },
  ownerText: {
    textDecoration: "underline",
    color: colors.active75,
    fontSize: 16,
  },
};
