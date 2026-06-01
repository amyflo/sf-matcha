import { requireNetlifyEnv } from "@/lib/netlify-env";
import Exa from "exa-js";

function getExaClient(): Exa {
  return new Exa(requireNetlifyEnv("EXA_API_KEY"));
}

let client: Exa | null = null;

export function exa(): Exa {
  if (!client) {
    client = getExaClient();
  }
  return client;
}
