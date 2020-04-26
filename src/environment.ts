import { isBrowser as browser, isNode as node } from "browser-or-node";

const isBrowser = (): boolean => browser;
const isNode = (): boolean => node;

export { isBrowser, isNode };
