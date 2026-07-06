import { BadRequestError } from "./errors";

export interface ParamsDictionary {
  [key: string]: string | string[];
  [key: number]: string;
}

export function getIntegerQueryParam(
  query: qs.ParsedQs,
  property: string,
  options: { min?: number; max?: number },
): number;

export function getIntegerQueryParam<T>(
  query: qs.ParsedQs,
  property: string,
  options: { min?: number; max?: number; default: T },
): number | T;

export function getIntegerQueryParam<T>(
  query: qs.ParsedQs,
  property: string,
  options: {
    min?: number;
    max?: number;
    default?: T;
  } = {},
): number | T {
  if (
    typeof query[property] === "undefined" &&
    typeof options.default !== "undefined"
  ) {
    return options.default;
  }

  let value = 0;

  if (
    typeof query[property] !== "string" ||
    isNaN((value = parseInt(query[property], 10)))
  ) {
    throw new BadRequestError(
      `Query parameter '${property}' needs to be an integer`,
    );
  }

  if (typeof options.max === "number" && value > options.max) {
    throw new BadRequestError(
      `Query parameter '${property}' can't be bigger than ${options.max}`,
    );
  }

  if (typeof options.min === "number" && value < options.min) {
    throw new BadRequestError(
      `Query parameter '${property}' can't be smaller than ${options.min}`,
    );
  }

  return value;
}
