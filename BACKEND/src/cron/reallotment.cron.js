import cron from "node-cron";
import { AllotmentCycle } from "../models/allotementCycle.model.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running re-allotment check...");

  const now = new Date();

  const cycles = await AllotmentCycle.find({
    reAllotmentOpen: true,
    reAllotmentEndDate: { $lt: now }
  });

  for (let cycle of cycles) {
    cycle.reAllotmentOpen = false;
    await cycle.save();

    console.log("Closed re-allotment for cycle:", cycle._id);
  }
});