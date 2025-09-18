module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000 --local',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        APP_VERSION: '4.2.0-Production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 3000,
      max_restarts: 3,
      min_uptime: '10s'
    }
  ]
}