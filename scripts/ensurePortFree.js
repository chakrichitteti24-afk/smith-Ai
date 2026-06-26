const { exec } = require('child_process');

function killPid(pid, port) {
  if (!pid) return;
  const cmd = process.platform === 'win32' ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Failed to kill PID', pid, err.message);
      return;
    }
    console.log(`Killed PID ${pid} (port ${port})`);
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

