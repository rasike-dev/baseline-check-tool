"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
suite('Baseline Check Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('rasike-a.baseline-check-tool'));
    });
    test('Should activate', async () => {
        const extension = vscode.extensions.getExtension('rasike-a.baseline-check-tool');
        if (extension) {
            await extension.activate();
            assert.ok(extension.isActive);
        }
    });
    test('Should register commands', async () => {
        const commands = await vscode.commands.getCommands(true);
        const baselineCommands = commands.filter(command => command.startsWith('baseline-check.'));
        assert.ok(baselineCommands.length > 0, 'Should register baseline check commands');
        assert.ok(baselineCommands.includes('baseline-check.scan'), 'Should register scan command');
        assert.ok(baselineCommands.includes('baseline-check.analyze'), 'Should register analyze command');
        assert.ok(baselineCommands.includes('baseline-check.dashboard'), 'Should register dashboard command');
    });
    test('Should have configuration', () => {
        const config = vscode.workspace.getConfiguration('baseline-check');
        assert.ok(config.has('enabled'), 'Should have enabled configuration');
        assert.ok(config.has('autoScan'), 'Should have autoScan configuration');
        assert.ok(config.has('showNotifications'), 'Should have showNotifications configuration');
    });
});
//# sourceMappingURL=extension.test.js.map