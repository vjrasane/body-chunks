import createError from "http-errors";
import { getBodyReader, BodyReader } from "./body-reader";
import { RequestInit as NodeRequestInit } from "node-fetch";
import __fetch from "./fetch";

const get = async (
  url: string,
  options?: NodeRequestInit | RequestInit
): Promise<BodyReader> => {
  const response = await __fetch(url, options);
  if (!response.ok)
    throw createError(response.status, response.statusText, {
      headers: response.headers,
    });

  return getBodyReader(response);
};

export { BodyReader };
export default get;
