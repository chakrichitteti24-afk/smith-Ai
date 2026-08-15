const { exec } = require('child_process');

function killPid(pid, port) {
  const num = parseInt(pid, 10);
  if (!num || isNaN(num) || num <= 0) return;
  const cmd = process.platform === 'win32' ? `taskkill /PID ${num} /F` : `kill -9 ${num}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return;
    }
    console.log(`Killed PID ${num} (port ${port})`);
  });
}

function freePort(port) {
  if (process.platform === 'win32') {
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (err || !stdout) {
        console.log(`No process listening on port ${port}`);
        return;
      }
      // parse last column as PID
      const lines = stdout.trim().split(/\r?\n/);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // Find line containing LISTENING
        if (line.includes('LISTENING') || parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) killPid(pid, port);
        }
      }
    });
  } else {
    exec(`lsof -i :${port} -t`, (err, stdout) => {
      if (err || !stdout) {
        console.log(`No process listening on port ${port}`);
        return;
      }
      const pids = stdout.trim().split(/\r?\n/);
      for (const pid of pids) killPid(pid, port);
    });
  }
}

freePort(3001);
freePort(5173);
freePort(5174);

