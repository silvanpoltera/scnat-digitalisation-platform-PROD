module.exports = {
  apps: [{
    name: 'scnat-api',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
    },
  }],
};
