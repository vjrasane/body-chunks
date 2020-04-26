import get from "../src";

jest.mock("../src/environment", () => ({
  isNode: () => false,
  isBrowser: () => true,
}));

jest.useFakeTimers();

const browserResponse = (length, values) => ({
  ok: true,
  headers: new Headers({
    "Content-Length": length,
  }),
  body: {
    getReader: () => ({
      read: () => {
        const value = values.shift();
        return { done: !!values.length, value: value || { length: value } };
      },
      cancel: jest.fn()
    }),
  },
});

describe("reader", () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  })

  it("can read chunks even after delay", async () => {
    fetch.mockImplementationOnce(() => browserResponse(100, [20, 30, 10, 40]));

    const reader = await get("/url");
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    jest.advanceTimersByTime(400);

    const data = await reader.read();

    expect(progressHandler.mock.calls).toMatchSnapshot();
    expect(data).toMatchSnapshot();
  });

  it("does not receive chunks if cancelled", async () => {
    fetch.mockImplementationOnce(() => browserResponse(100, [20, 30, 10, 40]));

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
    fetch.mockImplementationOnce(() => browserResponse(100, [20, 30, 10, 40]));

    const reader = await get("url");
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    jest.advanceTimersByTime(400);

    expect(progressHandler).not.toHaveBeenCalled();

    const data = await reader.read();

    expect(progressHandler.mock.calls).toMatchSnapshot();
    expect(data).toMatchSnapshot();
  });

  it("stops only when reader returns done", async () => {
    fetch.mockImplementationOnce(() =>
      browserResponse(100, [20, 30, 10, undefined, null, 0, {}, 40])
    );

    const reader = await get("url");
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    jest.advanceTimersByTime(400);

    const data = await reader.read();

    expect(progressHandler.mock.calls).toMatchSnapshot();
    expect(data).toMatchSnapshot();
  });

  afterAll(() => {
    global.fetch = undefined;
  })
});
