import { Progress, Listen, Output, OutputValue, isNil } from "../common";
import { Bus, Unsub } from "baconjs";
import { Response as NodeResponse } from "node-fetch";
import createError from "http-errors";

type ReadResult = {
  done: boolean;
  value?: OutputValue;
};

abstract class BodyReader {
  total: number;
  received: number = 0;
  chunks: Output = [];
  closed: boolean = false;
  progressBus = new Bus<Progress>();
  constructor(response: Response | NodeResponse) {
    if (!response.ok)
      throw createError(response.status, response.statusText, {
        headers: response.headers,
      });
    this.total = parseInt(response.headers.get("Content-Length"), 10);
  }

  get chunkSizes(): number[] {
    return this.chunks.map((d) => d.length);
  }

  get done(): boolean {
    return !isNil(this.total) && this.received >= this.total;
  }

  protected abstract readChunk: () => Promise<ReadResult>;

  private progress = ({ done, value }) => {
    if (!done) {
      this.received += value.length;
      this.chunks.push(value);
    }
  };

  private broadcast = () => {
    const { received, total } = this;
    this.progressBus.push({
      bytes: {
        received,
        total,
      },
      chunks: this.chunkSizes,
    });
  };

  onProgress = (listen: Listen): Unsub => this.progressBus.onValue(listen);

  async cancel(): Promise<void> {
    this.closed = true;
  }

  private __read = async (): Promise<Output> => {
    if (this.closed || this.done) return this.chunks;

    const { done, value } = await this.readChunk();
    this.progress({ done, value });
    this.broadcast();
    if (done) return this.chunks;

    return this.__read();
  };

  read = async (): Promise<Output> => {
    !this.closed && this.broadcast();
    await this.__read();
    return this.chunks;
  };
}

export { BodyReader, ReadResult };
