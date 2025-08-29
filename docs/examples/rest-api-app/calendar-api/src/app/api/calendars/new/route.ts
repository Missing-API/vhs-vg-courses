/**
 * @swagger
 * /api/calendars/new:
 *   post:
 *     summary: Returns a list of new calendars.
 *     description: Provides new calendars since the given point in time of active clients from the crm system.
 *     tags:
 *       - Calendars
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: since
 *         in: query
 *         description: The point in time in ISO-8601 in UTC.
 *         example: 2024-05-01T02:30:00Z
 *     responses:
 *       200:
 *         description: Calendars.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: No calendars found.
 *       500:
 *         description: Error. Maybe the crm system could not be reached.
 */
export async function GET() {
  const data = {
    debug: 'Jan',
  };

  return Response.json({ data });
}
