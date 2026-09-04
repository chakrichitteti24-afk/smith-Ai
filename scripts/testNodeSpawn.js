const { spawnSync } = require('child_process');
const code = 'const fs = require(\x22fs\x22); const n = parseInt(fs.readFileSync(0, \x22utf-8\x22)); console.log(n%2===0?\x22Even\x22:\x22Odd\x22);';
const res = spawnSync(process.execPath, ['-e', code], { input: '4', encoding: 'utf8', timeout: 3000 });
console.log('Result of real node execution:', { stdout: res.stdout.trim(), stderr: res.stderr.trim(), exitCode: res.status });
