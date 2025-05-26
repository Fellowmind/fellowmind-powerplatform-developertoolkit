import * as React from "react";
import { memo, useContext } from "react";
import { Link } from "@fluentui/react/lib/Link";

import { ControlContext } from "../../context/control-context";
import { useNavigation } from "../../hooks/useNavigation";

interface IProps {
  item: any;
}

const LookupField = memo(({ item }: IProps) => {
  const { context, appId } = useContext(ControlContext);
  const { openForm } = useNavigation(context);

  const onLookupClicked = (value: any) => {
    window.open(
      `${window.origin}/main.aspx?appid=${appId}&pagetype=entityrecord&etn=${item?.entityType}&id=${item.id}`,
      "_blank"
    );
  };

  return (
    <Link
      style={{ color: "rgb(17, 94, 163)", borderRadius: 4, padding: 6 }}
      onClick={() => onLookupClicked(item)}
    >
      {item.value}
    </Link>
  );
});

LookupField.displayName = "LookupField";
export default LookupField;
