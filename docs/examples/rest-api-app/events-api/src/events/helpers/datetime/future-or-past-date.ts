import { now } from "./now";

export const futureOrPastDate = (
  days: number | "today" | "yesterday" | "tomorrow",
  eod: boolean = false
): Date => {
  // today
  if (days === "today" || days === 0) {
    if (eod) {
      const date = now();
      return new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    } else {
      const date = now();
      return new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
    }
  }

  // yesterday
  if (days === "yesterday" || days === -1) {
    if (eod) {
      const yesterdayDate = new Date(now().getTime() - 24 * 60 * 60 * 1000);
      return new Date(
        Date.UTC(
          yesterdayDate.getUTCFullYear(),
          yesterdayDate.getUTCMonth(),
          yesterdayDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    } else {
      const yesterdayDate = new Date(now().getTime() - 24 * 60 * 60 * 1000);
      return new Date(
        Date.UTC(
          yesterdayDate.getUTCFullYear(),
          yesterdayDate.getUTCMonth(),
          yesterdayDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
    }
  }

  // tomorrow
  if (days === "tomorrow" || days === 1) {
    if (eod) {
      const tomorrowDate = new Date(now().getTime() + 24 * 60 * 60 * 1000);
      return new Date(
        Date.UTC(
          tomorrowDate.getUTCFullYear(),
          tomorrowDate.getUTCMonth(),
          tomorrowDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    } else {
      const tomorrowDate = new Date(now().getTime() + 24 * 60 * 60 * 1000);
      return new Date(
        Date.UTC(
          tomorrowDate.getUTCFullYear(),
          tomorrowDate.getUTCMonth(),
          tomorrowDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
    }
  }

  // future or past date
  if (typeof days === "number") {
    if (eod) {
      const futureOrPastDate = new Date(
        now().getTime() + days * 24 * 60 * 60 * 1000
      );
      return new Date(
        Date.UTC(
          futureOrPastDate.getUTCFullYear(),
          futureOrPastDate.getUTCMonth(),
          futureOrPastDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    } else {
      const futureOrPastDate = new Date(
        now().getTime() + days * 24 * 60 * 60 * 1000
      );
      return new Date(
        Date.UTC(
          futureOrPastDate.getUTCFullYear(),
          futureOrPastDate.getUTCMonth(),
          futureOrPastDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
    }
  }

  throw new Error("Invalid date");
};
