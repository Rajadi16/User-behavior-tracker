const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

const processes = [];
let shuttingDown = false;

function startProcess(name, command, args) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: process.env,
    shell: false,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  processes.push(child);

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    console.log(`[${name}] exited with ${signal || code}`);
    stopAll(code || 0);
  });

  return child;
}

function stopAll(exitCode = 0) {
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

startProcess('api', 'node', ['src/server.js']);
startProcess('dashboard', isWindows ? 'node.exe' : 'node', [
  path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next'),
  'dev',
  '-p',
  '3000'
]);

console.log('Starting API at http://localhost:5000');
console.log('Starting dashboard at http://localhost:3000');
console.log('Demo page will be available at http://localhost:5000/demo/');
