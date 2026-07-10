import { spawn } from "node:child_process";

const commands = [
  { name: "server", args: ["run", "server:dev"] },
  { name: "client", args: ["run", "client:dev"] }
];

const children = commands.map(({ name, args }) => {
  const child = spawn("npm.cmd", args, {
    cwd: new URL("../", import.meta.url),
    stdio: "pipe",
    shell: false
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exitCode = code;
    }
  });

  return child;
});

const shutdown = () => {
  for (const child of children) child.kill();
  process.exit();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
