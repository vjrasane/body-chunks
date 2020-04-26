import { BodyReader, ReadResult } from "./reader";

class BrowserBodyReader extends BodyReader {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  constructor(response: Response) {
    super(response);
    this.reader = response.body.getReader();
  }

  protected readChunk = async (): Promise<ReadResult> => {
    const { done, value } = await this.reader.read();
    return { done, value };
  };

  async cancel(): Promise<void> {
    super.cancel();
    await this.reader.cancel();
  }
}

export default BrowserBodyReader;
