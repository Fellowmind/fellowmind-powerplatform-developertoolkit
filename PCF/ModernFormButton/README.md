# ModernFormButton

A PCF (Power Apps Component Framework) button control for model-driven apps and Dynamics 365. Designed for the Fellowmind Developer Toolkit — drop it on a form to trigger Power Automate flows, open quick-create dialogs, navigate to records, or run any custom JavaScript logic.

---

## How it works

The button writes the value of its **`eventName`** property to a bound text field when clicked. The field's **OnChange** business rule (or a real-time workflow) reads that value and routes to the correct action.

```
[Button clicked]
  → sets bound field value = eventName
    → field OnChange fires
      → your logic runs
```

The bound field resets to `""` automatically 600 ms after the click, so the same button can be clicked multiple times without losing the OnChange trigger.

While the framework is processing the output, the button shows a spinner in place of the icon, indicating that the action is in progress.

---

## Setup (step by step)

### 1. Add a helper text field to the table

Create a new `Single line of text` column on the table, e.g. `fm_buttonclicked`. It does not need to be shown on the form as a visible field — it only carries the event signal.

### 2. Add the PCF control to the form

- Open the form in the form editor
- Add `fm_buttonclicked` to the form (set it as **hidden** if you don't want it visible)
- Select the field → **Components** → **Add component** → choose **ModernFormButton**

### 3. Configure the input properties

| Property | Type | Description |
|---|---|---|
| `label` | Text | Button label text. Defaults to `"Button"`. |
| `icon` | Enum | Icon to display. Select `None` for no icon. See [Icon reference](#icon-reference) for all options. |
| `tooltipText` | Text | Tooltip shown on hover. Also used as `aria-label`. Falls back to `label` if blank. |
| `buttonStyle` | Enum | Visual variant: `Primary` · `Secondary` · `Danger` · `Success` · `Ghost` |
| `size` | Enum | `Small` · `Medium` · `Large` · `XLarge` |
| `iconPosition` | Enum | `Left` · `Right` · `Top` · `IconOnly` |
| `borderRadius` | Number | Corner radius in px, 0–50. Defaults to `4`. |
| `backgroundColor` | Text | Hex colour override, e.g. `#8764B8`. Overrides `buttonStyle` colour. |
| `textColor` | Text | Hex colour override for label and icon, e.g. `#ffffff`. |
| `isDisabled` | Yes/No | Set to `Yes` to render the button as non-interactive. |
| `confirmationRequired` | Yes/No | Set to `Yes` to show a confirmation popover before firing. |
| `confirmationMessage` | Text | Message shown inside the confirmation popover. Defaults to `"Are you sure you want to proceed?"`. |
| `eventName` | Text | The string written to the bound field on click. Defaults to `"buttonClicked"`. Use a unique value per button on the form. |

### 4. React to the click in OnChange

In the `OnChange` of `fm_buttonclicked`, read `self.value` and branch on `eventName`:

**JavaScript web resource example:**
```javascript
function onButtonClicked(executionContext) {
    const formContext = executionContext.getFormContext();
    const value = formContext.getAttribute("fm_buttonclicked").getValue();

    if (value === "createOpportunity") {
        // open quick create, call flow, etc.
    } else if (value === "sendEmail") {
        // ...
    }
}
```

---

## Multiple buttons on the same form

Use a **single** `fm_buttonclicked` field for all buttons on a form. Give each button a different `eventName` and branch in the shared OnChange handler:

| Button | eventName |
|---|---|
| Create Opportunity | `createOpportunity` |
| Send Email | `sendEmail` |
| Open Related Cases | `openCases` |

---

## Confirmation dialog

When `confirmationRequired = Yes`, clicking the button shows a popover above it with `confirmationMessage` and **Yes** / **Cancel** buttons. The event only fires after **Yes** is pressed.

Additional behaviour:
- The **Yes** button is auto-focused when the dialog opens, so it can be confirmed with Enter.
- Clicking outside the dialog cancels it.
- Clicking the button again while the dialog is open toggles it closed.
- The dialog is rendered at the viewport level (`position: fixed`) so it is never clipped by the form layout.

---

## Icon reference

| Name | Icon |
|---|---|
| `Add` | Plus sign |
| `Save` | Floppy disk |
| `Delete` | Trash can |
| `Send` | Paper plane |
| `Edit` | Pencil |
| `Search` | Magnifying glass |
| `Check` | Checkmark |
| `Close` | × |
| `Arrow` | Right arrow |
| `Play` | Triangle / run |
| `Refresh` | Circular arrows |
| `Settings` | Gear |
| `Star` | Star |
| `Copy` | Duplicate |
| `Download` | Down arrow to tray |
| `Upload` | Up arrow from tray |
| `Link` | Chain links |
| `Mail` | Envelope |
| `Warning` | Triangle exclamation |
| `Info` | Circle i |
| `Open` | External link |
| `Calendar` | Calendar grid |
| `Person` | Silhouette |
| `Phone` | Handset |

Select `None` (or leave unset) to render the button without an icon.

---

## Style variants

| Variant | Use for |
|---|---|
| `Primary` | The main action on the form (blue) |
| `Secondary` | Supporting actions (neutral grey) |
| `Danger` | Destructive or irreversible actions (red) |
| `Success` | Confirmatory or positive actions (green) |
| `Ghost` | Low-emphasis actions, toolbars (transparent with blue text) |

`backgroundColor` and `textColor` override the variant colours entirely. Hover and active states are auto-darkened from the custom colour.

---

## Notes

- The bound field (`fm_buttonclicked`) should be a **Single line of text** column.
- The control ignores `isControlDisabled` from the form context intentionally — it is always interactive. Use the `isDisabled` property to lock the button from configuration.
- The button resets the bound field to `""` 600 ms after firing so that repeated clicks always trigger OnChange, even when `eventName` has not changed.
