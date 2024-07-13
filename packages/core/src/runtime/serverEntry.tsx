import { Writable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { App } from "./App";

type AppRenderResult = {
  appHtml: string;
  pageData: object;
};

export async function render(pathname: string): Promise<AppRenderResult> {
  const helmetContext = {};
  const writableStream = new WritableAsPromise();

  const { pipe } = renderToPipeableStream(
    <StaticRouter location={pathname}>
      <App helmetContext={helmetContext} />
    </StaticRouter>,
    {
      onError(error: Error) {
        writableStream.destroy(error);
      },
      onAllReady() {
        pipe(writableStream);
      },
    }
  );

  const appHtml = await writableStream.getPromise();

  return {
    appHtml,
    pageData: {},
  };
}

class WritableAsPromise extends Writable {
  private _output: string;
  private _deferred: {
    promise: Promise<string>;
    resolve: (value: string) => void;
    reject: (reason: Error) => void;
  };

  constructor() {
    super();

    this._output = "";
    this._deferred = {
      reject: null,
      resolve: null,
      promise: null,
    };

    this._deferred.promise = new Promise((resolve, reject) => {
      this._deferred.reject = reject;
      this._deferred.resolve = resolve;
    });
  }

  override _write(
    chunk: { toString: () => string },
    _: unknown,
    next: () => void
  ) {
    this._output += chunk.toString();
    next();
  }

  override _destroy(error: Error, next: () => void) {
    if (error instanceof Error) {
      this._deferred.reject(error);
    } else {
      next();
    }
  }

  override end() {
    this._deferred.resolve(this._output);
    return this.destroy();
  }

  getPromise(): Promise<string> {
    return this._deferred.promise;
  }
}
