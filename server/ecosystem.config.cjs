module.exports = {
  apps: [
    {
      name: "bidnsteal-api",
      cwd: "./apps/api",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      time: true,
      merge_logs: true,
    },
    {
      name: "bidnsteal-worker",
      cwd: "./apps/worker",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      time: true,
      merge_logs: true,
    },
  ],
};

