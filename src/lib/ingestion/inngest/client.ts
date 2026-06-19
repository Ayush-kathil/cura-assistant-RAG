import { Inngest } from "inngest";
import { Events } from "./events";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "cura-ingestion-engine" });
