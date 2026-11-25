import { expect, test } from "@playwright/test";
import { TINY_PNG, login, stamp } from "./helpers";

test.describe("admin create, update, and delete", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("events, image upload, public RSVP, reminder, and delete", async ({ page }) => {
    test.setTimeout(120_000);
    const id = stamp();
    const title = `E2E Gathering ${id}`;
    const updated = `${title} updated`;

    await page.goto("/admin/events/new");
    await page.locator('input[name="title"]').fill(title);
    await page.locator('textarea[name="description"]').fill("Bring a friend.");
    await page.locator('input[name="startsAt"]').fill("2026-12-20T09:00");
    await page.locator('input[name="location"]').fill("Main sanctuary");
    await page.locator('input[name="image"]').setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not an image"),
    });
    await page.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByText(/image could not be uploaded|Use a JPG/i)).toBeVisible();

    await page.locator('input[name="title"]').fill(title);
    await page.locator('textarea[name="description"]').fill("Bring a friend.");
    await page.locator('input[name="startsAt"]').fill("2026-12-20T09:00");
    await page.locator('input[name="location"]').fill("Main sanctuary");
    await page.locator('input[name="image"]').setInputFiles({
      name: "event.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });
    await page.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByText("Event created.")).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();

    await page.locator("tr", { hasText: title }).getByRole("link", { name: "Manage" }).click();
    await page.waitForURL(/\/admin\/events\/(?!new$)[^/]+$/, { timeout: 45_000 });
    await expect(page.locator("img.h-32")).toBeVisible();
    await page.locator('input[name="title"]').fill(updated);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Event updated.")).toBeVisible();

    await page.goto("/events");
    await expect(page.getByText(updated)).toBeVisible();
    const rsvp = page.locator("section").filter({ hasText: updated }).last();
    await rsvp.getByLabel("First name").fill("Rsvp");
    await rsvp.getByLabel("Last name").fill("Person");
    await rsvp.getByRole("button", { name: "I'll be there" }).click();
    await expect(page.getByText("Please enter your name and at least an email or phone number.")).toBeVisible();

    const rsvpAgain = page.locator("section").filter({ hasText: updated }).last();
    await rsvpAgain.getByLabel("First name").fill("Rsvp");
    await rsvpAgain.getByLabel("Last name").fill("Person");
    const rsvpEmail = `rsvp-${id}@example.com`;
    await rsvpAgain.getByLabel(/Email/).fill(rsvpEmail);
    await rsvpAgain.getByRole("button", { name: "I'll be there" }).click();
    await expect(page.getByText("Thanks for your RSVP")).toBeVisible();

    await page.goto("/admin/events");
    await page.locator("tr", { hasText: updated }).getByRole("link", { name: "Manage" }).click();
    await page.waitForURL(/\/admin\/events\/(?!new$)[^/]+$/);
    await expect(page.getByText("Rsvp Person")).toBeVisible();
    await page.getByRole("button", { name: "Send event reminder" }).click();
    await expect(page.getByText("Event reminder queued and logged.")).toBeVisible();

    await page.goto("/admin/notifications");
    await expect(page.getByText(rsvpEmail)).toBeVisible();
    await expect(page.getByText("Skipped").first()).toBeVisible();

    await page.goto("/admin/events");
    await page.locator("tr", { hasText: updated }).getByRole("link", { name: "Manage" }).click();
    await page.waitForURL(/\/admin\/events\/(?!new$)[^/]+$/);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete event" }).click();
    await expect(page.getByText("Event deleted.")).toBeVisible();
    await expect(page.getByText(updated)).toHaveCount(0);
  });

  test("groups can be created, updated, and deleted", async ({ page }) => {
    const name = `E2E Circle ${stamp()}`;
    await page.goto("/admin/groups/new");
    await page.locator('input[name="name"]').fill(name);
    await page.locator('select[name="type"]').selectOption("MINISTRY");
    await page.locator('input[name="meetsWhen"]').fill("Wednesdays 18:00");
    await page.getByRole("button", { name: "Create group" }).click();
    await expect(page.getByText("Group created.")).toBeVisible();

    await page.locator('textarea[name="description"]').fill("A test ministry circle.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Group updated.")).toBeVisible();

    await page.locator('textarea[name="body"]').fill("");
    await page.locator('textarea[name="body"]').evaluate((element) => {
      (element as HTMLTextAreaElement).required = false;
    });
    await page.getByRole("button", { name: "Send to group members" }).click();
    await expect(page.getByText("Please enter a message before sending.")).toBeVisible();

    await page.locator('textarea[name="body"]').fill("Hello circle");
    await page.getByRole("button", { name: "Send to group members" }).click();
    await expect(page.getByText("No group members have contact details")).toBeVisible();

    await page.getByRole("button", { name: "Delete group" }).click();
    await expect(page).toHaveURL(/\/admin\/groups\?success=deleted/);
    await expect(page.getByText("Group deleted.")).toBeVisible();
    await expect(page.getByRole("cell", { name, exact: true })).toHaveCount(0);
  });

  test("sermons can be created, updated, published, and deleted", async ({ page }) => {
    const title = `E2E Sermon ${stamp()}`;
    await page.goto("/admin/sermons/new");
    await page.locator('input[name="title"]').fill(title);
    await page.locator('input[name="speaker"]').fill("Bishop Harrison Sakala");
    await page.locator('input[name="date"]').fill("2026-11-01");
    await page.locator('input[name="mediaUrl"]').fill("https://example.com/e2e-sermon.mp4");
    await page.locator('select[name="mediaType"]').selectOption("VIDEO");
    await page.getByRole("button", { name: "Publish sermon" }).click();
    await expect(page.getByText("Sermon saved.")).toBeVisible();

    await page.goto("/sermons");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.goto("/admin/sermons");
    await page.locator("tr", { hasText: title }).getByRole("link", { name: "Edit" }).click();
    await page.waitForURL(/\/admin\/sermons\/[^/]+$/);
    await page.locator('input[name="speaker"]').fill("Guest speaker");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Sermon saved.")).toBeVisible();

    await page.getByRole("button", { name: "Delete sermon" }).click();
    await expect(page.getByText("Sermon deleted.")).toBeVisible();
    await page.goto("/sermons");
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test("members and households can be recorded and a household removed", async ({ page }) => {
    const id = stamp();
    const firstName = `Member${id}`;
    await page.goto("/admin/members/new");
    await page.locator('input[name="firstName"]').fill(firstName);
    await page.locator('input[name="lastName"]').fill("Tester");
    await page.locator('input[name="email"]').fill(`member-${id}@example.com`);
    await page.locator('input[name="phone"]').fill("0977123456");
    const campus = page.locator('select[name="campusId"] option').nth(1);
    const campusValue = await campus.getAttribute("value");
    expect(campusValue).toBeTruthy();
    await page.locator('select[name="campusId"]').selectOption(campusValue!);
    await page.getByRole("button", { name: "Create member" }).click();
    await expect(page.getByText("Member created.")).toBeVisible();
    await expect(page.getByText(/Membership #/)).toBeVisible();

    await page.locator('input[name="phone"]').fill("0966123456");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Member updated.")).toBeVisible();

    const household = `E2E Home ${id}`;
    await page.goto("/admin/households/new");
    await page.locator('input[name="name"]').fill(household);
    await page.getByRole("button", { name: "Create household" }).click();
    await expect(page.getByText("Household created.")).toBeVisible();
    await expect(page.getByRole("heading", { name: `${household} Household` })).toBeVisible();

    await page.locator('input[name="name"]').fill(`${household} Updated`);
    await page.getByRole("button", { name: "Save name" }).click();
    await expect(page.getByText("Household name saved.")).toBeVisible();

    const memberOption = page.locator('select[name="memberId"] option', { hasText: firstName });
    if ((await memberOption.count()) > 0) {
      const memberId = await memberOption.first().getAttribute("value");
      await page.locator('select[name="memberId"]').selectOption(memberId!);
      await page.getByRole("button", { name: "Attach member" }).click();
      await expect(page.getByText("Member attached to this household.")).toBeVisible();
      await page.getByRole("button", { name: "Remove" }).first().click();
      await expect(page.getByText("Member removed from this household.")).toBeVisible();
    }

    await page.getByRole("button", { name: "Delete household" }).click();
    await expect(page.getByText("Household removed.")).toBeVisible();
  });

  test("manual giving is recorded while online payments stay off", async ({ page }) => {
    const id = stamp();
    await page.goto("/admin/finance");
    await expect(page.getByText("Online giving is turned off")).toBeVisible();
    await page.getByRole("link", { name: "Record giving" }).click();
    await page.locator('input[name="amount"]').fill("0");
    await page.getByRole("button", { name: "Save transaction" }).click();
    const blocked = await page.locator('input[name="amount"]').evaluate((element) => {
      return (element as HTMLInputElement).validity.rangeUnderflow || (element as HTMLInputElement).validity.rangeOverflow;
    });
    expect(blocked).toBeTruthy();

    await page.locator('select[name="source"]').selectOption("IN_PERSON");
    await page.locator('input[name="amount"]').fill("42.50");
    await page.locator('input[name="purpose"]').fill(`E2E offering ${id}`);
    await page.locator('input[name="payerName"]').fill(`E2E Giver ${id}`);
    await page.getByRole("button", { name: "Save transaction" }).click();
    await expect(page.getByText(`E2E Giver ${id}`)).toBeVisible();
    await expect(page.getByText(`E2E offering ${id}`)).toBeVisible();
    await expect(page.getByText("Successful")).toBeVisible();
    await expect(page.getByText("In person")).toBeVisible();
  });

  test("attendance records service and cell counts", async ({ page }) => {
    const id = stamp();
    await page.goto("/admin/attendance");
    const serviceForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Save service attendance" }) });
    await serviceForm.locator('input[name="serviceDate"]').fill("2026-11-22");
    await serviceForm.locator('input[name="serviceName"]').fill(`E2E Service ${id}`);
    await serviceForm.locator('input[name="menCount"]').fill("12");
    await serviceForm.locator('input[name="womenCount"]').fill("18");
    await serviceForm.getByRole("button", { name: "Save service attendance" }).click();
    await expect(page.getByText("Service attendance saved.")).toBeVisible();
    await expect(page.getByText(`E2E Service ${id}`)).toBeVisible();

    const cellForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Save cell attendance" }) });
    const groupValue = await cellForm.locator('select[name="groupId"] option').nth(1).getAttribute("value");
    expect(groupValue).toBeTruthy();
    await cellForm.locator('select[name="groupId"]').selectOption(groupValue!);
    await cellForm.locator('input[name="meetingDate"]').fill("2026-11-18");
    await cellForm.locator('input[name="presentCount"]').fill("7");
    await cellForm.getByRole("button", { name: "Save cell attendance" }).click();
    await expect(page.getByText("Cell group attendance saved.")).toBeVisible();
    await expect(page.getByText("Present: 7").first()).toBeVisible();
  });

  test("reports and notification pages load", async ({ page }) => {
    await page.goto("/admin/reports");
    await expect(page.getByRole("heading", { name: /Reports & analytics/ })).toBeVisible();
    await page.goto("/admin/reports/visitors");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/admin/reports/groups");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/admin/notifications");
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  });
});
