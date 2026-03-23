import { encoding_for_model } from "tiktoken";

const enc = encoding_for_model("gpt-4o-mini");

export function estimateTokens(text: string) {
  return enc.encode(text).length;
}
