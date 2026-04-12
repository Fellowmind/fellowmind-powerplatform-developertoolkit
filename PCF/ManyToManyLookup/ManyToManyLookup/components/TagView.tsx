import * as React from "react";
import { IconButton, Spinner, SpinnerSize, mergeStyles } from "@fluentui/react";

interface TagItem {
    id: string;
    name: string;
}

interface TagViewProps {
    tags: TagItem[];
    onOpen: () => void | Promise<void>;
    onRemove: (
        e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
        data: { value: string }
    ) => void | Promise<void>;
    onNavigate: (id: string) => void;
    loading: boolean;
    addMoreText: string;
}

const tagChipStyle = mergeStyles({
    display: "inline-flex",
    alignItems: "center",
    background: "#EFF6FC",
    border: "1px solid #2899F5",
    borderRadius: "4px",
    padding: "2px 6px 2px 8px",
    margin: "2px",
    fontSize: "12px",
    color: "#106EBE",
});

const tagLinkStyle = mergeStyles({
    cursor: "pointer",
    selectors: {
        ":hover": { textDecoration: "underline" },
    },
});

export const TagView = ({ tags, onOpen, onRemove, onNavigate, loading, addMoreText }: TagViewProps): React.ReactElement => {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            {tags.map(t => (
                <span key={t.id} className={tagChipStyle}>
                    <span
                        className={tagLinkStyle}
                        role="link"
                        tabIndex={0}
                        onClick={() => onNavigate(t.id)}
                        onKeyDown={(e) => e.key === "Enter" && onNavigate(t.id)}
                    >
                        {t.name}
                    </span>
                    <IconButton
                        iconProps={{ iconName: "Cancel" }}
                        styles={{ root: { width: 20, height: 20, marginLeft: 2 } }}
                        onClick={(e) => onRemove(e as unknown as React.MouseEvent<HTMLButtonElement>, { value: t.id })}
                        aria-label={`Remove ${t.name}`}
                    />
                </span>
            ))}
            <div style={{ flexBasis: "100%", display: "flex", alignItems: "center" }}>
                <IconButton
                    iconProps={{ iconName: "Search" }}
                    title="Add record"
                    ariaLabel="Add record"
                    disabled={loading}
                    onClick={() => onOpen()}
                />
                <span style={{ fontSize: "12px", color: "#106EBE", cursor: "pointer" }} onClick={() => !loading && onOpen()}>
                    {addMoreText}
                </span>
                {loading && <Spinner size={SpinnerSize.small} style={{ marginLeft: 4 }} />}
            </div>
        </div>
    );
};
