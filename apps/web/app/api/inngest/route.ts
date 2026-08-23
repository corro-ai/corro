import { serve } from "inngest/next";
import { inngest } from "../../../src/inngest/client";
import { processTranscript, generateOpportunitiesAndBriefs } from "../../../src/inngest/function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTranscript, generateOpportunitiesAndBriefs],
});
