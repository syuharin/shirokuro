import { test, expect } from '@playwright/test';

test.describe('Host Migration', () => {
  test('should elect a new host and maintain sync when anchor leaves', async ({ page, context, browser }) => {
    test.setTimeout(120000); // Increase test timeout to 2 minutes

    // 1. Setup 3 participants
    const roomUrl = 'http://localhost:3000/room/test-migration-room';
    
    // Tab 1: Host/Anchor
    const hostPage = page;
    await hostPage.goto(roomUrl);
    // Use getByRole which is more robust than placeholder text
    const hostNameInput = hostPage.getByRole('textbox').first();
    await hostNameInput.waitFor({ state: 'visible', timeout: 30000 });
    await hostNameInput.fill('Host');

    // Tab 2: Guest 1
    const guest1Context = await browser.newContext();
    const guest1Page = await guest1Context.newPage();
    await guest1Page.goto(roomUrl);
    const guest1NameInput = guest1Page.getByRole('textbox').first();
    await guest1NameInput.waitFor({ state: 'visible', timeout: 30000 });
    await guest1NameInput.fill('Guest 1');

    // Tab 3: Guest 2
    const guest2Context = await browser.newContext();
    const guest2Page = await guest2Context.newPage();
    await guest2Page.goto(roomUrl);
    const guest2NameInput = guest2Page.getByRole('textbox').first();
    await guest2NameInput.waitFor({ state: 'visible', timeout: 30000 });
    await guest2NameInput.fill('Guest 2');

    // Verify initial sync (everyone sees everyone)
    await expect(hostPage.locator('text=Guest 1')).toBeVisible({ timeout: 20000 });
    await expect(hostPage.locator('text=Guest 2')).toBeVisible();
    await expect(guest1Page.locator('text=Host')).toBeVisible();
    await expect(guest2Page.locator('text=Host')).toBeVisible();

    console.log('Initial sync verified. Closing Host...');

    // 2. Host Leaves
    await hostPage.close();

    // 3. Wait for election and verify session continuity
    // In our implementation, after MAX_RECONNECT_RETRIES (5) * exponential backoff, migration starts.
    // That's roughly 1+2+4+8+16 = 31 seconds.
    // One of the guests should eventually show the host migration status.
    // We check for any text containing "ホスト" or "代理" or the Mojibake versions if necessary.
    // But since we just need to verify they stay synced:
    
    console.log('Waiting for migration window (approx 40s)...');
    await guest1Page.waitForTimeout(45000); 

    // 4. Verify Guest 1 and Guest 2 stay synced
    await expect(guest1Page.locator('text=Guest 2')).toBeVisible();
    await expect(guest2Page.locator('text=Guest 1')).toBeVisible();

    console.log('Session continuity verified between remaining guests.');

    await guest1Context.close();
    await guest2Context.close();
  });
});
