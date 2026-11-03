import { defineConfig, devices } from '@playwright/test';

const channel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...(channel ? { channel } : {}),
  },
  webServer: {
    command: 'node server.js',
    url: 'http://127.0.0.1:3100/api/health',
    timeout: 30_000,
    reuseExistingServer: false,
    env: {
      HOST: '127.0.0.1',
      PORT: '3100',
      NODE_ENV: 'test',
      DATA_FILE: 'data/e2e-tasks.json',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
