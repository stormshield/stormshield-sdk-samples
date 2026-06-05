import type { SeekableByteSource } from "sdsdk";
import { open } from "node:fs/promises";

/**
 * Implements {@link SeekableByteSource}.
 * SeekableByteSource is the interface for random-access byte sources. Implement this interface to allow the SDK to read a
 * ZTDF archive from any storage backend (filesystem, object storage, HTTP range requests, etc.)
 * without loading the entire file into memory.
 *
 * NodeFileSeekableSource provides random-access reads and streaming of a file on disk.
 */
export class NodeFileSeekableSource implements SeekableByteSource {
  private constructor(
    private readonly path: string,
    public readonly size: number,
  ) {}

  /**
   * Create a {@link NodeFileSeekableSource} from a filesystem path.
   * @param path - Absolute or relative path to the file.
   * @returns A promise resolving to an instance with the file size known.
   */
  static async fromPath(path: string): Promise<NodeFileSeekableSource> {
    const file = await open(path, "r");
    try {
      const stat = await file.stat();
      return new NodeFileSeekableSource(path, stat.size);
    } finally {
      await file.close();
    }
  }

  /**
   * Read a slice of the file.
   * @param offset - Byte offset from the start of the file.
   * @param length - Number of bytes to read.
   * @returns A Uint8Array containing the bytes actually read (may be smaller than `length` at EOF).
   */
  async read(offset: number, length: number): Promise<Uint8Array> {
    const file = await open(this.path, "r");
    try {
      const buffer = new Uint8Array(length);
      const { bytesRead } = await file.read(buffer, 0, length, offset);
      return buffer.subarray(0, bytesRead);
    } finally {
      await file.close();
    }
  }

  /**
   * Create a readable stream of a portion of the file.
   * @param offset - Starting byte offset.
   * @param length - Number of bytes to stream.
   * @returns A {@link ReadableStream} emitting Uint8Array chunks.
   */
  stream(offset: number, length: number): ReadableStream<Uint8Array> {
    const path = this.path;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        const file = await open(path, "r");
        try {
          const buffer = new Uint8Array(64 * 1024); // 64 KB chunks
          let position = offset;
          const end = offset + length;

          while (position < end) {
            const toRead = Math.min(end - position, buffer.length);
            const { bytesRead } = await file.read(buffer, 0, toRead, position);
            if (bytesRead === 0) {
              break;
            }
            controller.enqueue(buffer.slice(0, bytesRead));
            position += bytesRead;
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        } finally {
          await file.close();
        }
      },
    });
  }
}
