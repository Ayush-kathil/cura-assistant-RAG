import { serve } from "inngest/next";
import { inngest } from "../../../lib/ingestion/inngest/client";
import { processDocumentWorkflow } from "../../../lib/ingestion/inngest/functions/processDocument";
import { extractGraphWorkflow } from "../../../lib/ingestion/inngest/functions/extractGraph";
import { processDocumentChunking } from "../../../lib/inngest/functions";

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processDocumentWorkflow,
    extractGraphWorkflow,
    processDocumentChunking
  ],
});
