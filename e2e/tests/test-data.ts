// Orders placed by the tests use this email, so global-teardown.ts can find
// and undo them
export const TEST_EMAIL = 'playwright@example.com'

// Accounts created by the tests use emails in this domain, so
// global-teardown.ts can delete them
export const TEST_ACCOUNT_DOMAIN = '@playwright-accounts.example'
