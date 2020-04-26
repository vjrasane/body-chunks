import get from "../src";
import nodeFetch from "node-fetch";

jest.mock("node-fetch", () => jest.fn());
jest.useFakeTimers();

const nodeResponse = (ok, length, values) => ({
  ok: true,
  headers: new Headers({
    "Content-Length": length,
  }),
  body: {
    on: (event, callback) => {
      let times = values.length;
      const interval = setInterval(() => {
        if (times <= 0) clearInterval(interval);
        else {
          times--;
          callback();
        }
      }, 100);
    },
    read: () => {
      const value = values.shift();
      return value ?  { length: value } :  value;
    },
  },
});

describe("reader", () => {
  it("can read chunks even after delay", async () => {
    nodeFetch.mockImplementationOnce(() =>
      nodeResponse(true, 100, [20, 30, 10, 40])
    );
    const reader = await get("url");
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    jest.advanceTimersByTime(400);

    const data = await reader.read();

    expect(progressHandler.mock.calls).toMatchSnapshot();
    expect(data.map((d) => d.length)).toEqual([20, 30, 10, 40]);
  });

  it("does not receive chunks if cancelled", async () => {
    nodeFetch.mockImplementationOnce(() =>
      nodeResponse(true, 100, [20, 30, 10, 40])
    );
    const reader = await get("url");
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    await reader.cancel();

    jest.advanceTimersByTime(400);

    const data = await reader.read();

    expect(progressHandler).not.toHaveBeenCalled();
    expect(data.length).toBe(0);
  });

  it("calls noop if not reading yet", async () => {
    nodeFetch.mockImplementationOnce(() =>
      nodeResponse(true, 100, [20, 30, 10, 40])
    );
    const reader = await get("url");
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    jest.advanceTimersByTime(400);

    expect(progressHandler).not.toHaveBeenCalled();

    const data = await reader.read();

    expect(progressHandler.mock.calls).toMatchSnapshot();
    expect(data.map((d) => d.length)).toEqual([20, 30, 10, 40]);
  });

  it("stops if chunk is nil", async () => {
    nodeFetch.mockImplementationOnce(() =>
      nodeResponse(true, 100, [20, 30, 10, undefined, 40])
    );
    const reader = await get("url");
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    jest.advanceTimersByTime(400);

    const data = await reader.read();

    expect(progressHandler.mock.calls).toMatchSnapshot();
    expect(data.map((d) => d.length)).toEqual([20, 30, 10]);
  });
});
