import { BodyReader, ReadResult } from "./reader";

class BrowserBodyReader extends BodyReader {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  constructor(response: Response) {
    super(parseInt(response.headers.get("Content-Length"), 10));
    this.reader = response.body.getReader();
  }

  protected readChunk = async (): Promise<ReadResult> => {
    const { done, value } = await this.reader.read();
    return { done, value };
  };

  cancel = async (): Promise<void> => {
    super.cancel();
    await this.reader.cancel();
  };
}

export default BrowserBodyReader;
