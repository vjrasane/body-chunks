import app from "./server";
import get from "../src";
import { first, last } from "lodash";
import { Progress } from "../src/common";
import Blob from "cross-blob";

const port = 9000;

jest.mock("browser-or-node", () => ({
  isNode: true,
  isBrowser: false,
}));

const getBytes = (bytes: number) =>
  get(`http://localhost:${port}/download/${bytes}`);

describe("node fetch", () => {
  let server;
  beforeAll(() => {
    server = app.listen(port);
  });

  it("receives empty chunk", async () => {
    const reader = await getBytes(0);
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    const data = await reader.read();

    const { calls } = progressHandler.mock;
    expect(calls.length).toEqual(1);

    const initial: Progress = first(first(calls));
    const final: Progress = first(last(calls));

    expect(initial.bytes.total).toBe(0);
    expect(initial.bytes.received).toBe(0);
    expect(initial.chunks.length).toBe(0);

    expect(final.bytes.total).toBe(0);
    expect(final.bytes.received).toBe(0);
    expect(final.chunks.length).toBe(0);

    expect(new Blob(data).size).toBe(0);
  });

  it("receives chunk of size 1024", async () => {
    const reader = await getBytes(1024);
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    const data = await reader.read();

    const { calls } = progressHandler.mock;
    expect(calls.length).toEqual(2);

    const initial: Progress = first(first(calls));
    const final: Progress = first(last(calls));

    expect(initial.bytes.total).toBe(1024);
    expect(initial.bytes.received).toBe(0);
    expect(initial.chunks.length).toBe(0);

    expect(final.bytes.total).toBe(1024);
    expect(final.bytes.received).toBe(1024);
    expect(final.chunks.length).toBe(1);

    expect(new Blob(data).size).toBe(1024);
  });

  it("receives chunk of ~max size 65415", async () => {
    const reader = await getBytes(65415);
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    const data = await reader.read();

    const { calls } = progressHandler.mock;
    expect(calls.length).toEqual(2);

    const initial: Progress = first(first(calls));
    const final: Progress = first(last(calls));

    expect(initial.bytes.total).toBe(65415);
    expect(initial.bytes.received).toBe(0);
    expect(initial.chunks.length).toBe(0);

    expect(final.bytes.total).toBe(65415);
    expect(final.bytes.received).toBe(65415);
    expect(final.chunks.length).toBe(1);

    expect(new Blob(data).size).toBe(65415);
  });

  it("receives multiple chunks", async () => {
    const total = 65415 * 5;
    const reader = await getBytes(total);
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    const data = await reader.read();

    const { calls } = progressHandler.mock;
    expect(calls.length).toEqual(6);

    const initial: Progress = first(first(calls));
    const final: Progress = first(last(calls));

    expect(initial.bytes.total).toBe(total);
    expect(initial.bytes.received).toBe(0);
    expect(initial.chunks.length).toBe(0);

    expect(final.bytes.total).toBe(total);
    expect(final.bytes.received).toBe(total);
    expect(final.chunks.length).toBe(5);

    expect(new Blob(data).size).toBe(total);
  });

  it("does not receive chunks if cancelled", async () => {
    const total = 65415 * 5;
    const reader = await getBytes(total);
    const progressHandler = jest.fn();
    reader.onProgress(progressHandler);

    await reader.cancel();

    const data = await reader.read();

    expect(progressHandler).not.toHaveBeenCalled();
    expect(data.length).toBe(0);
  });

  afterAll(() => {
    server.close();
  });
});
