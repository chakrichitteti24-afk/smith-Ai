const { spawnSync } = require('child_process');
const pyCode = 'import sys\nline = sys.stdin.readline().strip()\nif line:\n    n = int(line)\n    print(\x22Even\x22 if n % 2 == 0 else \x22Odd\x22)';
const pyBin = process.platform === 'win32' ? 'python' : 'python3';
const res = spawnSync(pyBin, ['-c', pyCode], { input: '4', encoding: 'utf8', timeout: 3000 });
console.log('Result of real Python execution:', { stdout: res.stdout.trim(), stderr: res.stderr.trim(), exitCode: res.status });
