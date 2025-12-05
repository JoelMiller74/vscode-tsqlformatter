import * as vscode from 'vscode';

const ACTIVE_PROFILE_KEY = 'tsqlformatter.activeProfile';

export function loadActiveProfile(config: vscode.WorkspaceConfiguration, context: vscode.ExtensionContext) {
  const name = config.get<string>('profile', 'default');
  const stored = context.globalState.get(`profile:${name}`);
  return stored ?? {};
}

export async function saveProfile(context: vscode.ExtensionContext) {
  const name = await vscode.window.showInputBox({ prompt: 'Profile name to save', value: 'default' });
  if (!name) {
    return;
  }
  const cfg = vscode.workspace.getConfiguration('tsqlformatter');
  const all = cfg;
  await context.globalState.update(`profile:${name}`, all);
  await context.globalState.update(ACTIVE_PROFILE_KEY, name);
  vscode.window.showInformationMessage(`T-SQL Formatter profile "${name}" saved.`);
}

export async function applyWorkspaceProfile(context: vscode.ExtensionContext) {
  const keys = Object.keys(context.globalState.keys().reduce((acc: any, k: string) => {
    if (k.startsWith('profile:')) {
      acc[k.slice('profile:'.length)] = true;
    }
    return acc;
  }, {}));
  const picked = await vscode.window.showQuickPick(keys, { placeHolder: 'Choose a profile to apply' });
  if (!picked) {
    return;
  }
  const hasWorkspace = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
  const target = hasWorkspace ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
  await vscode.workspace.getConfiguration().update('tsqlformatter.profile', picked, target);
  await context.globalState.update(ACTIVE_PROFILE_KEY, picked);
  vscode.window.showInformationMessage(`T-SQL Formatter profile "${picked}" applied to ${hasWorkspace ? 'workspace' : 'user settings'}.`);
}

export async function exportProfile(context: vscode.ExtensionContext) {
  const name = context.globalState.get<string>(ACTIVE_PROFILE_KEY) || 'default';
  const data = context.globalState.get(`profile:${name}`) ?? {};
  const uri = await vscode.window.showSaveDialog({ filters: { 'JSON': ['json'] }, defaultUri: vscode.Uri.file(`sql-formatter-${name}.json`) });
  if (!uri) {
    return;
  }
  await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(data, null, 2)));
  vscode.window.showInformationMessage(`Exported profile to ${uri.fsPath}`);
}

export async function importProfile(context: vscode.ExtensionContext) {
  const uris = await vscode.window.showOpenDialog({ canSelectMany: false, filters: { 'JSON': ['json'] } });
  if (!uris || uris.length === 0) {
    return;
  }
  const uri = uris[0];
  const bytes = await vscode.workspace.fs.readFile(uri);
  const data = JSON.parse(Buffer.from(bytes).toString('utf8'));
  const name = await vscode.window.showInputBox({ prompt: 'Profile name to import as', value: 'imported' });
  if (!name) {
    return;
  }
  await context.globalState.update(`profile:${name}`, data);
  await context.globalState.update(ACTIVE_PROFILE_KEY, name);
  vscode.window.showInformationMessage(`Imported profile "${name}" from ${uri.fsPath}`);
}
