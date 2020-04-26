import { Response as NodeResponse } from "node-fetch";
import BrowserBodyReader from "./browser";
import NodeBodyReader from "./node";
import { BodyReader } from "./reader";
import { isBrowser } from "../common";

const getBodyReader = (response: Response | NodeResponse): BodyReader =>
  isBrowser
    ? new BrowserBodyReader(<Response>response)
    : new NodeBodyReader(<NodeResponse>response);

export { getBodyReader, BodyReader };
