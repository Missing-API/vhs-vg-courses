#!/usr/bin/env tsx

import { fetchCourseDetails } from "./src/clients/vhs-website/fetch-course-details";

async function debug() {
  try {
    console.log("Fetching course details for 252P41701...");
    const details = await fetchCourseDetails("252P41701");
    
    console.log("Course details:");
    console.log("Title:", details.title);
    console.log("Schedule length:", details.schedule.length);
    console.log("Schedule sample:", JSON.stringify(details.schedule.slice(0, 2), null, 2));
    
    console.log("\nFetching course details for 252A21003...");
    const details2 = await fetchCourseDetails("252A21003");
    
    console.log("Course details:");
    console.log("Title:", details2.title);
    console.log("Schedule length:", details2.schedule.length);
    console.log("Schedule sample:", JSON.stringify(details2.schedule.slice(0, 2), null, 2));
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debug();
