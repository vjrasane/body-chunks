import { BodyReader, ReadResult } from "./reader";
import { Response as NodeResponse } from "node-fetch";
import { isNil } from "../common";

const noOp = () => {};
class NodeBodyReader extends BodyReader {
  watch: (value: string | Buffer) => void = noOp;
  cache: (string | Buffer)[] = [];
  constructor(response: NodeResponse) {
    super(response);
    response.body.on("readable", () => {
      if (this.closed) return;
      const value = response.body.read();
      this.pushCache(value);
    });
  }

  protected readChunk = async (): Promise<ReadResult> => {
    const { done, value } = await new Promise<ReadResult>((resolve) => {
      if (this.cache.length || this.closed) {
        resolve(this.shiftCache());
      } else {
        this.watch = () => {
          resolve(this.shiftCache());
          this.watch = noOp;
        };
      }
    });
    return { done, value };
  };

  private pushCache = (value: string | Buffer) => {
    this.cache.push(value);
    this.watch(value);
  };

  private shiftCache = () => {
    const value = this.cache.length && this.cache.shift();
    return { done: isNil(value), value };
  };
}

export default NodeBodyReader;
