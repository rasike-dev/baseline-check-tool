import * as assert from 'assert';
import * as vscode from 'vscode';

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
