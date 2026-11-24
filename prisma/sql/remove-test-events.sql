-- Review placeholder events before deleting them.
-- Do not run this against production until the SELECT result is the test rows you expect.
--
-- Public site records this was written for (titles only; dates are whatever is stored):
--   TESTING EVENTS / description "Women's conference"
--   rops / description "rops"
--
-- Prisma table. RSVP rows cascade when the event is deleted.

SELECT id, title, description, "startsAt", "endsAt"
FROM "Event"
WHERE lower(btrim(title)) IN (
  'testing events',
  'testing event',
  'test events',
  'test event',
  'testing',
  'test',
  'rops',
  'lorem',
  'lorem ipsum',
  'placeholder',
  'placeholder text',
  'dummy',
  'asdf'
);

-- DELETE FROM "Event"
-- WHERE lower(btrim(title)) IN (
--   'testing events',
--   'testing event',
--   'test events',
--   'test event',
--   'testing',
--   'test',
--   'rops',
--   'lorem',
--   'lorem ipsum',
--   'placeholder',
--   'placeholder text',
--   'dummy',
--   'asdf'
-- );

-- Legacy Supabase table used only when Prisma is not configured.
-- SELECT id, title, description, starts_at, ends_at
-- FROM public.events
-- WHERE lower(btrim(title)) IN ('testing events', 'rops', 'test', 'testing', 'lorem ipsum');
