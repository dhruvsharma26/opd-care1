import mongoose from "mongoose";
import WebSocket from "ws";
import { DailyHeadcount, HOURLY_HEADCOUNT_BUCKETS } from "../models/index.js";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";

const cloneHourlyBuckets = (buckets = HOURLY_HEADCOUNT_BUCKETS) =>
  buckets.map((entry) =>
    typeof entry === "string" ? { h: entry, count: 0 } : { h: entry.h, count: entry.count || 0 },
  );

const datePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
});

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  hour: "numeric",
  hour12: true,
});

const getDateKey = (date = new Date()) => {
  const parts = datePartsFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
};

const getWeekday = (date = new Date()) => weekdayFormatter.format(date);

const formatHourBucket = (date = new Date()) => {
  const parts = hourFormatter.formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value;
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value || "AM";
  return `${Number(hour)}${dayPeriod.toLowerCase().startsWith("p") ? "p" : "a"}`;
};

const createDateValue = () => {
  const now = new Date();
  return new Date(
    now.toLocaleString("en-US", {
      timeZone: APP_TIMEZONE,
    }),
  );
};

const normalizeBuckets = (buckets = []) => {
  const bucketMap = new Map(
    buckets.map((entry) => [entry.h, { h: entry.h, count: Number(entry.count) || 0 }]),
  );
  return cloneHourlyBuckets().map((entry) => bucketMap.get(entry.h) || entry);
};

export let opdHeadcount = cloneHourlyBuckets();
export let totalFootfall = 0;
export let currentCount = 0;
let lastObservedCount = 0;
let lastWsPayload = null;
let lastProcessedMeta = null;

let activeDateKey = getDateKey();
let persistQueue = Promise.resolve();
let lastPersistedSignature = "";

const buildSnapshotSignature = () =>
  JSON.stringify({
    activeDateKey,
    currentCount,
    totalFootfall,
    footfallByHour: opdHeadcount.map((entry) => entry.count),
  });

const syncStateFromDocument = (doc) => {
  if (!doc) return;
  activeDateKey = doc.dateKey || getDateKey();
  currentCount = doc.currentCount || 0;
  lastObservedCount = currentCount;
  totalFootfall = doc.totalHeadcount || 0;
  opdHeadcount = normalizeBuckets(doc.footfallByHour);
  lastPersistedSignature = buildSnapshotSignature();
};

const resetInMemoryState = (date = new Date()) => {
  activeDateKey = getDateKey(date);
  currentCount = 0;
  totalFootfall = 0;
  opdHeadcount = cloneHourlyBuckets();
  lastObservedCount = 0;
  lastPersistedSignature = "";
};

const syncHeadcountStateFromDb = async () => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const today = getDateKey();
    const todayDoc = await DailyHeadcount.findOne({ dateKey: today }).lean();
    if (todayDoc) {
      syncStateFromDocument(todayDoc);
    } else {
      resetInMemoryState();
    }
  } catch (error) {
    console.error("Failed to hydrate headcount state:", error.message);
  }
};

const ensureCurrentDayState = async () => {
  const today = getDateKey();
  if (today === activeDateKey) return;

  if (mongoose.connection.readyState === 1) {
    try {
      const todayDoc = await DailyHeadcount.findOne({ dateKey: today }).lean();
      if (todayDoc) {
        syncStateFromDocument(todayDoc);
        return;
      }
    } catch (error) {
      console.error("Failed to load daily headcount after date rollover:", error.message);
    }
  }

  resetInMemoryState();
};

const persistCurrentState = () => {
  const snapshotSignature = buildSnapshotSignature();
  if (snapshotSignature === lastPersistedSignature) {
    return persistQueue;
  }

  persistQueue = persistQueue
    .then(async () => {
      if (mongoose.connection.readyState !== 1) return;

      await DailyHeadcount.findOneAndUpdate(
        { dateKey: activeDateKey },
        {
          $set: {
            date: createDateValue(),
            weekday: getWeekday(),
            currentCount,
            totalHeadcount: totalFootfall,
            footfallByHour: normalizeBuckets(opdHeadcount),
          },
          $setOnInsert: {
            dateKey: activeDateKey,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      lastPersistedSignature = snapshotSignature;
    })
    .catch((error) => {
      console.error("Failed to persist headcount state:", error.message);
    });

  return persistQueue;
};

export const getWeeklyHeadcountHistory = async () => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  const records = await DailyHeadcount.find({})
    .sort({ date: -1, createdAt: -1 })
    .limit(7)
    .lean();

  return records.reverse().map((entry) => ({
    dateKey: entry.dateKey,
    weekday: entry.weekday,
    totalHeadcount: entry.totalHeadcount || 0,
  }));
};

export const getHeadcountDebugSnapshot = () => ({
  timezone: APP_TIMEZONE,
  activeDateKey,
  currentCount,
  totalFootfall,
  lastObservedCount,
  lastWsPayload,
  lastProcessedMeta,
  footfallByHour: opdHeadcount,
});

if (mongoose.connection.readyState === 1) {
  syncHeadcountStateFromDb();
} else {
  mongoose.connection.once("connected", syncHeadcountStateFromDb);
}

const connectWebSocket = () => {
  console.log("Trying to connect to YOLO WS...");

  const socket = new WebSocket("ws://localhost:8000/ws");

  socket.on("open", () => {
    console.log("Connected to YOLO WebSocket");
  });

  socket.on("message", async (message) => {
    try {
      await ensureCurrentDayState();

      const data = JSON.parse(message);
      const count = Number(data.count) || 0;
      let increment = Number(data.increment) || 0;
      const sourceIncrement = Number(data.increment);

      // Some YOLO streams only publish current count. If increment is missing/zero,
      // derive arrivals from positive count deltas so hourly footfall keeps updating.
      if (increment <= 0) {
        increment = Math.max(0, count - lastObservedCount);
      }

      currentCount = count;
      lastObservedCount = count;

      if (increment > 0) {
        totalFootfall += increment;

        const currentHour = formatHourBucket();
        opdHeadcount = opdHeadcount.map((entry) =>
          entry.h === currentHour ? { ...entry, count: entry.count + increment } : entry,
        );
      }

      lastWsPayload = {
        ...data,
        receivedAt: new Date().toISOString(),
      };
      lastProcessedMeta = {
        count,
        sourceIncrement: Number.isFinite(sourceIncrement) ? sourceIncrement : null,
        appliedIncrement: increment,
        incrementMode: increment > 0 && (sourceIncrement <= 0 || !Number.isFinite(sourceIncrement))
          ? "derived_from_count_delta"
          : "source_increment",
        currentHour: formatHourBucket(),
      };

      await persistCurrentState();
    } catch (error) {
      console.log("Invalid WS data");
    }
  });

  socket.on("error", () => {
    console.log("YOLO not running (will retry...)");
  });

  socket.on("close", () => {
    console.log("WS closed. Retrying in 3 sec...");
    setTimeout(connectWebSocket, 3000);
  });
};

connectWebSocket();
