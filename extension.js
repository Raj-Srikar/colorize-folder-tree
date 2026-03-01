// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const msg = require('./messages').messages;

function activate(context) {
	// ── Locate VS Code's internal workbench HTML file ──
	const loc = locateWorkbench();
	if (!loc) return;

	const [workbenchDir, htmlPath] = loc;
	const cssPath = path.join(context.extensionPath, 'colorize-folder-tree.css');

	console.log('✅ Colorize Folder Tree is active!');
	console.log('   Workbench dir:', workbenchDir);
	console.log('   HTML file:', htmlPath);
	console.log('   CSS file:', cssPath);

	// ── Update status bar to show current state ──
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'colorize-folder-tree.toggle';
	updateStatusBar(statusBarItem, htmlPath);
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// ═══════════════════════════════════════════════════════
	// Command: Toggle (Enable / Disable)
	// ═══════════════════════════════════════════════════════
	const toggleCmd = vscode.commands.registerCommand('colorize-folder-tree.toggle', async () => {
		const isPatched = await isPatchApplied(htmlPath);
		if (isPatched) {
			await cmdDisable(htmlPath, workbenchDir);
		} else {
			await cmdEnable(htmlPath, workbenchDir, cssPath);
		}
		updateStatusBar(statusBarItem, htmlPath);
	});

	// ═══════════════════════════════════════════════════════
	// Command: Enable
	// ═══════════════════════════════════════════════════════
	const enableCmd = vscode.commands.registerCommand('colorize-folder-tree.enable', async () => {
		const isPatched = await isPatchApplied(htmlPath);
		if (isPatched) {
			vscode.window.showInformationMessage(msg.alreadyEnabled);
			return;
		}
		await cmdEnable(htmlPath, workbenchDir, cssPath);
		updateStatusBar(statusBarItem, htmlPath);
	});

	// ═══════════════════════════════════════════════════════
	// Command: Disable
	// ═══════════════════════════════════════════════════════
	const disableCmd = vscode.commands.registerCommand('colorize-folder-tree.disable', async () => {
		const isPatched = await isPatchApplied(htmlPath);
		if (!isPatched) {
			vscode.window.showInformationMessage(msg.alreadyDisabled);
			return;
		}
		await cmdDisable(htmlPath, workbenchDir);
		updateStatusBar(statusBarItem, htmlPath);
	});

	context.subscriptions.push(toggleCmd, enableCmd, disableCmd);

	// ═══════════════════════════════════════════════════════
	// Core Functions
	// ═══════════════════════════════════════════════════════

	async function cmdEnable(htmlFilePath, wbDir, cssFilePath) {
		try {
			const sessionId = uuid.v4();

			// 1. Backup the original HTML
			await createBackup(htmlFilePath, wbDir, sessionId);

			// 2. Read the CSS
			const cssContent = await fs.promises.readFile(cssFilePath, 'utf-8');

			// 3. Patch the HTML
			let html = await fs.promises.readFile(htmlFilePath, 'utf-8');
			html = clearExistingPatches(html);

			// Remove Content-Security-Policy to allow inline styles
			html = html.replace(/<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '');

			html = html.replace(
				/(<\/html>)/,
				`<!-- !! COLORIZE-FOLDER-TREE-SESSION-ID ${sessionId} !! -->\n` +
				'<!-- !! COLORIZE-FOLDER-TREE-START !! -->\n' +
				`<style>${cssContent}</style>\n` +
				'<!-- !! COLORIZE-FOLDER-TREE-END !! -->\n</html>'
			);

			await fs.promises.writeFile(htmlFilePath, html, 'utf-8');

			vscode.window.showInformationMessage(msg.enabled + '\n' + msg.corruptWarning, msg.restartIde)
				.then(btn => {
					if (btn === msg.restartIde) {
						vscode.commands.executeCommand('workbench.action.reloadWindow');
					}
				});
		} catch (e) {
			vscode.window.showErrorMessage(msg.admin + '\n' + e.message);
		}
	}

	async function cmdDisable(htmlFilePath, wbDir) {
		try {
			const backupUuid = await getBackupUuid(htmlFilePath);
			if (backupUuid) {
				const backupPath = getBackupFilePath(wbDir, backupUuid);
				await restoreBackup(htmlFilePath, backupPath);
				await deleteBackupFiles(wbDir);
			} else {
				// No backup found — just strip the patches manually
				let html = await fs.promises.readFile(htmlFilePath, 'utf-8');
				html = clearExistingPatches(html);
				await fs.promises.writeFile(htmlFilePath, html, 'utf-8');
			}

			vscode.window.showInformationMessage(msg.disabled, msg.restartIde)
				.then(btn => {
					if (btn === msg.restartIde) {
						vscode.commands.executeCommand('workbench.action.reloadWindow');
					}
				});
		} catch (e) {
			vscode.window.showErrorMessage(msg.admin + '\n' + e.message);
		}
	}

	// ═══════════════════════════════════════════════════════
	// Backup & Restore
	// ═══════════════════════════════════════════════════════

	async function createBackup(htmlFilePath, wbDir, sessionId) {
		let html = await fs.promises.readFile(htmlFilePath, 'utf-8');
		html = clearExistingPatches(html);
		const backupPath = getBackupFilePath(wbDir, sessionId);
		await fs.promises.writeFile(backupPath, html, 'utf-8');
	}

	async function restoreBackup(htmlFilePath, backupPath) {
		if (fs.existsSync(backupPath)) {
			await fs.promises.copyFile(backupPath, htmlFilePath);
		}
	}

	async function deleteBackupFiles(wbDir) {
		const items = await fs.promises.readdir(wbDir);
		for (const item of items) {
			if (item.endsWith('.bak-colorize-folder-tree')) {
				await fs.promises.unlink(path.join(wbDir, item));
			}
		}
	}

	function getBackupFilePath(wbDir, sessionId) {
		return path.join(wbDir, `workbench.${sessionId}.bak-colorize-folder-tree`);
	}

	// ═══════════════════════════════════════════════════════
	// Patch Detection & Cleanup
	// ═══════════════════════════════════════════════════════

	async function getBackupUuid(htmlFilePath) {
		try {
			const html = await fs.promises.readFile(htmlFilePath, 'utf-8');
			const match = html.match(/<!-- !! COLORIZE-FOLDER-TREE-SESSION-ID ([0-9a-fA-F-]+) !! -->/);
			return match ? match[1] : null;
		} catch {
			return null;
		}
	}

	async function isPatchApplied(htmlFilePath) {
		try {
			const html = await fs.promises.readFile(htmlFilePath, 'utf-8');
			return html.includes('<!-- !! COLORIZE-FOLDER-TREE-START !! -->');
		} catch {
			return false;
		}
	}

	function clearExistingPatches(html) {
		html = html.replace(
			/<!-- !! COLORIZE-FOLDER-TREE-START !! -->[\s\S]*?<!-- !! COLORIZE-FOLDER-TREE-END !! -->\n*/,
			''
		);
		html = html.replace(
			/<!-- !! COLORIZE-FOLDER-TREE-SESSION-ID [\w-]+ !! -->\n*/g,
			''
		);
		return html;
	}
}

