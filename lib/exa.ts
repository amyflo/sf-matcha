import Exa from "exa-js";

function getExaClient(): Exa {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("EXA_API_KEY is not set");
  }
  return new Exa(apiKey);
}

let client: Exa | null = null;

export function exa(): Exa {
  if (!client) {
    client = getExaClient();
  }
  return client;
}
