import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ModernFormButtonComponent } from "./Button";

export class ModernFormButton implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _root!: Root;
    private _notifyOutputChanged!: () => void;
    private _context!: ComponentFramework.Context<IInputs>;

    private _lastClickedEvent = "";
    private _isLoading        = false;
    private _resetTimeout: number | null = null;

    /** Empty constructor required by PCF. */
    constructor() { /* intentionally empty */ }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement,
    ): void {
        this._context             = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._root = createRoot(container);
        this._render();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context   = context;
        this._isLoading = false; // framework processed the previous output — clear spinner
        this._render();
    }

    public getOutputs(): IOutputs {
        return { buttonClicked: this._lastClickedEvent };
    }

    public destroy(): void {
        if (this._resetTimeout !== null) {
            clearTimeout(this._resetTimeout);
            this._resetTimeout = null;
        }
        this._root.unmount();
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    private _render(): void {
        this._root.render(
            React.createElement(ModernFormButtonComponent, {
                params:    this._context.parameters,
                isLoading: this._isLoading,
                onFire:    this._handleFire,
            })
        );
    }

    // ── Event firing ──────────────────────────────────────────────────────────

    /**
     * Class field arrow function — stable reference, no need to rebind on each render.
     *
     * Sets the output value, enters loading state, and notifies the framework.
     * A 600 ms reset clears the bound field so that a second click always
     * produces a value change and fires OnChange again.
     */
    private readonly _handleFire = (): void => {
        const eventName = this._context.parameters.eventName?.raw || "buttonClicked";
        this._lastClickedEvent = eventName;
        this._isLoading        = true;
        this._render();
        this._notifyOutputChanged();

        this._resetTimeout = window.setTimeout(() => {
            this._resetTimeout = null;
            this._lastClickedEvent = "";
            this._notifyOutputChanged();
        }, 600);
    };
}
