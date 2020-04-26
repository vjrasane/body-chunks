import BrowserBodyReader from "./browser";
import NodeBodyReader from "./node";
import { BodyReader } from "./reader";
import {
  RequestInit as NodeRequestInit,
  default as nodeFetch,
} from "node-fetch";
import { isNode, isBrowser } from "../environment";

const getBodyReader = async (
  url: string,
  options: RequestInit | NodeRequestInit = {}
): Promise<BodyReader> => {
  if (isBrowser())
    return new BrowserBodyReader(await fetch(url, <RequestInit>options));
  if (isNode())
    return new NodeBodyReader(await nodeFetch(url, <NodeRequestInit>options));
  throw new Error(
    "Unsupported JavaScript environment, expected one of: node, browser"
  );
};

export { getBodyReader, BodyReader };
