import {
  RequestInit as NodeRequestInit,
  default as nodeFetch,
} from "node-fetch";
import { isBrowser } from "./common";

const __fetch = (url: string, options: RequestInit | NodeRequestInit = {}) =>
  isBrowser
    ? fetch(url, <RequestInit>options)
    : nodeFetch(url, <NodeRequestInit>options);

export default __fetch;
