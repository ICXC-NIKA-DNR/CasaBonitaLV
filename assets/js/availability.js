/* ============================================================
   Casa Bonita LLC — availability.js

   THIS IS THE ONE FILE THAT NEEDS REGULAR UPDATING.

   The calendar on the site shows the next two weeks. Every weekday is
   assumed OPEN with the usual number of slots, so you do NOT need to
   add anything for a normal day. You only list the days that are
   different: full, partly booked, or closed.

   A stale calendar is worse than no calendar — if a customer books a
   day the site showed as open, that's a worse first impression than
   not showing availability at all. Update this when the schedule
   changes, and if keeping up with it becomes a chore, say so and the
   calendar can be removed in two minutes.

   HOW TO EDIT
   -----------
   Dates are YYYY-MM-DD. The number is how many slots are LEFT.
   0 means full. Delete a line once the date has passed — it is
   ignored automatically, but the file stays tidier.

     "2026-10-20": 0     ->  that day shows as Full
     "2026-10-21": 1     ->  shows "1 spot left"
     "2026-10-22": 2     ->  shows "2 spots"

   To close a day entirely (holiday, vacation), use "closed":

     "2026-11-26": "closed"
   ============================================================ */

window.CB_AVAILABILITY = {

  /* Normal slots per day, by weekday. 0 marks a day you never work.
     Sunday is index 0. */
  weekly: {
    0: 0,   /* Sunday    — closed */
    1: 3,   /* Monday    */
    2: 3,   /* Tuesday   */
    3: 3,   /* Wednesday */
    4: 3,   /* Thursday  */
    5: 3,   /* Friday    */
    6: 2    /* Saturday  */
  },

  /* Exceptions. Only the days that differ from the normal week.
     These are examples — replace them with real dates. */
  dates: {
    "2026-10-16": 1,
    "2026-10-17": 0,
    "2026-10-20": 0,
    "2026-10-23": 2,
    "2026-10-27": "closed"
  }
};
