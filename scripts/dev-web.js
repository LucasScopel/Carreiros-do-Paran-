const { spawn } = require('node:child_process');

const port = process.env.WEB_PORT;

const child = spawn(
  'pnpm',
  ['--filter', 'web', 'dev'],
  {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: port,
    },
  }
);

child.on('exit', code => {
  process.exit(code ?? 0);
});
