import get from "../src";
import createError from "http-errors";
import { isNode, isBrowser } from "../src/environment";
import BrowserBodyReader from "../src/body-reader/browser";

jest.mock("../src/environment", () => ({
  isNode: jest.fn().mockImplementation(() => false),
  isBrowser: jest.fn().mockImplementation(() => true),
}));

describe("request", () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  })

  beforeEach(() => {
    global.fetch.mockClear();
  });

  it("rejects if request is not ok", async () => {
    global.fetch.mockImplementationOnce(() => ({
      ok: false,
      status: 420,
      statusText: "status",
    }));

    const promise = get("/");

    await expect(promise).rejects.toThrowErrorMatchingSnapshot();
  });

  it("passes request init to fetch", async () => {
    const response = {
      ok: true,
      body: {
        getReader: jest.fn(),
      },
      headers: new Headers({
        "Content-Length": 100,
      }),
    };

    global.fetch.mockImplementationOnce(() => response);

    const requestInit = {};
    const promise = get("/url", requestInit);

    const {
      calls: [[url, opts]],
    } = global.fetch.mock;
    expect(url).toEqual("/url");
    expect(opts).toBe(requestInit);

    await expect(promise).resolves.toBeInstanceOf(BrowserBodyReader);
  });

  it("throws error in unknown environment", async () => {
    isBrowser.mockImplementationOnce(() => false);

    const promise = get("/url");

    await expect(promise).rejects.toThrowErrorMatchingSnapshot();
  });

  afterAll(() => {
    global.fetch = undefined;
  })
});
