# Package.json Updates for New Repository

When moving to a new repository, update these fields in `package.json`:

## Repository Information

Replace the current repository URLs with your new repository:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/baseline-check-vscode.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/baseline-check-vscode#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/baseline-check-vscode/issues"
  }
}
```

## Build Script Update

Update the build script to use the simplified version (no file copying):

```json
{
  "scripts": {
    "build": "npm run compile && npm run bundle"
  }
}
```

Or if you want to keep a build script for future use:

```json
{
  "scripts": {
    "build": "node scripts/build-simple.js && npm run compile && npm run bundle"
  }
}
```

## Keep These Unchanged

- `name`: "baseline-check-tool" (extension name)
- `displayName`: "Baseline Check Tool"
- `publisher`: "rasike-a" (your publisher ID)
- `version`: Update as needed for new releases
- All `contributes` configuration
- All `dependencies` and `devDependencies`

## Example Complete Update

```json
{
  "name": "baseline-check-tool",
  "displayName": "Baseline Check Tool",
  "description": "Comprehensive web compatibility analysis and optimization tool for VS Code",
  "version": "2.5.0",
  "publisher": "rasike-a",
  "icon": "icon.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/baseline-check-vscode.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/baseline-check-vscode#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/baseline-check-vscode/issues"
  },
  "scripts": {
    "vscode:prepublish": "npm run build",
    "build": "npm run compile && npm run bundle",
    "compile": "tsc -p ./",
    "bundle": "webpack --mode production",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "baseline-check-tool": "^2.3.2",
    "chalk": "^4.1.2",
    "cli-table3": "^0.6.3",
    "commander": "^11.1.0",
    "ora": "^5.4.1"
  }
}
```

