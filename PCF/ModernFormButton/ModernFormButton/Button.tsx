import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IInputs } from "./generated/ManifestTypes";
import { ICONS } from "./icons";
import { STYLE_VARIANTS, SIZE_VARIANTS, ButtonStyleVariant, ButtonSizeVariant, IconPositionVariant, darkenHex } from "./variants";

const SPINNER_KEYFRAMES_ID = "mfb-keyframes";

// ─── Public interface ─────────────────────────────────────────────────────────

export interface ButtonComponentProps {
    params: IInputs;
    isLoading: boolean;
    onFire: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export const ModernFormButtonComponent: React.FC<ButtonComponentProps> = ({
    params,
    isLoading,
    onFire,
}) => {
    // ── Read parameters ──────────────────────────────────────────────────────
    const label           = params.label?.raw              || "Button";
    const iconName        = (params.icon?.raw && params.icon.raw !== "None") ? params.icon.raw : "";
    const styleName       = (params.buttonStyle?.raw       || "Primary")  as ButtonStyleVariant;
    const sizeName        = (params.size?.raw              || "Medium")   as ButtonSizeVariant;
    const iconPos         = (params.iconPosition?.raw      || "Left")     as IconPositionVariant;
    const borderRadius    = params.borderRadius?.raw       ?? null;
    const customBg        = params.backgroundColor?.raw    || null;
    const customColor     = params.textColor?.raw          || null;
    const isDisabled      = params.isDisabled?.raw         ?? false;
    const tooltip         = params.tooltipText?.raw        || "";
    const confirmRequired = params.confirmationRequired?.raw ?? false;
    const confirmMessage  = params.confirmationMessage?.raw  || "Are you sure you want to proceed?";
    const confirmYesText  = params.confirmationYesText?.raw  || "Yes";
    const confirmNoText   = params.confirmationNoText?.raw   || "No";

    const sv = STYLE_VARIANTS[styleName] ?? STYLE_VARIANTS.Primary;
    const sz = SIZE_VARIANTS[sizeName]   ?? SIZE_VARIANTS.Medium;

    const effectiveBg    = customBg    || sv.bg;
    const effectiveColor = customColor || sv.color;
    const hoverBg        = customBg    ? darkenHex(customBg, 10) : sv.hoverBg;
    const activeBg       = customBg    ? darkenHex(customBg, 20) : sv.activeBg;
    const radiusPx       = borderRadius !== null
        ? `${Math.min(Math.max(borderRadius, 0), 50)}px`
        : "4px";

    const iconSvg   = ICONS[iconName] ?? null;
    const showIcon  = !!iconSvg;
    const showLabel = iconPos !== "IconOnly";

    // ── Interaction state ────────────────────────────────────────────────────
    const [isHovered,  setIsHovered]  = useState(false);
    const [isPressed,  setIsPressed]  = useState(false);
    const [isFocused,  setIsFocused]  = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const btnRef = useRef<HTMLButtonElement>(null);

    // Reset hover/press/dialog when disabled changes
    useEffect(() => {
        if (isDisabled) {
            setIsHovered(false);
            setIsPressed(false);
            setDialogOpen(false);
        }
    }, [isDisabled]);

    // ── Inject spinner keyframes once per document ───────────────────────────
    useEffect(() => {
        if (document.getElementById(SPINNER_KEYFRAMES_ID)) return;
        const style = document.createElement("style");
        style.id = SPINNER_KEYFRAMES_ID;
        style.textContent = "@keyframes mfb-spin { to { transform: rotate(360deg) } }";
        (document.head ?? document.body).appendChild(style);
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirmRequired) {
            setDialogOpen(prev => !prev);
        } else {
            onFire();
        }
    }, [confirmRequired, onFire]);

    const handleConfirm = useCallback(() => {
        setDialogOpen(false);
        onFire();
    }, [onFire]);

    const handleCancel = useCallback(() => setDialogOpen(false), []);

    // ── Derived button styles ────────────────────────────────────────────────
    const currentBg     = isPressed ? activeBg : isHovered ? hoverBg : effectiveBg;
    const currentShadow = isHovered && !isPressed
        ? "0 2px 10px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.09)"
        : "none";
    const currentTransform = isHovered && !isPressed ? "translateY(-1px)" : "none";