// ═══════════════════════════════════════════════════════
// Locate VS Code Workbench
// ═══════════════════════════════════════════════════════

function locateWorkbench() {
	const appDir = vscode.env.appRoot;

	if (!appDir) {
		vscode.window.showErrorMessage(msg.unableToLocate);
		return null;
	}

	const basePath = path.join(appDir, 'out', 'vs', 'code');

	const workbenchDirCandidates = [
		path.join(basePath, 'electron-browser', 'workbench'),
		path.join(basePath, 'electron-browser'),
		path.join(basePath, 'electron-sandbox', 'workbench'),
		path.join(basePath, 'electron-sandbox'),
	];

	const htmlFileNameCandidates = [
		'workbench-dev.html',
		'workbench.esm.html',
		'workbench.html',
	];

	for (const dir of workbenchDirCandidates) {
		for (const file of htmlFileNameCandidates) {
			const fullPath = path.join(dir, file);
			console.log('Colorize Folder Tree: checking', fullPath, '→', fs.existsSync(fullPath));
			if (fs.existsSync(fullPath)) {
				return [dir, fullPath];
			}
		}
	}

	vscode.window.showErrorMessage(msg.unableToLocate);
	return null;
}

// ═══════════════════════════════════════════════════════
// Status Bar
// ═══════════════════════════════════════════════════════

function updateStatusBar(item, htmlPath) {
	try {
		const html = fs.readFileSync(htmlPath, 'utf-8');
		const isEnabled = html.includes('<!-- !! COLORIZE-FOLDER-TREE-START !! -->');
		item.text = isEnabled ? '$(paintcan) Colorize Folder Tree: ON' : '$(paintcan) Colorize Folder Tree: OFF';
		item.tooltip = isEnabled
			? 'Colorize Folder Tree is enabled — click to disable'
			: 'Colorize Folder Tree is disabled — click to enable';
	} catch {
		item.text = '$(paintcan) Colorize Folder Tree';
		item.tooltip = 'Colorize Folder Tree';
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
