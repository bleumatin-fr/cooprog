# Playwright Tests for CooProg

This directory contains end-to-end tests for the CooProg application using Playwright.

## Setup

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Install Playwright browsers:**

   ```bash
   yarn test:install
   ```

3. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your test credentials
   ```

## Running Tests

### From the root directory:

```bash
# Run all tests
yarn test

# Run tests with UI (interactive mode)
yarn test:ui

# Run tests in headed mode (see browser)
yarn test:headed

# Debug tests
yarn test:debug

# Generate HTML report
yarn test:report
```

### From the ops directory:

```bash
# Run all tests
yarn test

# Run specific test file
yarn test tests/healthcheck.spec.ts

# Run tests for specific browser
yarn test --project=firefox

# Run tests in headed mode
yarn test --headed

# Debug a specific test
yarn test --debug tests/healthcheck.spec.ts
```

## Login Utility

The `tests/utils/auth.ts` file provides reusable login functions:

### Basic Usage

```typescript
import { loginWithDefaults, login, ensureLoggedIn } from "./utils/auth";

// Login with environment variables
await loginWithDefaults(page);

// Login with custom credentials
await login(page, { email: "user@example.com", password: "password" });

// Ensure logged in (login if not already logged in)
await ensureLoggedIn(page);
```

### Available Functions

- `login(page, credentials, options)` - Login with custom credentials
- `loginWithDefaults(page, options)` - Login using EMAIL/PASSWORD env vars
- `ensureLoggedIn(page, credentials?)` - Login only if not already logged in
- `logout(page)` - Logout from the application
- `isLoggedIn(page)` - Check if user is currently logged in

### Login Options

```typescript
interface LoginOptions {
  baseURL?: string; // Base URL (default: process.env.URL)
  waitForNavigation?: boolean; // Wait for navigation (default: true)
  expectedRedirect?: string; // Expected redirect path (default: "/home")
}
```

## Test Structure

```
tests/
├── utils/
│   └── auth.ts              # Login utilities
├── healthcheck.spec.ts      # Basic health check tests
├── structure-rights.spec.ts # Structure rights tests
└── login-examples.spec.ts   # Login function examples
```

## Environment Variables

Create a `.env` file with:

```bash
URL=http://localhost:3000
EMAIL=your-test-email@example.com
PASSWORD=your-test-password
```

## Docker Integration

Tests can be run against your Docker setup:

```bash
# Start the application
docker-compose up -d

# Run tests
yarn test

# Stop the application
docker-compose down
```

## Debugging

1. **Visual debugging:**

   ```bash
   yarn test:headed
   ```

2. **Step-by-step debugging:**

   ```bash
   yarn test:debug
   ```

3. **Interactive mode:**
   ```bash
   yarn test:ui
   ```

## Best Practices

1. **Use the login utility** instead of duplicating login code
2. **Use descriptive test names** that explain what the test does
3. **Wait for elements** before interacting with them
4. **Use data-testid attributes** for more reliable element selection
5. **Clean up after tests** if needed (logout, reset state, etc.)

## Troubleshooting

- **Tests fail to start:** Make sure the application is running (`docker-compose up`)
- **Login fails:** Check your credentials in the `.env` file
- **Elements not found:** Use `page.pause()` to debug element selection
- **Slow tests:** Use `page.waitForLoadState('networkidle')` to wait for network activity