    const buttonStyle: React.CSSProperties = {
        display:         "inline-flex",
        alignItems:      "center",
        justifyContent:  "center",
        flexDirection:   iconPos === "Top" ? "column" : "row",
        gap:             sz.gap,
        padding:         iconPos === "IconOnly" ? sz.iconOnlyPadding : sz.padding,
        minHeight:       sz.minHeight,
        fontSize:        sz.fontSize,
        fontWeight:      sz.fontWeight as React.CSSProperties["fontWeight"],
        lineHeight:      "1.25",
        fontFamily:      '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
        letterSpacing:   "0.01em",
        whiteSpace:      "nowrap",
        userSelect:      "none",
        outline:         isFocused ? `3px solid ${sv.focusRing}` : "none",
        outlineOffset:   isFocused ? "2px" : undefined,
        boxSizing:       "border-box",
        borderStyle:     "solid",
        borderWidth:     "1px",
        borderColor:     sv.border,
        borderRadius:    radiusPx,
        backgroundColor: currentBg,
        color:           effectiveColor,
        cursor:          isDisabled ? "not-allowed" : "pointer",
        opacity:         isDisabled ? 0.4 : 1,
        pointerEvents:   isDisabled ? "none" : "auto",
        transition:      "background-color 80ms ease, transform 60ms ease, box-shadow 80ms ease",
        boxShadow:       currentShadow,
        transform:       currentTransform,
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-label={tooltip || label}
                title={tooltip || undefined}
                disabled={isDisabled}
                aria-disabled={isDisabled || undefined}
                style={buttonStyle}
                onClick={handleClick}
                onMouseEnter={() => { if (!isDisabled) setIsHovered(true); }}
                onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
                onMouseDown={() => { if (!isDisabled) setIsPressed(true); }}
                onMouseUp={() => setIsPressed(false)}
                onFocus={() => { if (!isDisabled) setIsFocused(true); }}
                onBlur={() => setIsFocused(false)}
            >
                {isLoading ? (
                    <>
                        <SpinnerIcon size={sz.iconSize} />
                        {showLabel && <span>{label}</span>}
                    </>
                ) : (
                    <>
                        {showIcon && iconPos !== "Right" && <SvgIcon svg={iconSvg!} size={sz.iconSize} />}
                        {showLabel && <span>{label}</span>}
                        {showIcon && iconPos === "Right" && <SvgIcon svg={iconSvg!} size={sz.iconSize} />}
                    </>
                )}
            </button>

            {dialogOpen && btnRef.current && createPortal(
                <ConfirmationDialog
                    anchor={btnRef.current}
                    message={confirmMessage}
                    yesLabel={confirmYesText}
                    cancelLabel={confirmNoText}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />,
                document.body
            )}
        </>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SvgIcon: React.FC<{ svg: string; size: string }> = ({ svg, size }) => (
    <span
        aria-hidden="true"
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: svg }}
    />
);

const SpinnerIcon: React.FC<{ size: string }> = ({ size }) => (
    <span style={{
        display:        "inline-block",
        width:          size,
        height:         size,
        border:         "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "currentColor",
        borderRadius:   "50%",
        animation:      "mfb-spin 0.65s linear infinite",
        flexShrink:     0,
    }} />
);

// ─── Confirmation dialog ──────────────────────────────────────────────────────

interface ConfirmationDialogProps {
    anchor: HTMLButtonElement;
    message: string;
    yesLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    anchor, message, yesLabel, cancelLabel, onConfirm, onCancel,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const yesBtnRef = useRef<HTMLButtonElement>(null);
    const rect      = anchor.getBoundingClientRect();

    // Auto-focus the Yes button on open
    useEffect(() => {
        yesBtnRef.current?.focus();
    }, []);

    // Dismiss on outside click — delayed by one tick so the opening click doesn't close it immediately
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (dialogRef.current && !dialogRef.current.contains(target) && !anchor.contains(target)) {
                onCancel();
            }
        };
        const timer = window.setTimeout(() => document.addEventListener("click", handler), 0);
        return () => {
            window.clearTimeout(timer);
            document.removeEventListener("click", handler);
        };
    }, [anchor, onCancel]);

    return (
        <div
            ref={dialogRef}
            style={{
                position:     "fixed",
                left:         `${rect.left + rect.width / 2}px`,
                top:          `${rect.top - 12}px`,
                transform:    "translate(-50%, -100%)",
                background:   "#ffffff",
                border:       "1px solid #d2d0ce",
                borderRadius: "8px",
                boxShadow:    "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.10)",
                padding:      "16px 18px 14px",
                minWidth:     "220px",
                maxWidth:     "320px",
                zIndex:       2147483647,
                boxSizing:    "border-box",
                fontFamily:   '"Segoe UI", -apple-system, sans-serif',
            }}
        >
            {/* Downward arrow pointing at button */}
            <div style={{
                position:    "absolute",
                bottom:      "-7px",
                left:        "50%",
                transform:   "translateX(-50%)",
                width:       0,
                height:      0,
                borderLeft:  "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop:   "7px solid #ffffff",
            }} />

            <p style={{ fontSize: "13px", color: "#323130", lineHeight: "1.5", margin: "0 0 14px 0" }}>
                {message}
            </p>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <DialogActionButton label={cancelLabel} primary={false} onClick={onCancel} />
                <DialogActionButton ref={yesBtnRef}    label={yesLabel}    primary={true}  onClick={onConfirm} />
            </div>
        </div>
    );
};

// ─── Dialog action button ─────────────────────────────────────────────────────

interface DialogActionButtonProps {
    label: string;
    primary: boolean;
    onClick: () => void;
}

const DialogActionButton = React.forwardRef<HTMLButtonElement, DialogActionButtonProps>(
    ({ label, primary, onClick }, ref) => {
        const [isHovered, setIsHovered] = useState(false);
        const normalBg = primary ? "#0078D4" : "#f3f2f1";
        const hoverBg  = primary ? "#106EBE" : "#edebe9";

        return (
            <button
                ref={ref}
                type="button"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    padding:         "5px 16px",
                    fontSize:        "13px",
                    fontWeight:      600,
                    lineHeight:      "1.4",
                    borderRadius:    "4px",
                    cursor:          "pointer",
                    fontFamily:      '"Segoe UI", -apple-system, sans-serif',
                    backgroundColor: isHovered ? hoverBg : normalBg,
                    color:           primary ? "#ffffff" : "#323130",
                    border:          primary ? "1px solid transparent" : "1px solid #8a8886",
                    outline:         "none",
                }}
            >
                {label}
            </button>
        );
    }
);
DialogActionButton.displayName = "DialogActionButton";
