# 🎨 Colorize Folder Tree

> ⚠️ **Critical:** This extension patches a single internal file (the workbench HTML) and requires write access to your installation directory. You only need administrator privileges when enabling or disabling the extension; after toggling, you can run VS Code normally as a standard user. Use at your own risk and always keep a backup of your workbench file.
>
**Rainbow nesting borders for folders in the VS Code Explorer** — like bracket pair colorization, but for your file tree.

Colorize Folder Tree adds colored borders to indent guides in the Explorer, cycling through 6 distinct colors based on nesting depth. Instantly see how deep you are in a folder structure at a glance.

```
📁 src                    → Level 1 → 🟡 Gold
  📁 components           → Level 2 → 🟣 Magenta
    📁 ui                 → Level 3 → 🔵 Blue
      📁 buttons          → Level 4 → 🟢 Green
        📁 icons          → Level 5 → 🟠 Orange
          📁 svg          → Level 6 → 🩵 Cyan
            📁 animated   → Level 7 → 🟡 Gold (cycles back)
```

---

## ✨ Features

- **Rainbow indent guide borders** — 6 colors that cycle infinitely, no matter how deep the nesting
- **Colored folder collapse/expand icons** — folder icons (codicons) match the border color for that depth
- **Simple toggle** — one command to turn it on or off
- **Status bar indicator** — shows whether Colorize Folder Tree is ON or OFF, click to toggle
- **Zero performance impact** — pure CSS, no JavaScript overhead at runtime
- **Automatic backup** — safely backs up VS Code's workbench HTML before patching

---

## 🚀 Getting Started

1. Open the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type **"Colorize Folder Tree: Enable Rainbow Borders"**
3. Click **"Restart VS Code"** when prompted
4. Done! Your Explorer indent guides now have rainbow borders.

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `Colorize Folder Tree: Toggle Rainbow Borders` | Enable if off, disable if on |
| `Colorize Folder Tree: Enable Rainbow Borders` | Inject the rainbow border CSS into VS Code |
| `Colorize Folder Tree: Disable Rainbow Borders` | Remove the CSS and restore the original state |

---

## 🎨 Default Color Palette

The colors are inspired by popular bracket pair colorization themes:

| Depth Level | Color | Hex |
|-------------|-------|-----|
| 1, 7, 13, ... | 🟡 Gold | `#e5c07b` |
| 2, 8, 14, ... | 🟣 Magenta | `#c678dd` |
| 3, 9, 15, ... | 🔵 Blue | `#61afef` |
| 4, 10, 16, ... | 🟢 Green | `#98c379` |
| 5, 11, 17, ... | 🟠 Orange | `#d19a66` |
| 6, 12, 18, ... | 🩵 Cyan | `#56b6c2` |

Colors cycle back after level 6 — so level 7 = Gold again, level 8 = Magenta, etc.

### Customizing Colors

Edit `colorize-folder-tree.css` in the extension directory. Each color is a simple CSS rule:

```css
/* Change Gold to Red */
.indent-guide:nth-child(6n+1) {
    border-color: #e06c75 !important;
}
```

> You can also adjust the matching icon color rules toward the bottom of the file; they use selectors like `.monaco-list-row .codicon` combined with the same `6n+X` math.

---

## ⚠️ Important Notes

### "Corrupt Installation" Warning
After enabling Colorize Folder Tree, VS Code will show a warning:
> "Your Code installation appears to be corrupt."

**This is expected and harmless.** It appears because the extension modifies VS Code's internal workbench HTML to inject CSS. Click **"Don't Show Again"** to dismiss it permanently.

### Admin / Write Permissions Required
This extension patches a file inside VS Code's installation directory, which means **you only need administrator (or elevated) rights when enabling or disabling the rainbow borders**. After the style has been injected (or removed) you can run VS Code normally as a standard user.

You still need **write access** to the installation path while toggling:
- **Windows (User Install):** `%LOCALAPPDATA%\Programs\Microsoft VS Code\` — ✅ no admin needed
- **Windows (System Install):** `C:\Program Files\Microsoft VS Code\` — ❌ requires admin (run the enable/disable command from an elevated prompt)
- **macOS:** `/Applications/Visual Studio Code.app/` — may need `sudo`
- **Linux:** `/usr/share/code/` — may need `sudo`

> **Tip:** If you don't have admin rights, reinstall VS Code using the [User Installer](https://code.visualstudio.com/download) instead of the System Installer.

### VS Code Updates
When VS Code updates, it may overwrite the patched workbench HTML. Simply re-run **"Colorize Folder Tree: Enable Rainbow Borders"** after an update.

---

## 🧩 How It Works

1. On **Enable**, the extension:
   - Locates VS Code's internal `workbench.html` (or `workbench.esm.html`)
   - Creates a backup of the original file
   - Injects a `<style>` tag with the rainbow border CSS
   - Prompts you to restart VS Code

2. On **Disable**, the extension:
   - Restores the original backup
   - Cleans up backup files
   - Prompts you to restart VS Code

The CSS targets `.indent-guide:nth-child(6n+X)` elements in the Explorer tree, which are the indent guide lines next to nested folders and files, and also colors the corresponding collapse/expand icons (`.codicon`) using the same depth-based math.

---

## 📁 Project Structure

```
colorize-folder-tree/
├── extension.js        # Main extension logic (patch/unpatch workbench HTML)
├── colorize-folder-tree.css     # The CSS that gets injected (edit colors here!)
├── messages.js         # User-facing notification messages
├── package.json        # Extension manifest
└── test/
    └── extension.test.js
```

---

## 📦 Development

```bash
# Clone and open in VS Code
git clone <repo-url>
cd colorize-folder-tree
npm install

# Press F5 to launch the Extension Development Host
# Then run "Colorize Folder Tree: Enable Rainbow Borders" from the Command Palette
```

---

## 📝 Release Notes

### 0.0.1

- Initial release
- Rainbow nesting borders with 6-color cycling palette
- Rainbow folder icons matching border colors
- Toggle / Enable / Disable commands
- Status bar indicator
- Automatic backup and restore of workbench HTML

---

**Enjoy! 🎨**
