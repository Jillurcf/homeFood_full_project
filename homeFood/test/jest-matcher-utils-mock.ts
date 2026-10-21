import { format as prettyFormat } from "pretty-format";

const identity = (value: string) => value;

export const EXPECTED_COLOR = identity;
export const RECEIVED_COLOR = identity;
export const INVERTED_COLOR = identity;
export const BOLD_WEIGHT = identity;
export const DIM_COLOR = identity;

export function stringify(value: unknown, maxDepth = 10, maxWidth = 80): string {
  return prettyFormat(value, { maxDepth, min: true, printFunctionName: false })
    .slice(0, maxWidth);
}

export function printReceived(value: unknown): string {
  return RECEIVED_COLOR(stringify(value));
}

export function printExpected(value: unknown): string {
  return EXPECTED_COLOR(stringify(value));
}

export function printWithType(
  name: string,
  value: unknown,
  print: (value: unknown) => string,
): string {
  const type = value === null ? "null" : typeof value;
  return `${name} has type:  ${type}\n${name} has value: ${print(value)}`;
}

export function matcherHint(
  matcherName = "matcher",
  received = "received",
  expected = "expected",
  options: { isNot?: boolean; promise?: string; comment?: string } = {},
): string {
  const not = options.isNot ? ".not" : "";
  const expectedPart = expected ? `(${expected})` : "";
  return `${matcherName}${not}(${received}${expectedPart})`;
}

export function diff(expected: string, received: string): string {
  return `- Expected: ${expected}\n+ Received: ${received}`;
}

export default {
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  INVERTED_COLOR,
  BOLD_WEIGHT,
  DIM_COLOR,
  stringify,
  printReceived,
  printExpected,
  printWithType,
  matcherHint,
  diff,
};
