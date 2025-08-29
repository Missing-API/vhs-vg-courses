/*
 * TODO: implemente a function to retrieve all organizers created after a certain point in time.
 *
 *     parameters:
 *       - name: since
 *         in: query
 *         description: The point in time in ISO-8601 in UTC.
 *         example: 2024-05-01T02:30:00Z
 *     responses:
 *       200:
 *         description: Organizers.
 *       400:
 *         description: Bad request. Maybe the since parameter is missing or not in ISO-8601 format.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: No organizers found.
 *       500:
 *         description: Error. Maybe the crm system could not be reached.
 */
