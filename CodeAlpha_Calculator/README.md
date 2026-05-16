# Calculator

A vanilla JS calculator with three themes and full keyboard support.

🔗 **Live demo:** [calculator-4gtcctv48-maxigucci.vercel.app](https://calculator-4gtcctv48-maxigucci.vercel.app)

---

## Setup

No build step required. Open `index.html` directly in a browser, or visit the live demo above.

**File structure**

```
task-2-calculator/
├── index.html
├── script.js
└── style.css
```

---

## Usage

### Basic arithmetic
Enter numbers and operators using the buttons or your keyboard. The small display above the main number shows a live preview of the result as you type the second operand.

### Buttons

| Button | Action |
|--------|--------|
| `AC` | Clear everything — resets to 0 |
| `C` | Same as AC (label switches to C once there is input) |
| `+/−` | Toggle the sign of the current number |
| `%` | Convert the current number to a percentage (divides by 100) |
| `DEL` | Delete the last character; cancels a pending operator if no second operand has been entered yet |
| `÷ × − +` | Set the operator; if both operands are already present, evaluates first then chains |
| `=` | Evaluate and show the result |

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `0` – `9` | Digit input |
| `.` or `,` | Decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` or `x` | Multiplication |
| `/` | Division |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete last character |
| `Escape` or `Delete` | Clear all |
| `%` | Percent |

Pressing a keyboard key flashes the corresponding on-screen button.

### Themes
Three themes are available via the pill switcher at the top: **Dark**, **Light**, and **Neon**. The selected theme is saved to `localStorage` and restored on next visit.

---

## Notes

- Numbers are capped at **10 digits** per operand.
- The expression display truncates from the left with `…` if it exceeds 22 characters.
- Division by zero produces an `Error` state; typing a new digit clears it.
- Results are computed to 12 significant figures to avoid floating-point noise.
