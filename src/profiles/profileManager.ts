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
  // List of known configuration keys for tsqlformatter
  const configKeys = [
    'profile',
    'keywordCase',
    'identifierCase',
    'indentStyle',
    'indentSize',
    'commaPosition',
    'statementSeparator',
    'functionCase',
    'alignColumn',
    'alignAlias',
    'spaceAroundOperators',
    'newlineBeforeJoin',
    'newlineBeforeWhere',
    'newlineBeforeGroupBy',
    'newlineBeforeOrderBy',
    'newlineBeforeHaving',
    'newlineBeforeUnion',
    'newlineBeforeIntersect',
    'newlineBeforeExcept',
    'newlineBeforeInsert',
    'newlineBeforeUpdate',
    'newlineBeforeDelete',
    'newlineBeforeCreate',
    'newlineBeforeAlter',
    'newlineBeforeDrop',
    'newlineBeforeTruncate',
    'newlineBeforeMerge',
    'newlineBeforeCall',
    'newlineBeforeExec',
    'newlineBeforeBegin',
    'newlineBeforeEnd',
    'newlineBeforeElse',
    'newlineBeforeThen',
    'newlineBeforeCatch',
    'newlineBeforeFinally',
    'newlineBeforeReturn',
    'newlineBeforePrint',
    'newlineBeforeRaise',
    'newlineBeforeThrow',
    'newlineBeforeCommit',
    'newlineBeforeRollback',
    'newlineBeforeSavepoint',
    'newlineBeforeRelease',
    'newlineBeforeGrant',
    'newlineBeforeRevoke',
    'newlineBeforeDeny',
    'newlineBeforeUse',
    'newlineBeforeGo',
    'newlineBeforeSet',
    'newlineBeforeDeclare',
    'newlineBeforeOpen',
    'newlineBeforeFetch',
    'newlineBeforeClose',
    'newlineBeforeDeallocate',
    'newlineBeforeCursor',
    'newlineBeforeTransaction',
    'newlineBeforeLock',
    'newlineBeforeUnlock',
    'newlineBeforeAnalyze',
    'newlineBeforeExplain',
    'newlineBeforeDescribe',
    'newlineBeforeShow',
    'newlineBeforeUseDatabase',
    'newlineBeforeCreateDatabase',
    'newlineBeforeDropDatabase',
    'newlineBeforeAlterDatabase',
    'newlineBeforeBackup',
    'newlineBeforeRestore',
    'newlineBeforeCheck',
    'newlineBeforeOptimize',
    'newlineBeforeRepair',
    'newlineBeforeFlush',
    'newlineBeforePurge',
    'newlineBeforeKill',
    'newlineBeforeShutdown',
    'newlineBeforeRestart',
    'newlineBeforeStart',
    'newlineBeforeStop',
    'newlineBeforeSuspend',
    'newlineBeforeResume',
    'newlineBeforeWait',
    'newlineBeforeSignal',
    'newlineBeforeListen',
    'newlineBeforeNotify',
    'newlineBeforeUnlisten',
    'newlineBeforeDo',
    'newlineBeforeLoop',
    'newlineBeforeRepeat',
    'newlineBeforeUntil',
    'newlineBeforeLeave',
    'newlineBeforeIterate',
    'newlineBeforeOpenBracket',
    'newlineBeforeCloseBracket',
    'newlineBeforeOpenParenthesis',
    'newlineBeforeCloseParenthesis',
    'newlineBeforeOpenSquareBracket',
    'newlineBeforeCloseSquareBracket',
    'newlineBeforeOpenCurlyBracket',
    'newlineBeforeCloseCurlyBracket',
    'newlineBeforeSemicolon',
    'newlineBeforeColon',
    'newlineBeforeDot',
    'newlineBeforeComma',
    'newlineBeforeAsterisk',
    'newlineBeforePercent',
    'newlineBeforeQuestionMark',
    'newlineBeforeExclamationMark',
    'newlineBeforeAt',
    'newlineBeforeHash',
    'newlineBeforeDollar',
    'newlineBeforeAmpersand',
    'newlineBeforePipe',
    'newlineBeforeCaret',
    'newlineBeforeTilde',
    'newlineBeforeBacktick',
    'newlineBeforeDoubleQuote',
    'newlineBeforeSingleQuote',
    'newlineBeforeEscape',
    'newlineBeforeComment',
    'newlineBeforeHint',
    'newlineBeforePlan',
    'newlineBeforeExplainPlan',
    'newlineBeforeShowPlan',
    'newlineBeforeSetPlan',
    'newlineBeforeUsePlan',
    'newlineBeforeGoPlan',
    'newlineBeforeEndPlan',
    'newlineBeforeElsePlan',
    'newlineBeforeThenPlan',
    'newlineBeforeCatchPlan',
    'newlineBeforeFinallyPlan',
    'newlineBeforeReturnPlan',
    'newlineBeforePrintPlan',
    'newlineBeforeRaisePlan',
    'newlineBeforeThrowPlan',
    'newlineBeforeCommitPlan',
    'newlineBeforeRollbackPlan',
    'newlineBeforeSavepointPlan',
    'newlineBeforeReleasePlan',
    'newlineBeforeGrantPlan',
    'newlineBeforeRevokePlan',
    'newlineBeforeDenyPlan',
    'newlineBeforeUseDatabasePlan',
    'newlineBeforeCreateDatabasePlan',
    'newlineBeforeDropDatabasePlan',
    'newlineBeforeAlterDatabasePlan',
    'newlineBeforeBackupPlan',
    'newlineBeforeRestorePlan',
    'newlineBeforeCheckPlan',
    'newlineBeforeOptimizePlan',
    'newlineBeforeRepairPlan',
    'newlineBeforeFlushPlan',
    'newlineBeforePurgePlan',
    'newlineBeforeKillPlan',
    'newlineBeforeShutdownPlan',
    'newlineBeforeRestartPlan',
    'newlineBeforeStartPlan',
    'newlineBeforeStopPlan',
    'newlineBeforeSuspendPlan',
    'newlineBeforeResumePlan',
    'newlineBeforeWaitPlan',
    'newlineBeforeSignalPlan',
    'newlineBeforeListenPlan',
    'newlineBeforeNotifyPlan',
    'newlineBeforeUnlistenPlan',
    'newlineBeforeDoPlan',
    'newlineBeforeLoopPlan',
    'newlineBeforeRepeatPlan',
    'newlineBeforeUntilPlan',
    'newlineBeforeLeavePlan',
    'newlineBeforeIteratePlan',
    'newlineBeforeOpenBracketPlan',
    'newlineBeforeCloseBracketPlan',
    'newlineBeforeOpenParenthesisPlan',
    'newlineBeforeCloseParenthesisPlan',
    'newlineBeforeOpenSquareBracketPlan',
    'newlineBeforeCloseSquareBracketPlan',
    'newlineBeforeOpenCurlyBracketPlan',
    'newlineBeforeCloseCurlyBracketPlan',
    'newlineBeforeSemicolonPlan',
    'newlineBeforeColonPlan',
    'newlineBeforeDotPlan',
    'newlineBeforeCommaPlan',
    'newlineBeforeAsteriskPlan',
    'newlineBeforePercentPlan',
    'newlineBeforeQuestionMarkPlan',
    'newlineBeforeExclamationMarkPlan',
    'newlineBeforeAtPlan',
    'newlineBeforeHashPlan',
    'newlineBeforeDollarPlan',
    'newlineBeforeAmpersandPlan',
    'newlineBeforePipePlan',
    'newlineBeforeCaretPlan',
    'newlineBeforeTildePlan',
    'newlineBeforeBacktickPlan',
    'newlineBeforeDoubleQuotePlan',
    'newlineBeforeSingleQuotePlan',
    'newlineBeforeEscapePlan',
    'newlineBeforeCommentPlan',
    'newlineBeforeHintPlan',
    'newlineBeforePlanPlan'
  ];
  const all: Record<string, any> = {};
  for (const key of configKeys) {
    all[key] = cfg.get(key);
  }
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
  const uri = await vscode.window.showSaveDialog({ filters: { 'JSON': ['json'] }, defaultUri: vscode.Uri.file(`tsql-formatter-${name}.json`) });
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
