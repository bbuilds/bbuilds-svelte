var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/lodash.throttle/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.throttle/index.js"(exports, module2) {
    init_shims();
    var FUNC_ERROR_TEXT = "Expected a function";
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var nativeMax = Math.max;
    var nativeMin = Math.min;
    var now = function() {
      return root.Date.now();
    };
    function debounce(func, wait, options2) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options2)) {
        leading = !!options2.leading;
        maxing = "maxWait" in options2;
        maxWait = maxing ? nativeMax(toNumber(options2.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options2 ? !!options2.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
        return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    function throttle(func, wait, options2) {
      var leading = true, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject(options2)) {
        leading = "leading" in options2 ? !!options2.leading : leading;
        trailing = "trailing" in options2 ? !!options2.trailing : trailing;
      }
      return debounce(func, wait, {
        "leading": leading,
        "maxWait": wait,
        "trailing": trailing
      });
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module2.exports = throttle;
  }
});

// node_modules/lodash.debounce/index.js
var require_lodash2 = __commonJS({
  "node_modules/lodash.debounce/index.js"(exports, module2) {
    init_shims();
    var FUNC_ERROR_TEXT = "Expected a function";
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var nativeMax = Math.max;
    var nativeMin = Math.min;
    var now = function() {
      return root.Date.now();
    };
    function debounce(func, wait, options2) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options2)) {
        leading = !!options2.leading;
        maxing = "maxWait" in options2;
        maxWait = maxing ? nativeMax(toNumber(options2.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options2 ? !!options2.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
        return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module2.exports = debounce;
  }
});

// node_modules/aos/dist/aos.cjs.js
var require_aos_cjs = __commonJS({
  "node_modules/aos/dist/aos.cjs.js"(exports, module2) {
    init_shims();
    "use strict";
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var throttle = _interopDefault(require_lodash());
    var debounce = _interopDefault(require_lodash2());
    var callback = function callback2() {
    };
    function containsAOSNode(nodes) {
      var i = void 0, currentNode = void 0, result = void 0;
      for (i = 0; i < nodes.length; i += 1) {
        currentNode = nodes[i];
        if (currentNode.dataset && currentNode.dataset.aos) {
          return true;
        }
        result = currentNode.children && containsAOSNode(currentNode.children);
        if (result) {
          return true;
        }
      }
      return false;
    }
    function check(mutations) {
      if (!mutations)
        return;
      mutations.forEach(function(mutation) {
        var addedNodes = Array.prototype.slice.call(mutation.addedNodes);
        var removedNodes = Array.prototype.slice.call(mutation.removedNodes);
        var allNodes = addedNodes.concat(removedNodes);
        if (containsAOSNode(allNodes)) {
          return callback();
        }
      });
    }
    function getMutationObserver() {
      return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    }
    function isSupported() {
      return !!getMutationObserver();
    }
    function ready(selector, fn) {
      var doc = window.document;
      var MutationObserver = getMutationObserver();
      var observer2 = new MutationObserver(check);
      callback = fn;
      observer2.observe(doc.documentElement, {
        childList: true,
        subtree: true,
        removedNodes: true
      });
    }
    var observer = { isSupported, ready };
    var classCallCheck = function(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };
    var createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var fullNameRe = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
    var prefixRe = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
    var fullNameMobileRe = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;
    var prefixMobileRe = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
    function ua() {
      return navigator.userAgent || navigator.vendor || window.opera || "";
    }
    var Detector = function() {
      function Detector2() {
        classCallCheck(this, Detector2);
      }
      createClass(Detector2, [{
        key: "phone",
        value: function phone() {
          var a = ua();
          return !!(fullNameRe.test(a) || prefixRe.test(a.substr(0, 4)));
        }
      }, {
        key: "mobile",
        value: function mobile() {
          var a = ua();
          return !!(fullNameMobileRe.test(a) || prefixMobileRe.test(a.substr(0, 4)));
        }
      }, {
        key: "tablet",
        value: function tablet() {
          return this.mobile() && !this.phone();
        }
      }, {
        key: "ie11",
        value: function ie11() {
          return "-ms-scroll-limit" in document.documentElement.style && "-ms-ime-align" in document.documentElement.style;
        }
      }]);
      return Detector2;
    }();
    var detect = new Detector();
    var addClasses = function addClasses2(node, classes) {
      return classes && classes.forEach(function(className) {
        return node.classList.add(className);
      });
    };
    var removeClasses = function removeClasses2(node, classes) {
      return classes && classes.forEach(function(className) {
        return node.classList.remove(className);
      });
    };
    var fireEvent = function fireEvent2(eventName, data) {
      var customEvent = void 0;
      if (detect.ie11()) {
        customEvent = document.createEvent("CustomEvent");
        customEvent.initCustomEvent(eventName, true, true, { detail: data });
      } else {
        customEvent = new CustomEvent(eventName, {
          detail: data
        });
      }
      return document.dispatchEvent(customEvent);
    };
    var applyClasses = function applyClasses2(el, top) {
      var options3 = el.options, position = el.position, node = el.node, data = el.data;
      var hide = function hide2() {
        if (!el.animated)
          return;
        removeClasses(node, options3.animatedClassNames);
        fireEvent("aos:out", node);
        if (el.options.id) {
          fireEvent("aos:in:" + el.options.id, node);
        }
        el.animated = false;
      };
      var show = function show2() {
        if (el.animated)
          return;
        addClasses(node, options3.animatedClassNames);
        fireEvent("aos:in", node);
        if (el.options.id) {
          fireEvent("aos:in:" + el.options.id, node);
        }
        el.animated = true;
      };
      if (options3.mirror && top >= position.out && !options3.once) {
        hide();
      } else if (top >= position.in) {
        show();
      } else if (el.animated && !options3.once) {
        hide();
      }
    };
    var handleScroll = function handleScroll2($elements) {
      return $elements.forEach(function(el, i) {
        return applyClasses(el, window.pageYOffset);
      });
    };
    var offset = function offset2(el) {
      var _x = 0;
      var _y = 0;
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - (el.tagName != "BODY" ? el.scrollLeft : 0);
        _y += el.offsetTop - (el.tagName != "BODY" ? el.scrollTop : 0);
        el = el.offsetParent;
      }
      return {
        top: _y,
        left: _x
      };
    };
    var getInlineOption = function(el, key, fallback) {
      var attr = el.getAttribute("data-aos-" + key);
      if (typeof attr !== "undefined") {
        if (attr === "true") {
          return true;
        } else if (attr === "false") {
          return false;
        }
      }
      return attr || fallback;
    };
    var getPositionIn = function getPositionIn2(el, defaultOffset, defaultAnchorPlacement) {
      var windowHeight = window.innerHeight;
      var anchor = getInlineOption(el, "anchor");
      var inlineAnchorPlacement = getInlineOption(el, "anchor-placement");
      var additionalOffset = Number(getInlineOption(el, "offset", inlineAnchorPlacement ? 0 : defaultOffset));
      var anchorPlacement = inlineAnchorPlacement || defaultAnchorPlacement;
      var finalEl = el;
      if (anchor && document.querySelectorAll(anchor)) {
        finalEl = document.querySelectorAll(anchor)[0];
      }
      var triggerPoint = offset(finalEl).top - windowHeight;
      switch (anchorPlacement) {
        case "top-bottom":
          break;
        case "center-bottom":
          triggerPoint += finalEl.offsetHeight / 2;
          break;
        case "bottom-bottom":
          triggerPoint += finalEl.offsetHeight;
          break;
        case "top-center":
          triggerPoint += windowHeight / 2;
          break;
        case "center-center":
          triggerPoint += windowHeight / 2 + finalEl.offsetHeight / 2;
          break;
        case "bottom-center":
          triggerPoint += windowHeight / 2 + finalEl.offsetHeight;
          break;
        case "top-top":
          triggerPoint += windowHeight;
          break;
        case "bottom-top":
          triggerPoint += windowHeight + finalEl.offsetHeight;
          break;
        case "center-top":
          triggerPoint += windowHeight + finalEl.offsetHeight / 2;
          break;
      }
      return triggerPoint + additionalOffset;
    };
    var getPositionOut = function getPositionOut2(el, defaultOffset) {
      var windowHeight = window.innerHeight;
      var anchor = getInlineOption(el, "anchor");
      var additionalOffset = getInlineOption(el, "offset", defaultOffset);
      var finalEl = el;
      if (anchor && document.querySelectorAll(anchor)) {
        finalEl = document.querySelectorAll(anchor)[0];
      }
      var elementOffsetTop = offset(finalEl).top;
      return elementOffsetTop + finalEl.offsetHeight - additionalOffset;
    };
    var prepare = function prepare2($elements, options3) {
      $elements.forEach(function(el, i) {
        var mirror = getInlineOption(el.node, "mirror", options3.mirror);
        var once = getInlineOption(el.node, "once", options3.once);
        var id2 = getInlineOption(el.node, "id");
        var customClassNames = options3.useClassNames && el.node.getAttribute("data-aos");
        var animatedClassNames = [options3.animatedClassName].concat(customClassNames ? customClassNames.split(" ") : []).filter(function(className) {
          return typeof className === "string";
        });
        if (options3.initClassName) {
          el.node.classList.add(options3.initClassName);
        }
        el.position = {
          in: getPositionIn(el.node, options3.offset, options3.anchorPlacement),
          out: mirror && getPositionOut(el.node, options3.offset)
        };
        el.options = {
          once,
          mirror,
          animatedClassNames,
          id: id2
        };
      });
      return $elements;
    };
    var elements = function() {
      var elements2 = document.querySelectorAll("[data-aos]");
      return Array.prototype.map.call(elements2, function(node) {
        return { node };
      });
    };
    var $aosElements = [];
    var initialized = false;
    var options2 = {
      offset: 120,
      delay: 0,
      easing: "ease",
      duration: 400,
      disable: false,
      once: false,
      mirror: false,
      anchorPlacement: "top-bottom",
      startEvent: "DOMContentLoaded",
      animatedClassName: "aos-animate",
      initClassName: "aos-init",
      useClassNames: false,
      disableMutationObserver: false,
      throttleDelay: 99,
      debounceDelay: 50
    };
    var isBrowserNotSupported = function isBrowserNotSupported2() {
      return document.all && !window.atob;
    };
    var initializeScroll = function initializeScroll2() {
      $aosElements = prepare($aosElements, options2);
      handleScroll($aosElements);
      window.addEventListener("scroll", throttle(function() {
        handleScroll($aosElements, options2.once);
      }, options2.throttleDelay));
      return $aosElements;
    };
    var refresh = function refresh2() {
      var initialize = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
      if (initialize)
        initialized = true;
      if (initialized)
        initializeScroll();
    };
    var refreshHard = function refreshHard2() {
      $aosElements = elements();
      if (isDisabled(options2.disable) || isBrowserNotSupported()) {
        return disable();
      }
      refresh();
    };
    var disable = function disable2() {
      $aosElements.forEach(function(el, i) {
        el.node.removeAttribute("data-aos");
        el.node.removeAttribute("data-aos-easing");
        el.node.removeAttribute("data-aos-duration");
        el.node.removeAttribute("data-aos-delay");
        if (options2.initClassName) {
          el.node.classList.remove(options2.initClassName);
        }
        if (options2.animatedClassName) {
          el.node.classList.remove(options2.animatedClassName);
        }
      });
    };
    var isDisabled = function isDisabled2(optionDisable) {
      return optionDisable === true || optionDisable === "mobile" && detect.mobile() || optionDisable === "phone" && detect.phone() || optionDisable === "tablet" && detect.tablet() || typeof optionDisable === "function" && optionDisable() === true;
    };
    var init2 = function init3(settings) {
      options2 = _extends(options2, settings);
      $aosElements = elements();
      if (!options2.disableMutationObserver && !observer.isSupported()) {
        console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    ');
        options2.disableMutationObserver = true;
      }
      if (!options2.disableMutationObserver) {
        observer.ready("[data-aos]", refreshHard);
      }
      if (isDisabled(options2.disable) || isBrowserNotSupported()) {
        return disable();
      }
      document.querySelector("body").setAttribute("data-aos-easing", options2.easing);
      document.querySelector("body").setAttribute("data-aos-duration", options2.duration);
      document.querySelector("body").setAttribute("data-aos-delay", options2.delay);
      if (["DOMContentLoaded", "load"].indexOf(options2.startEvent) === -1) {
        document.addEventListener(options2.startEvent, function() {
          refresh(true);
        });
      } else {
        window.addEventListener("load", function() {
          refresh(true);
        });
      }
      if (options2.startEvent === "DOMContentLoaded" && ["complete", "interactive"].indexOf(document.readyState) > -1) {
        refresh(true);
      }
      window.addEventListener("resize", debounce(refresh, options2.debounceDelay, true));
      window.addEventListener("orientationchange", debounce(refresh, options2.debounceDelay, true));
      return $aosElements;
    };
    var aos = {
      init: init2,
      refresh,
      refreshHard
    };
    module2.exports = aos;
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();

// node_modules/@sveltejs/kit/dist/adapter-utils.js
init_shims();
function isContentTypeTextual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}

// node_modules/@sveltejs/kit/dist/ssr.js
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = headers["content-type"];
  const is_type_textual = isContentTypeTextual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session2 = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session: session2
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session2.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2 && page2.path)},
						query: new URLSearchParams(${page2 ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && s$1(page2.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = { ...opts.headers };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body,
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page: page2
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4, request);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id2) => id2 ? options2.load_component(id2) : void 0));
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error3 = e;
          }
          if (loaded && !error3) {
            branch.push(loaded);
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      ...opts,
      page_config,
      status,
      error: error3,
      branch: branch.filter(Boolean)
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4, request);
    return await respond_with_error({
      ...opts,
      status: 500,
      error: error4
    });
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw || typeof raw !== "string")
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  switch (type) {
    case "text/plain":
      return raw;
    case "application/json":
      return JSON.parse(raw);
    case "application/x-www-form-urlencoded":
      return get_urlencoded(raw);
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(raw, boundary.slice("boundary=".length));
    }
    default:
      throw new Error(`Invalid Content-Type ${type}`);
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
var import_aos = __toModule(require_aos_cjs());
function noop2() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal2(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$f = {
  code: "#svelte-announcer.svelte-u7bl1d{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer {\\n  position: absolute;\\n  left: 0;\\n  top: 0;\\n  clip: rect(0 0 0 0);\\n  clip-path: inset(50%);\\n  overflow: hidden;\\n  white-space: nowrap;\\n  width: 1px;\\n  height: 1px;\\n}</style>"],"names":[],"mappings":"AAqDO,iBAAiB,cAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACb,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$f);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var getSession = async () => {
  const posts = await Promise.all(Object.entries({ "../src/routes/blog/branden-builds-launches.md": () => Promise.resolve().then(function() {
    return brandenBuildsLaunches;
  }), "../src/routes/blog/byoungz-headlesswp-gatsby.md": () => Promise.resolve().then(function() {
    return byoungzHeadlesswpGatsby;
  }) }).map(async ([path, page2]) => {
    const { metadata: metadata2 } = await page2();
    const filename = path.split("/").pop();
    return Object.assign(Object.assign({}, metadata2), { filename });
  }));
  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return {
    posts
  };
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  getSession
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + `
		<link rel="stylesheet" href="https://use.typekit.net/fqs8gqy.css" />
		<!-- Google Tag Manager -->
		<script>
			(function (w, d, s, l, i) {
				w[l] = w[l] || [];
				w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
				var f = d.getElementsByTagName(s)[0],
					j = d.createElement(s),
					dl = l != 'dataLayer' ? '&l=' + l : '';
				j.async = true;
				j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
				f.parentNode.insertBefore(j, f);
			})(window, document, 'script', 'dataLayer', 'GTM-5SGT7CL');
		<\/script>
		<!-- End Google Tag Manager -->
	</head>
	<body>
		<!-- Google Tag Manager (noscript) -->
		<noscript
			><iframe
				src="https://www.googletagmanager.com/ns.html?id=GTM-5SGT7CL"
				height="0"
				width="0"
				style="display: none; visibility: hidden"
			></iframe
		></noscript>
		<!-- End Google Tag Manager (noscript) -->
		<div id="svelte"><div class="flex flex-wrap flex-col min-h-screen">` + body + "</div></div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-0ff456c3.js",
      css: [assets + "/_app/assets/start-808c0b29.css"],
      js: [assets + "/_app/start-0ff456c3.js", assets + "/_app/chunks/vendor-a8cf5fa8.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id2) => assets + "/_app/" + entry_lookup[id2],
    get_stack: (error22) => String(error22),
    handle_error: (error22, request) => {
      hooks.handleError({ error: error22, request });
      error22.stack = options.get_stack(error22);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var d = decodeURIComponent;
var empty = () => ({});
var manifest = {
  assets: [{ "file": ".DS_Store", "size": 6148, "type": null }, { "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "images/.DS_Store", "size": 6148, "type": null }, { "file": "images/blog/.DS_Store", "size": 6148, "type": null }, { "file": "images/blog/branden-builds-launches/branden-builds-website-blog.png", "size": 10752, "type": "image/png" }, { "file": "images/blog/byoungz-gatsby-build.jpg", "size": 91834, "type": "image/jpeg" }, { "file": "images/blog/byoungz-headlesswp-gatsby/byoungz-website-gatsby-headlesswp.jpg", "size": 114092, "type": "image/jpeg" }, { "file": "images/blog/traditional-wordpress-byoungz-ss.jpg", "size": 92488, "type": "image/jpeg" }, { "file": "images/brandenbuilds-opengraph.jpg", "size": 97042, "type": "image/jpeg" }, { "file": "images/branding-service-illustration.svg", "size": 5449, "type": "image/svg+xml" }, { "file": "images/seo-service-illustration.svg", "size": 5980, "type": "image/svg+xml" }, { "file": "images/web-development-illustration.svg", "size": 9772, "type": "image/svg+xml" }, { "file": "images/wordpress-development-illustration.svg", "size": 5744, "type": "image/svg+xml" }, { "file": "svg/.DS_Store", "size": 6148, "type": null }, { "file": "svg/logos/.DS_Store", "size": 8196, "type": null }, { "file": "svg/logos/apollo.svg", "size": 1187, "type": "image/svg+xml" }, { "file": "svg/logos/css.svg", "size": 950, "type": "image/svg+xml" }, { "file": "svg/logos/docker.svg", "size": 4910, "type": "image/svg+xml" }, { "file": "svg/logos/facebook.svg", "size": 433, "type": "image/svg+xml" }, { "file": "svg/logos/gatsby.svg", "size": 685, "type": "image/svg+xml" }, { "file": "svg/logos/graphql.svg", "size": 2807, "type": "image/svg+xml" }, { "file": "svg/logos/html.svg", "size": 855, "type": "image/svg+xml" }, { "file": "svg/logos/javascript.svg", "size": 1088, "type": "image/svg+xml" }, { "file": "svg/logos/laravel.svg", "size": 2034, "type": "image/svg+xml" }, { "file": "svg/logos/link.svg", "size": 1475, "type": "image/svg+xml" }, { "file": "svg/logos/linkedin.svg", "size": 599, "type": "image/svg+xml" }, { "file": "svg/logos/mongodb.svg", "size": 26490, "type": "image/svg+xml" }, { "file": "svg/logos/mysql.svg", "size": 2706, "type": "image/svg+xml" }, { "file": "svg/logos/nextjs.svg", "size": 542, "type": "image/svg+xml" }, { "file": "svg/logos/nodejs.svg", "size": 2208, "type": "image/svg+xml" }, { "file": "svg/logos/php.svg", "size": 10316, "type": "image/svg+xml" }, { "file": "svg/logos/postgres.svg", "size": 9089, "type": "image/svg+xml" }, { "file": "svg/logos/react.svg", "size": 5219, "type": "image/svg+xml" }, { "file": "svg/logos/reddit.svg", "size": 1130, "type": "image/svg+xml" }, { "file": "svg/logos/sass.svg", "size": 5823, "type": "image/svg+xml" }, { "file": "svg/logos/svelte.svg", "size": 3420, "type": "image/svg+xml" }, { "file": "svg/logos/tailwind.svg", "size": 1002, "type": "image/svg+xml" }, { "file": "svg/logos/twitter.svg", "size": 765, "type": "image/svg+xml" }, { "file": "svg/logos/typescript.svg", "size": 2324, "type": "image/svg+xml" }, { "file": "svg/logos/vuejs.svg", "size": 450, "type": "image/svg+xml" }, { "file": "svg/logos/wordpress.svg", "size": 1673, "type": "image/svg+xml" }],
  layout: "src/routes/__layout.svelte",
  error: "src/routes/__error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/headless-wordpress-development\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/headless-wordpress-development.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/wordpress-development\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/wordpress-development.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/web-development\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/web-development.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/sitemap\.xml$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return sitemap_xml;
      })
    },
    {
      type: "page",
      pattern: /^\/branding\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/branding.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/services\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/services.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/contact.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/byoungz-headlesswp-gatsby\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/byoungz-headlesswp-gatsby.md"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/branden-builds-launches\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/branden-builds-launches.md"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/tags\/([^/]+?)\/?$/,
      params: (m) => ({ tag: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/tags/[tag].svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/api\/services\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return services$1;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/api\/skillset\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return skillset;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/api\/process\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return process2;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/api\/hero\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return hero;
      })
    },
    {
      type: "page",
      pattern: /^\/seo\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/seo.svelte"],
      b: ["src/routes/__error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error22 }) => console.error(error22.stack)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/__error.svelte": () => Promise.resolve().then(function() {
    return __error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/headless-wordpress-development.svelte": () => Promise.resolve().then(function() {
    return headlessWordpressDevelopment;
  }),
  "src/routes/wordpress-development.svelte": () => Promise.resolve().then(function() {
    return wordpressDevelopment;
  }),
  "src/routes/web-development.svelte": () => Promise.resolve().then(function() {
    return webDevelopment;
  }),
  "src/routes/branding.svelte": () => Promise.resolve().then(function() {
    return branding;
  }),
  "src/routes/services.svelte": () => Promise.resolve().then(function() {
    return services;
  }),
  "src/routes/contact.svelte": () => Promise.resolve().then(function() {
    return contact;
  }),
  "src/routes/blog/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/blog/byoungz-headlesswp-gatsby.md": () => Promise.resolve().then(function() {
    return byoungzHeadlesswpGatsby;
  }),
  "src/routes/blog/branden-builds-launches.md": () => Promise.resolve().then(function() {
    return brandenBuildsLaunches;
  }),
  "src/routes/tags/[tag].svelte": () => Promise.resolve().then(function() {
    return _tag_;
  }),
  "src/routes/seo.svelte": () => Promise.resolve().then(function() {
    return seo;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-fea5b4f0.js", "css": ["assets/pages/__layout.svelte-fe3d0f33.css"], "js": ["pages/__layout.svelte-fea5b4f0.js", "chunks/vendor-a8cf5fa8.js", "chunks/stores-8722c1cd.js", "chunks/Name-077201de.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-8d1f9eb4.js", "css": ["assets/pages/__error.svelte-912ecf6d.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/__error.svelte-8d1f9eb4.js", "chunks/vendor-a8cf5fa8.js", "chunks/stores-8722c1cd.js", "chunks/OpenGraph-9462adc1.js", "chunks/brandcube-93b22784.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-5cf8d4da.js", "css": ["assets/pages/index.svelte-59b2d07c.css", "assets/Process-954df49e.css", "assets/PostPreview-bbd75563.css"], "js": ["pages/index.svelte-5cf8d4da.js", "chunks/vendor-a8cf5fa8.js", "chunks/Name-077201de.js", "chunks/Process-5badc0f3.js", "chunks/stores-8722c1cd.js", "chunks/PostPreview-83685944.js", "chunks/BlogHeader-c0d0fb75.js", "chunks/OpenGraph-9462adc1.js"], "styles": [] }, "src/routes/headless-wordpress-development.svelte": { "entry": "pages/headless-wordpress-development.svelte-5ed4035a.js", "css": ["assets/pages/headless-wordpress-development.svelte-b00cd87a.css", "assets/content-styles-f16ae040.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/headless-wordpress-development.svelte-5ed4035a.js", "chunks/vendor-a8cf5fa8.js", "chunks/OpenGraph-9462adc1.js", "chunks/stores-8722c1cd.js", "chunks/brandcube-93b22784.js"], "styles": [] }, "src/routes/wordpress-development.svelte": { "entry": "pages/wordpress-development.svelte-1615f9da.js", "css": ["assets/content-styles-f16ae040.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/wordpress-development.svelte-1615f9da.js", "chunks/vendor-a8cf5fa8.js", "chunks/OpenGraph-9462adc1.js", "chunks/stores-8722c1cd.js", "chunks/brandcube-93b22784.js"], "styles": [] }, "src/routes/web-development.svelte": { "entry": "pages/web-development.svelte-3350bb93.js", "css": ["assets/content-styles-f16ae040.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/web-development.svelte-3350bb93.js", "chunks/vendor-a8cf5fa8.js", "chunks/OpenGraph-9462adc1.js", "chunks/stores-8722c1cd.js", "chunks/brandcube-93b22784.js"], "styles": [] }, "src/routes/branding.svelte": { "entry": "pages/branding.svelte-5eb01320.js", "css": ["assets/content-styles-f16ae040.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/branding.svelte-5eb01320.js", "chunks/vendor-a8cf5fa8.js", "chunks/OpenGraph-9462adc1.js", "chunks/stores-8722c1cd.js", "chunks/brandcube-93b22784.js"], "styles": [] }, "src/routes/services.svelte": { "entry": "pages/services.svelte-e940e328.js", "css": ["assets/pages/services.svelte-10eb9642.css", "assets/Process-954df49e.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/services.svelte-e940e328.js", "chunks/vendor-a8cf5fa8.js", "chunks/Process-5badc0f3.js", "chunks/brandcube-93b22784.js", "chunks/OpenGraph-9462adc1.js", "chunks/stores-8722c1cd.js"], "styles": [] }, "src/routes/contact.svelte": { "entry": "pages/contact.svelte-16ef9dc4.js", "css": ["assets/brandcube-9e7a7b79.css"], "js": ["pages/contact.svelte-16ef9dc4.js", "chunks/vendor-a8cf5fa8.js", "chunks/stores-8722c1cd.js", "chunks/OpenGraph-9462adc1.js", "chunks/brandcube-93b22784.js"], "styles": [] }, "src/routes/blog/index.svelte": { "entry": "pages/blog/index.svelte-72cfe273.js", "css": ["assets/pages/blog/index.svelte-dfecea9c.css", "assets/PostPreview-bbd75563.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/blog/index.svelte-72cfe273.js", "chunks/vendor-a8cf5fa8.js", "chunks/stores-8722c1cd.js", "chunks/PostPreview-83685944.js", "chunks/BlogHeader-c0d0fb75.js", "chunks/OpenGraph-9462adc1.js", "chunks/brandcube-93b22784.js"], "styles": [] }, "src/routes/blog/byoungz-headlesswp-gatsby.md": { "entry": "pages/blog/byoungz-headlesswp-gatsby.md-be580a50.js", "css": ["assets/FeaturedImage-5643b9ee.css"], "js": ["pages/blog/byoungz-headlesswp-gatsby.md-be580a50.js", "chunks/vendor-a8cf5fa8.js", "chunks/FeaturedImage-3fbb0882.js", "chunks/stores-8722c1cd.js", "chunks/OpenGraph-9462adc1.js", "chunks/BlogHeader-c0d0fb75.js"], "styles": [] }, "src/routes/blog/branden-builds-launches.md": { "entry": "pages/blog/branden-builds-launches.md-43a14801.js", "css": ["assets/FeaturedImage-5643b9ee.css"], "js": ["pages/blog/branden-builds-launches.md-43a14801.js", "chunks/vendor-a8cf5fa8.js", "chunks/FeaturedImage-3fbb0882.js", "chunks/stores-8722c1cd.js", "chunks/OpenGraph-9462adc1.js", "chunks/BlogHeader-c0d0fb75.js"], "styles": [] }, "src/routes/tags/[tag].svelte": { "entry": "pages/tags/[tag].svelte-cbb78fe6.js", "css": ["assets/pages/tags/[tag].svelte-cefe92c0.css", "assets/brandcube-9e7a7b79.css", "assets/PostPreview-bbd75563.css"], "js": ["pages/tags/[tag].svelte-cbb78fe6.js", "chunks/vendor-a8cf5fa8.js", "chunks/stores-8722c1cd.js", "chunks/OpenGraph-9462adc1.js", "chunks/brandcube-93b22784.js", "chunks/PostPreview-83685944.js", "chunks/BlogHeader-c0d0fb75.js"], "styles": [] }, "src/routes/seo.svelte": { "entry": "pages/seo.svelte-8688d83f.js", "css": ["assets/content-styles-f16ae040.css", "assets/brandcube-9e7a7b79.css"], "js": ["pages/seo.svelte-8688d83f.js", "chunks/vendor-a8cf5fa8.js", "chunks/OpenGraph-9462adc1.js", "chunks/stores-8722c1cd.js", "chunks/brandcube-93b22784.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var error2 = (verb) => {
  throw new Error(`Can only ${verb} session store in browser`);
};
var session = {
  subscribe(fn) {
    const store = getStores().session;
    return store.subscribe(fn);
  },
  set: () => error2("set"),
  update: () => error2("update")
};
var OpenGraph = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { title: title2 } = $$props;
  let { description } = $$props;
  let { norobots = false } = $$props;
  let { image: image2 } = $$props;
  let { type = "article" } = $$props;
  let { url = `https://${$page.host}${$page.path}` } = $$props;
  let { keywords: keywords2 } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title2 !== void 0)
    $$bindings.title(title2);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.norobots === void 0 && $$bindings.norobots && norobots !== void 0)
    $$bindings.norobots(norobots);
  if ($$props.image === void 0 && $$bindings.image && image2 !== void 0)
    $$bindings.image(image2);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  if ($$props.keywords === void 0 && $$bindings.keywords && keywords2 !== void 0)
    $$bindings.keywords(keywords2);
  $$unsubscribe_page();
  return `${$$result.head += `${$$result.title = `<title>${escape2(title2)}</title>`, ""}<meta name="${"keywords"}"${add_attribute("content", keywords2, 0)} data-svelte="svelte-6njyum"><meta name="${"description"}"${add_attribute("content", description, 0)} data-svelte="svelte-6njyum">${norobots ? `<meta name="${"robots"}" content="${"noindex"}" data-svelte="svelte-6njyum">` : ``}<meta property="${"og:image"}"${add_attribute("content", `${$page.host}/${image2}`, 0)} data-svelte="svelte-6njyum"><meta property="${"og:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-6njyum"><meta property="${"og:title"}"${add_attribute("content", title2, 0)} data-svelte="svelte-6njyum"><meta property="${"og:type"}"${add_attribute("content", type, 0)} data-svelte="svelte-6njyum"><meta property="${"og:url"}"${add_attribute("content", url, 0)} data-svelte="svelte-6njyum"><meta name="${"twitter:card"}" content="${"summary"}" data-svelte="svelte-6njyum"><meta name="${"twitter:site"}" content="${"@brandenbuilds"}" data-svelte="svelte-6njyum"><meta name="${"twitter:creator"}" content="${"@brandenbuilds"}" data-svelte="svelte-6njyum"><meta name="${"twitter:image"}"${add_attribute("content", `${$page.host}/${image2}`, 0)} data-svelte="svelte-6njyum">`, ""}`;
});
var css$e = {
  code: "body{line-height:1.5}.blog-post ul{padding-inline-start:1.7em;list-style:disc}.blog-post ul > li{padding-left:0.1em}.blog-post p{margin-top:0.5em;margin-bottom:0.5em}.post-img{margin-top:1rem;margin-bottom:1rem}h1,h2,h3,h4,h5,h6{line-height:1.25;margin-top:1.25rem;margin-bottom:1rem}h2{margin-top:2rem}",
  map: '{"version":3,"file":"blog.svelte","sources":["blog.svelte"],"sourcesContent":["<script>\\n\\timport { page } from \'$app/stores\';\\n\\timport OpenGraph from \'../OpenGraph.svelte\';\\n\\texport let title;\\n\\texport let excerpt;\\n\\texport let image;\\n\\texport let slug;\\n\\texport let keywords;\\n\\texport let url = `https://${$page.host}${$page.path}`;\\n\\n\\tconst socialLinks = [\\n\\t\\t{\\n\\t\\t\\thref: `https://twitter.com/intent/tweet?text=${encodeURIComponent(\\n\\t\\t\\t\\t`${title} by @brandenbuilds ${url}`\\n\\t\\t\\t)}`,\\n\\t\\t\\talt: \'Twitter\',\\n\\t\\t\\ticon: \'/svg/logos/twitter.svg\',\\n\\t\\t\\ttrackingName: \'twitter\'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\thref: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(\\n\\t\\t\\t\\t`${url}`\\n\\t\\t\\t)}&t=${title}`,\\n\\t\\t\\talt: \'Facebook\',\\n\\t\\t\\ticon: \'/svg/logos/facebook.svg\',\\n\\t\\t\\ttrackingName: \'facebook\'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\thref: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,\\n\\t\\t\\talt: \'Linkedin\',\\n\\t\\t\\ticon: \'/svg/logos/linkedin.svg\',\\n\\t\\t\\ttrackingName: \'linkedin\'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\thref: `http://www.reddit.com/submit?url=${encodeURIComponent(`${url}&title=${title}`)}`,\\n\\t\\t\\talt: \'Reddit\',\\n\\t\\t\\ticon: \'/svg/logos/reddit.svg\',\\n\\t\\t\\ttrackingName: \'reddit\'\\n\\t\\t}\\n\\t];\\n<\/script>\\n\\n<OpenGraph {title} {keywords} description={excerpt} {url} image={`images/blog/${slug}/${image}`} />\\n\\n<article class=\\"blog-post container max-w-3xl mx-auto py-10 lg:py-20 px-4\\">\\n\\t<slot />\\n\\t<section class=\\"share border-t border-solid border-bbuilds-black mt-4\\">\\n\\t\\t<h2 class=\\"text-xl my-4\\">Share This Post</h2>\\n\\t\\t<ul class=\\"flex\\" style=\\"list-style: none; padding-left:0;\\">\\n\\t\\t\\t{#each socialLinks as link}\\n\\t\\t\\t\\t<li class=\\"mr-2\\">\\n\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\thref={link.href}\\n\\t\\t\\t\\t\\t\\ttarget=\\"_blank\\"\\n\\t\\t\\t\\t\\t\\tclass=\\"block transition duration-300 ease-in-out transform hover:-translate-y-1\\"\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t<img\\n\\t\\t\\t\\t\\t\\t\\tsrc={link.icon}\\n\\t\\t\\t\\t\\t\\t\\talt={link.alt}\\n\\t\\t\\t\\t\\t\\t\\theight=\\"24\\"\\n\\t\\t\\t\\t\\t\\t\\twidth=\\"24\\"\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"bg-bbuilds-yellow overflow-hidden\\"\\n\\t\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t</li>\\n\\t\\t\\t{/each}\\n\\t\\t</ul>\\n\\t</section>\\n</article>\\n\\n<style>:global(body) {\\n  line-height: 1.5;\\n}\\n:global(.blog-post ul) {\\n  padding-inline-start: 1.7em;\\n  list-style: disc;\\n}\\n:global(.blog-post ul > li) {\\n  padding-left: 0.1em;\\n}\\n:global(.blog-post p) {\\n  margin-top: 0.5em;\\n  margin-bottom: 0.5em;\\n}\\n:global(.post-img) {\\n  margin-top: 1rem;\\n  margin-bottom: 1rem;\\n}\\n:global(h1), :global(h2), :global(h3), :global(h4), :global(h5), :global(h6) {\\n  line-height: 1.25;\\n  margin-top: 1.25rem;\\n  margin-bottom: 1rem;\\n}\\n:global(h2) {\\n  margin-top: 2rem;\\n}</style>\\n"],"names":[],"mappings":"AAsEe,IAAI,AAAE,CAAC,AACpB,WAAW,CAAE,GAAG,AAClB,CAAC,AACO,aAAa,AAAE,CAAC,AACtB,oBAAoB,CAAE,KAAK,CAC3B,UAAU,CAAE,IAAI,AAClB,CAAC,AACO,kBAAkB,AAAE,CAAC,AAC3B,YAAY,CAAE,KAAK,AACrB,CAAC,AACO,YAAY,AAAE,CAAC,AACrB,UAAU,CAAE,KAAK,CACjB,aAAa,CAAE,KAAK,AACtB,CAAC,AACO,SAAS,AAAE,CAAC,AAClB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,IAAI,AACrB,CAAC,AACO,EAAE,AAAC,CAAU,EAAE,AAAC,CAAU,EAAE,AAAC,CAAU,EAAE,AAAC,CAAU,EAAE,AAAC,CAAU,EAAE,AAAE,CAAC,AAC5E,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,OAAO,CACnB,aAAa,CAAE,IAAI,AACrB,CAAC,AACO,EAAE,AAAE,CAAC,AACX,UAAU,CAAE,IAAI,AAClB,CAAC"}'
};
var Blog$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { title: title2 } = $$props;
  let { excerpt: excerpt2 } = $$props;
  let { image: image2 } = $$props;
  let { slug: slug2 } = $$props;
  let { keywords: keywords2 } = $$props;
  let { url = `https://${$page.host}${$page.path}` } = $$props;
  const socialLinks = [
    {
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title2} by @brandenbuilds ${url}`)}`,
      alt: "Twitter",
      icon: "/svg/logos/twitter.svg",
      trackingName: "twitter"
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${url}`)}&t=${title2}`,
      alt: "Facebook",
      icon: "/svg/logos/facebook.svg",
      trackingName: "facebook"
    },
    {
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      alt: "Linkedin",
      icon: "/svg/logos/linkedin.svg",
      trackingName: "linkedin"
    },
    {
      href: `http://www.reddit.com/submit?url=${encodeURIComponent(`${url}&title=${title2}`)}`,
      alt: "Reddit",
      icon: "/svg/logos/reddit.svg",
      trackingName: "reddit"
    }
  ];
  if ($$props.title === void 0 && $$bindings.title && title2 !== void 0)
    $$bindings.title(title2);
  if ($$props.excerpt === void 0 && $$bindings.excerpt && excerpt2 !== void 0)
    $$bindings.excerpt(excerpt2);
  if ($$props.image === void 0 && $$bindings.image && image2 !== void 0)
    $$bindings.image(image2);
  if ($$props.slug === void 0 && $$bindings.slug && slug2 !== void 0)
    $$bindings.slug(slug2);
  if ($$props.keywords === void 0 && $$bindings.keywords && keywords2 !== void 0)
    $$bindings.keywords(keywords2);
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  $$result.css.add(css$e);
  $$unsubscribe_page();
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: title2,
    keywords: keywords2,
    description: excerpt2,
    url,
    image: `images/blog/${slug2}/${image2}`
  }, {}, {})}

<article class="${"blog-post container max-w-3xl mx-auto py-10 lg:py-20 px-4"}">${slots.default ? slots.default({}) : ``}
	<section class="${"share border-t border-solid border-bbuilds-black mt-4"}"><h2 class="${"text-xl my-4"}">Share This Post</h2>
		<ul class="${"flex"}" style="${"list-style: none; padding-left:0;"}">${each(socialLinks, (link) => `<li class="${"mr-2"}"><a${add_attribute("href", link.href, 0)} target="${"_blank"}" class="${"block transition duration-300 ease-in-out transform hover:-translate-y-1"}"><img${add_attribute("src", link.icon, 0)}${add_attribute("alt", link.alt, 0)} height="${"24"}" width="${"24"}" class="${"bg-bbuilds-yellow overflow-hidden"}"></a>
				</li>`)}</ul></section>
</article>`;
});
var FeaturedImageObj$1 = "/_app/assets/branden-builds-website-blog-2b57e68f.webp 1200w";
var FeaturedImage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { src: src2 } = $$props;
  let { alt } = $$props;
  if ($$props.src === void 0 && $$bindings.src && src2 !== void 0)
    $$bindings.src(src2);
  if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0)
    $$bindings.alt(alt);
  return `<img${add_attribute("srcset", src2, 0)}${add_attribute("alt", `${alt}`, 0)} type="${"image/webp"}" class="${"rounded-t-md"}">`;
});
var BlogHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title: title2 } = $$props;
  let { rawDate } = $$props;
  let { tags: tags2 } = $$props;
  let { postPreview = false } = $$props;
  const dateDisplay = new Date(Date.parse(rawDate)).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  if ($$props.title === void 0 && $$bindings.title && title2 !== void 0)
    $$bindings.title(title2);
  if ($$props.rawDate === void 0 && $$bindings.rawDate && rawDate !== void 0)
    $$bindings.rawDate(rawDate);
  if ($$props.tags === void 0 && $$bindings.tags && tags2 !== void 0)
    $$bindings.tags(tags2);
  if ($$props.postPreview === void 0 && $$bindings.postPreview && postPreview !== void 0)
    $$bindings.postPreview(postPreview);
  return `<header>${postPreview ? `<h2 class="${"my-3 leading-none text-xl"}">${escape2(title2)}</h2>` : `<h1 class="${"mt-4"}">${escape2(title2)}</h1>`}
	<div class="${"post-meta " + escape2(postPreview ? "mb-2" : "mb-6")}"><p class="${"text-small"}">Posted: <time${add_attribute("datetime", rawDate, 0)}>${escape2(dateDisplay)}</time> | Tags: 
			${each(tags2, (tag, index2) => `<a${add_attribute("href", `/tags/${tag}`, 0)}>${escape2(tag)}</a>${index2 < tags2.length - 1 ? `,\xA0` : ``}`)}</p></div></header>`;
});
var metadata$1 = {
  "layout": "blog",
  "title": "Branden Builds Website Launch",
  "tags": ["svelte", "blog"],
  "date": "2021-08-03T00:00:00.000Z",
  "image": "branden-builds-website-blog.png",
  "id": "b1",
  "excerpt": "Branden Builds has officially launched and I'm very excited to show the world.",
  "slug": "branden-builds-launches",
  "keywords": "branding, website launch, svelte, branden builds, freelance web developer, frontend developer"
};
var { layout: layout$1, title: title$1, tags: tags$1, date: date$1, image: image$1, id: id$1, excerpt: excerpt$1, slug: slug$1, keywords: keywords$1 } = metadata$1;
var Branden_builds_launches = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Blog$1, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$1), {}, {
    default: () => `${validate_component(FeaturedImage, "FeaturedImage").$$render($$result, { src: FeaturedImageObj$1, alt: title$1 }, {}, {})}
${validate_component(BlogHeader, "BlogHeader").$$render($$result, { rawDate: date$1, title: title$1, tags: tags$1 }, {}, {})}
<p>I am excited to announced that I have officially launched my new website and blog. This project gave me a chance to try out some new tech I\u2019ve been eager to learn.</p>
<h2>Branden Builds Branding</h2>
<p>I reached out to a previous coworker and awesome friend, Mister Munn, who does phenomenal <a href="${"http://mistermunn.com/"}" rel="${"nofollow"}">identity branding services</a>. </p>
<h2>The Website Stack</h2>
<h3>Sveltekit</h3>
<p>I\u2019ve been hearing the help on Svelte and was eager to try a new framework. I love React and Vue, but always game to learn some new tech.  I decided on Svelte after running through a tutorial and loved how easy and simple it was to include use popular frontend techniques like reactivity and routing. </p>
<p>I ran through Gatsby and loved it as well, which I used over at my <a href="${"https://byoungz.com"}" rel="${"nofollow"}">digital nomad blog</a> and didn\u2019t really have any complaints. I just honestly wanted to play with some new tech.</p>
<h3>WindiCSS</h3>
<p><a href="${"https://windicss.org/guide/"}" rel="${"nofollow"}">WindiCSS</a> is very similar to Tailwind as in it\u2019s built off Tailwinds utility first approach. The difference, which is why WindiCSS claims to be faster than Tailwind, is it is a standalone compiler for Tailwind that generates classes on demand. </p>
<h3>mdsvex</h3>
<p>If you\u2019re familiar with MDX, this is <a href="${"https://mdsvex.com/"}" rel="${"nofollow"}">Svelte\u2019s version</a> of this. I wanted to create my blog posts in markdown so I can have them on Github and anyone can edit and submit PRs on them. It also just seemed overkill to use a full on CMS like I did with my other blog. </p>
<h3>Vite Image Tools</h3>
<p>I wanted a tool similar to Gatsby Image that handles optimization, srcset, and other modern image techniques for my images. I found <a href="${"https://github.com/JonasKruckenberg/imagetools/tree/main/packages/vite"}" rel="${"nofollow"}">Vite Image Tools</a> after looking around Discord and a Reddit post. </p>
<h2>Pain Points</h2>
<p><strong>Image handling</strong> in svelte/svelte kit is not a great experience yet. The biggest issue for me, especially after being spoiled with GatsbyImage, is a way to dynamically use images in Vite Image Tools. Vite Image Tools is awesome, but uses an import statement which means no template literals so I have to hard code in each image for my blog. This is gonna be a focus point in next iteration of my blog.</p>`
  })}`;
});
var brandenBuildsLaunches = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Branden_builds_launches,
  metadata: metadata$1
});
var FeaturedImageObj = "/_app/assets/byoungz-website-gatsby-headlesswp-af326bd1.webp 1200w";
var TraditionalWPSS = "/_app/assets/traditional-wordpress-byoungz-ss-cd0127d7.webp 850w";
var GatsbyWPSS = "/_app/assets/byoungz-gatsby-build-ce383e4d.webp 850w";
var metadata = {
  "layout": "blog",
  "title": "Headless WordPress and Gatsby",
  "tags": ["gatsbyjs", "headlesswp"],
  "date": "Jul 27 2021",
  "image": "byoungz-website-gatsby-headlesswp.jpg",
  "id": "b2",
  "excerpt": "Byoungz, my digital nmad blog was recently re-built on GtasbyJS and Headless WP setup.",
  "slug": "byoungz-headlesswp-gatsby",
  "keywords": "website launch, gatsbyjs, headlesswp, jamstack"
};
var { layout, title, tags, date, image, id, excerpt, slug, keywords } = metadata;
var Byoungz_headlesswp_gatsby = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Blog$1, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata), {}, {
    default: () => `${validate_component(FeaturedImage, "FeaturedImage").$$render($$result, { src: FeaturedImageObj, alt: title }, {}, {})}
${validate_component(BlogHeader, "BlogHeader").$$render($$result, { rawDate: date, title, tags }, {}, {})}
<p>I recently re-developed my <a href="${"https://byoungz.com"}" rel="${"nofollow"}">digital nomad blog</a> using Gatsby on the frontend and still leveraging WP as the backend. Often, you\u2019ll hear this referred to as Headless WP built on <a href="${"https://jamstack.org/what-is-jamstack/"}" rel="${"nofollow"}">Jamstack</a>, which have been pretty trendy buzzwords these past few years but with good reason. To put it simply, it means you use WordPress to manage content and source data as a backend and then display the data or frontend, in whatever tech stack you\u2019d like. </p>
<p><a href="${"https://github.com/bbuilds/byoungz-gatsby-headlesswp"}" rel="${"nofollow"}">View my Github repo here.</a></p>
<h2>Why Headless WP and Gatsby?</h2>
<h3>Traditional WordPress Woes</h3>
<p>I was facing a few interesting challenges with the WordPress community. Any developer in the WP world knows that the maintainers of WP are really pushing a block editor, which for over simplicity, is a chance to be like Wix. Upon trying to mend to to the new standards, I found enormous frustration trying to build within the block editor. Those frustrations can be a blog post another time.</p>
<p>Second, Google also released its <a href="${"https://web.dev/vitals/"}" rel="${"nofollow"}">core web vitals</a> and that in June 2021, this will have direct impact on organic search ranking. WordPress has always been infamous for being bloated and requires a bit of work for optimal site speed. I personally was tired of stripping down and not building up. Jamstack and the frameworks behind this methodology pride themselves in providing modern solutions for modern problems.</p>
<ul><li>code splitting</li>
<li>image optimization</li>
<li>inline critical styles</li>
<li>lazy-loading</li>
<li>prefetching</li>
<li>built in PWA support</li></ul>
<p>A personal reason is I just wanted to explore new tech. Outside the WordPress agency world, modern JS frameworks dominate the web developer job descriptions and I wanted to see what all the hype was about. </p>
<h3>Why Gatsby?</h3>
<p>Gatsby really seemed to lead the forefront on static site generation. They also have a really sexy developer experience with integrating WordPress into their GraphQL layer. They have a <a href="${"https://www.gatsbyjs.com/plugins/gatsby-source-wordpress/"}" rel="${"nofollow"}">plugin</a> that handles sourcing all the data for you, which was officially released this year. They also provide incremental builds with web hooks which cuts down build times drastically (a common pain point once with static site generation.) </p>
<p>There is also an awesome community and resource system behind Gatsby and using WP with Gatsby. It was really easily to find resources, source code, and tutorials to get up and moving pretty quickly. </p>
<h2>The End Product</h2>
<p>I will admit, I could have done more optimizing here. Things like some images were still using PNG and not convert to WEBp, but overall, was still pretty slow. </p>
<h3>Previous Build</h3>
<ul><li>Sage Starter Theme</li>
<li>Tailwind CSS</li>
<li>Advanced Custom Fields</li>
<li>IG Plugin</li>
<li>Autoptimze</li>
<li>Rank Math</li>
<li>Hosted on InMotion Hosting VPS server</li>
<li>Gravity forms</li></ul>
<img${add_attribute("srcset", TraditionalWPSS, 0)} alt="${"Byoungz Traditional Website Score Screenshot"}" type="${"image/webp"}" class="${"post-img"}">
<h3>Current Build</h3>
<ul><li>Gatsby JS</li>
<li>WPGraphQL</li>
<li>Yoast + WpGraphql Add on</li>
<li>ACF + WPGraphql Addon</li>
<li>Hosted on Netlify</li>
<li>Jotforms</li></ul>
<img${add_attribute("srcset", GatsbyWPSS, 0)} alt="${"Byoungz headless WP Score Screenshot"}" type="${"image/webp"}" class="${"post-img"}">
<h2>Final Thoughts</h2>
<p>I absolutely loved working with Gatsby and was fairly impressed how quickly I could get moving.</p>
<h3>Pit Falls</h3>
<p>If you\u2019re not familiar with the JS development world, be prepared for NPM hell. As I was cloning down different community plugins and themes, there was a lot of compatibility issues. Updating NPM packages was a grueling process and wanted to rip my hair out at times. I personally will only use officially developed plugins by Gatsby and mostly going to stay away from community sourced. </p>
<p>Losing the WP plugin ecosystem. Love it or hate it, WP makes it super easy to have custom functionality on your website with its plugin ecosystem. While there is a lot of outdated trash there, the positives outweighs the negative here by a long shot. I had to write out my own serverless IG snippet to pull in my feed onto my new Gatsby site. </p>`
  })}`;
});
var byoungzHeadlesswpGatsby = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Byoungz_headlesswp_gatsby,
  metadata
});
var get$4 = async () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://bbuilds-website.netlify.app/</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>1.00</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/services</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/blog</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/contact</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/blog/branden-builds-launches</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/svelte</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/blog</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/blog/byoungz-headlesswp-gatsby</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/gatsbyjs</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/headlesswp</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    
    
    </urlset>
  `;
  return {
    headers: {
      "Content-Type": "application/xml"
    },
    status: 200,
    body
  };
};
var sitemap_xml = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$4
});
async function get$3() {
  return {
    body: {
      title: "Services && Skills",
      services: [
        {
          title: "Frontend Development",
          copy: "JS Frameworks, SPAs, static sites, speed optimization.",
          url: "/web-development"
        },
        {
          title: "Backend Development",
          copy: "APIs and dabbling in DevOps",
          url: "/web-development"
        },
        {
          title: "WordPress Solutions",
          copy: "Headless, Block Editor, Plugin, Themes",
          url: "/wordpress-development"
        },
        {
          title: "UI/UX Design",
          copy: "Website Design, Target Users, Behavorial Psychology",
          url: "/branding"
        },
        {
          title: "Branding Development",
          copy: "Market Research, Strategy, Identity",
          url: "/branding"
        },
        {
          title: "Search Engine Optimization",
          copy: "Onpage, Local, Analyics Analysis",
          url: "/seo"
        }
      ]
    }
  };
}
var services$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$3
});
async function get$2() {
  return {
    body: {
      title: "Tech Stax",
      copy: "I enjoy using, but not limited to...",
      skills: [
        {
          logo: "/svg/logos/html.svg",
          title: "HTML",
          type: "frontend"
        },
        {
          logo: "/svg/logos/css.svg",
          title: "CSS",
          type: "frontend"
        },
        {
          logo: "/svg/logos/javascript.svg",
          title: "JavaScript",
          type: "frontend"
        },
        {
          logo: "/svg/logos/php.svg",
          title: "PHP",
          type: "backend"
        },
        {
          logo: "/svg/logos/nodejs.svg",
          title: "Node.js",
          type: "backend"
        },
        {
          logo: "/svg/logos/typescript.svg",
          title: "Typescript",
          type: "both"
        },
        {
          logo: "/svg/logos/graphql.svg",
          title: "GraphQL",
          type: "both"
        },
        {
          logo: "/svg/logos/sass.svg",
          title: "SASS",
          type: "frontend"
        },
        {
          logo: "/svg/logos/mongodb.svg",
          title: "MongoDB",
          type: "backend"
        },
        {
          logo: "/svg/logos/mysql.svg",
          title: "MySQL",
          type: "backend"
        },
        {
          logo: "/svg/logos/react.svg",
          title: "React",
          type: "frontend"
        },
        {
          logo: "/svg/logos/svelte.svg",
          title: "Svelte",
          type: "frontend"
        },
        {
          logo: "/svg/logos/vuejs.svg",
          title: "Vue",
          type: "frontend"
        },
        {
          logo: "/svg/logos/laravel.svg",
          title: "Laravel",
          type: "backend"
        },
        {
          logo: "/svg/logos/gatsby.svg",
          title: "Gatsby",
          type: "frontend"
        },
        {
          logo: "/svg/logos/nextjs.svg",
          title: "Next",
          type: "frontend"
        },
        {
          logo: "/svg/logos/docker.svg",
          title: "Docker",
          type: "backend"
        },
        {
          logo: "/svg/logos/wordpress.svg",
          title: "WordPress",
          type: "both"
        }
      ]
    }
  };
}
var skillset = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$2
});
async function get$1() {
  return {
    body: {
      processTitle: "Methods && Madness",
      processList: [
        {
          id: 1,
          title: "Discovery",
          url: "https://google.com/",
          copy: "What are we solving?",
          svg: '<svg aria-hidden="true" focusable="false"  class="lightbulb-icon svg relative" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M176 80c-52.94 0-96 43.06-96 96 0 8.84 7.16 16 16 16s16-7.16 16-16c0-35.3 28.72-64 64-64 8.84 0 16-7.16 16-16s-7.16-16-16-16zM96.06 459.17c0 3.15.93 6.22 2.68 8.84l24.51 36.84c2.97 4.46 7.97 7.14 13.32 7.14h78.85c5.36 0 10.36-2.68 13.32-7.14l24.51-36.84c1.74-2.62 2.67-5.7 2.68-8.84l.05-43.18H96.02l.04 43.18zM176 0C73.72 0 0 82.97 0 176c0 44.37 16.45 84.85 43.56 115.78 16.64 18.99 42.74 58.8 52.42 92.16v.06h48v-.12c-.01-4.77-.72-9.51-2.15-14.07-5.59-17.81-22.82-64.77-62.17-109.67-20.54-23.43-31.52-53.15-31.61-84.14-.2-73.64 59.67-128 127.95-128 70.58 0 128 57.42 128 128 0 30.97-11.24 60.85-31.65 84.14-39.11 44.61-56.42 91.47-62.1 109.46a47.507 47.507 0 0 0-2.22 14.3v.1h48v-.05c9.68-33.37 35.78-73.18 52.42-92.16C335.55 260.85 352 220.37 352 176 352 78.8 273.2 0 176 0z"></path></svg>'
        },
        {
          id: 2,
          title: "Research",
          url: "https://google.com/",
          copy: "Who are we solving this for?",
          svg: '<svg aria-hidden="true" focusable="false" class="searchengin-icon svg relative" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 512"><path fill="currentColor" d="M220.6 130.3l-67.2 28.2V43.2L98.7 233.5l54.7-24.2v130.3l67.2-209.3zm-83.2-96.7l-1.3 4.7-15.2 52.9C80.6 106.7 52 145.8 52 191.5c0 52.3 34.3 95.9 83.4 105.5v53.6C57.5 340.1 0 272.4 0 191.6c0-80.5 59.8-147.2 137.4-158zm311.4 447.2c-11.2 11.2-23.1 12.3-28.6 10.5-5.4-1.8-27.1-19.9-60.4-44.4-33.3-24.6-33.6-35.7-43-56.7-9.4-20.9-30.4-42.6-57.5-52.4l-9.7-14.7c-24.7 16.9-53 26.9-81.3 28.7l2.1-6.6 15.9-49.5c46.5-11.9 80.9-54 80.9-104.2 0-54.5-38.4-102.1-96-107.1V32.3C254.4 37.4 320 106.8 320 191.6c0 33.6-11.2 64.7-29 90.4l14.6 9.6c9.8 27.1 31.5 48 52.4 57.4s32.2 9.7 56.8 43c24.6 33.2 42.7 54.9 44.5 60.3s.7 17.3-10.5 28.5zm-9.9-17.9c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z"></path></svg>'
        },
        {
          id: 3,
          title: "Create",
          url: "https://google.com/",
          copy: "How will we build this solution?",
          svg: '<svg aria-hidden="true" focusable="false" class="svg relative code-icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M278.9 511.5l-61-17.7c-6.4-1.8-10-8.5-8.2-14.9L346.2 8.7c1.8-6.4 8.5-10 14.9-8.2l61 17.7c6.4 1.8 10 8.5 8.2 14.9L293.8 503.3c-1.9 6.4-8.5 10.1-14.9 8.2zm-114-112.2l43.5-46.4c4.6-4.9 4.3-12.7-.8-17.2L117 256l90.6-79.7c5.1-4.5 5.5-12.3.8-17.2l-43.5-46.4c-4.5-4.8-12.1-5.1-17-.5L3.8 247.2c-5.1 4.7-5.1 12.8 0 17.5l144.1 135.1c4.9 4.6 12.5 4.4 17-.5zm327.2.6l144.1-135.1c5.1-4.7 5.1-12.8 0-17.5L492.1 112.1c-4.8-4.5-12.4-4.3-17 .5L431.6 159c-4.6 4.9-4.3 12.7.8 17.2L523 256l-90.6 79.7c-5.1 4.5-5.5 12.3-.8 17.2l43.5 46.4c4.5 4.9 12.1 5.1 17 .6z"></path></svg>'
        },
        {
          id: 4,
          title: "Launch",
          url: "https://google.com/",
          copy: "How can the market use our solution?",
          svg: '<svg aria-hidden="true" focusable="false" class="svg relative icon-rocket" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z"></path></svg>'
        }
      ]
    }
  };
}
var process2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$1
});
async function get() {
  return {
    body: {
      heroTitle: "Greetings I'm",
      heroSubtitle: "I enjoy building...",
      heroServices: [
        "Engaging Experiences \u{1F981}",
        "Lean Products \u26A1",
        "Accelerated Brands \u{1F331}",
        "Technical SEO \u{1F913}"
      ]
    }
  };
}
var hero = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
var css$d = {
  code: "a.svelte-aoksc{font-size:1.563rem}@media(min-width: 768px){a.svelte-aoksc{font-size:1rem;margin-bottom:0px}.dropdown-menu.svelte-aoksc{min-width:22.5rem;visibility:hidden;opacity:0}}.active.svelte-aoksc{--tw-text-opacity:1;color:rgba(255, 205, 103, var(--tw-text-opacity))}",
  map: `{"version":3,"file":"NavItem.svelte","sources":["NavItem.svelte"],"sourcesContent":["<script>\\n\\timport { page } from '$app/stores';\\n\\timport { fly } from 'svelte/transition';\\n\\n\\texport let navItem;\\n\\n\\tconst { href, isHighlighted, title, children } = navItem;\\n\\n\\t$: isActivePage = $page.path === '/' ? /\\\\/$/.test(href) : href.indexOf($page.path) >= 0;\\n\\n\\n<\/script>\\n\\n<a\\n\\tclass:active={isActivePage}\\n\\tclass:highlighted={isHighlighted}\\n\\t{href}\\n\\tsveltekit:prefetch\\n\\ton:click\\n\\tclass=\\"text-bbuilds-teal hover:text-bbuilds-yellow mb-4\\"\\n>\\n\\t{title}\\n\\n\\t{#if children}\\n\\t\\t<div\\n\\t\\t\\tclass=\\"dropdown-menu md:absolute md:z-50 md:rounded  md:shadow-lg md:bg-bbuilds-black md:text-white md:border-bbuilds-yellow md:border transition duration-200\\"\\n\\t\\t>\\n\\t\\t\\t<ul class=\\"list-none overflow-hidden w-full\\">\\n\\t\\t\\t\\t{#each children as item}\\n\\t\\t\\t\\t\\t<li class=\\"menu-item\\">\\n\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\thref={item.href}\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"flex py-2 px-4 mb-0 transition duration-300 hover:bg-bbuilds-yellow hover:text-bbuilds-black\\"\\n\\t\\t\\t\\t\\t\\t\\t>{item.title}</a\\n\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t</ul>\\n\\t\\t</div>\\n\\t{/if}\\n</a>\\n\\n<style>a {\\n  font-size: 1.563rem;\\n}\\n@media (min-width: 768px) {\\n  a {\\n    font-size: 1rem;\\n    margin-bottom: 0px;\\n  }\\n  .dropdown-menu {\\n    min-width: 22.5rem;\\n    visibility: hidden;\\n    opacity: 0;\\n  }\\n}\\n.active {\\n  --tw-text-opacity: 1;\\n  color: rgba(255, 205, 103, var(--tw-text-opacity));\\n}</style>\\n"],"names":[],"mappings":"AA0CO,CAAC,aAAC,CAAC,AACR,SAAS,CAAE,QAAQ,AACrB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,CAAC,aAAC,CAAC,AACD,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,cAAc,aAAC,CAAC,AACd,SAAS,CAAE,OAAO,CAClB,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,CAAC,AACZ,CAAC,AACH,CAAC,AACD,OAAO,aAAC,CAAC,AACP,iBAAiB,CAAE,CAAC,CACpB,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAAC,AACpD,CAAC"}`
};
var NavItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isActivePage;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { navItem } = $$props;
  const { href, isHighlighted, title: title2, children } = navItem;
  if ($$props.navItem === void 0 && $$bindings.navItem && navItem !== void 0)
    $$bindings.navItem(navItem);
  $$result.css.add(css$d);
  isActivePage = $page.path === "/" ? /\/$/.test(href) : href.indexOf($page.path) >= 0;
  $$unsubscribe_page();
  return `<a${add_attribute("href", href, 0)} sveltekit:prefetch class="${[
    "text-bbuilds-teal hover:text-bbuilds-yellow mb-4 svelte-aoksc",
    (isActivePage ? "active" : "") + " " + (isHighlighted ? "highlighted" : "")
  ].join(" ").trim()}">${escape2(title2)}

	${children ? `<div class="${"dropdown-menu md:absolute md:z-50 md:rounded  md:shadow-lg md:bg-bbuilds-black md:text-white md:border-bbuilds-yellow md:border transition duration-200 svelte-aoksc"}"><ul class="${"list-none overflow-hidden w-full"}">${each(children, (item) => `<li class="${"menu-item"}"><a${add_attribute("href", item.href, 0)} class="${"flex py-2 px-4 mb-0 transition duration-300 hover:bg-bbuilds-yellow hover:text-bbuilds-black svelte-aoksc"}">${escape2(item.title)}</a>
					</li>`)}</ul></div>` : ``}
</a>`;
});
var subscriber_queue2 = [];
function writable2(value, start = noop2) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal2(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue2.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop2;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
var mobileMenuState = writable2(false);
var SocialMedia = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const socialItems = [
    {
      href: "https://github.com/bbuilds/",
      label: "Github",
      icon: '<svg aria-hidden="true"  class="svg github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM277.3 415.7c-8.4 1.5-11.5-3.7-11.5-8 0-5.4.2-33 .2-55.3 0-15.6-5.2-25.5-11.3-30.7 37-4.1 76-9.2 76-73.1 0-18.2-6.5-27.3-17.1-39 1.7-4.3 7.4-22-1.7-45-13.9-4.3-45.7 17.9-45.7 17.9-13.2-3.7-27.5-5.6-41.6-5.6-14.1 0-28.4 1.9-41.6 5.6 0 0-31.8-22.2-45.7-17.9-9.1 22.9-3.5 40.6-1.7 45-10.6 11.7-15.6 20.8-15.6 39 0 63.6 37.3 69 74.3 73.1-4.8 4.3-9.1 11.7-10.6 22.3-9.5 4.3-33.8 11.7-48.3-13.9-9.1-15.8-25.5-17.1-25.5-17.1-16.2-.2-1.1 10.2-1.1 10.2 10.8 5 18.4 24.2 18.4 24.2 9.7 29.7 56.1 19.7 56.1 19.7 0 13.9.2 36.5.2 40.6 0 4.3-3 9.5-11.5 8-66-22.1-112.2-84.9-112.2-158.3 0-91.8 70.2-161.5 162-161.5S388 165.6 388 257.4c.1 73.4-44.7 136.3-110.7 158.3zm-98.1-61.1c-1.9.4-3.7-.4-3.9-1.7-.2-1.5 1.1-2.8 3-3.2 1.9-.2 3.7.6 3.9 1.9.3 1.3-1 2.6-3 3zm-9.5-.9c0 1.3-1.5 2.4-3.5 2.4-2.2.2-3.7-.9-3.7-2.4 0-1.3 1.5-2.4 3.5-2.4 1.9-.2 3.7.9 3.7 2.4zm-13.7-1.1c-.4 1.3-2.4 1.9-4.1 1.3-1.9-.4-3.2-1.9-2.8-3.2.4-1.3 2.4-1.9 4.1-1.5 2 .6 3.3 2.1 2.8 3.4zm-12.3-5.4c-.9 1.1-2.8.9-4.3-.6-1.5-1.3-1.9-3.2-.9-4.1.9-1.1 2.8-.9 4.3.6 1.3 1.3 1.8 3.3.9 4.1zm-9.1-9.1c-.9.6-2.6 0-3.7-1.5s-1.1-3.2 0-3.9c1.1-.9 2.8-.2 3.7 1.3 1.1 1.5 1.1 3.3 0 4.1zm-6.5-9.7c-.9.9-2.4.4-3.5-.6-1.1-1.3-1.3-2.8-.4-3.5.9-.9 2.4-.4 3.5.6 1.1 1.3 1.3 2.8.4 3.5zm-6.7-7.4c-.4.9-1.7 1.1-2.8.4-1.3-.6-1.9-1.7-1.5-2.6.4-.6 1.5-.9 2.8-.4 1.3.7 1.9 1.8 1.5 2.6z"></path></svg>'
    },
    {
      href: "https://www.linkedin.com/in/branden-builds/",
      label: "LinkedIn",
      icon: '<svg aria-hidden="true" focusable="false" class="svg linkedin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>'
    }
  ];
  return `<ul class="${"flex"}">${each(socialItems, (link) => `<li class="${"mr-2"}"><a${add_attribute("href", link.href, 0)} target="${"_blank"}" class="${"block transition duration-300 ease-in-out transform hover:-translate-y-1 text-bbuilds-teal w-6"}"><!-- HTML_TAG_START -->${link.icon}<!-- HTML_TAG_END --></a>
		</li>`)}</ul>`;
});
var css$c = {
  code: "@media(min-width: 768px){.nav-items.svelte-7fwtyx{display:none}}",
  map: `{"version":3,"file":"MobileMenu.svelte","sources":["MobileMenu.svelte"],"sourcesContent":["<script>\\n\\timport { onMount } from 'svelte';\\n\\timport { fly } from 'svelte/transition';\\n\\n\\timport { showHideOverflowY } from '$lib/utils/overflowY';\\n\\n\\timport NavItem from './NavItem.svelte';\\n\\timport {mobileMenuState} from './state';\\n\\timport SocialMedia from './SocialMedia.svelte';\\n\\n\\texport let navItems = [];\\n\\n\\tonMount(() => {\\n\\t\\tconst handleTabletChange = (e) => {\\n\\t\\t\\tif (e.matches) {\\n\\t\\t\\t\\t$mobileMenuState = false;\\n\\t\\t\\t\\tshowHideOverflowY(false);\\n\\t\\t\\t}\\n\\t\\t};\\n\\t\\tlet query = window.matchMedia('(min-width: 768px)');\\n\\t\\tquery.addEventListener('change', handleTabletChange);\\n\\t});\\n<\/script>\\n\\n{#if $mobileMenuState}\\n\\t<div\\n\\t\\tclass=\\"nav-items absolute flex flex-col px-4 pt-8 pb-20 overflow-y-scroll w-screen h-screen space-y-xx-small bg-bbuilds-black z-10 border-t border-bbuilds-yellow\\"\\n\\t\\ttransition:fly=\\"{{duration: 200, y: 20, opacity: 0.5}}\\">\\n\\t\\t{#each navItems as navItem}\\n\\t\\t\\t<NavItem\\n\\t\\t\\t\\t{navItem}\\n\\t\\t\\t\\ton:click={() => {\\n\\t\\t\\t\\t\\t$mobileMenuState = !$mobileMenuState;\\n\\t\\t\\t\\t\\tshowHideOverflowY(false);\\n\\t\\t\\t\\t}}\\n\\t\\t\\t/>\\n\\t\\t{/each}\\n\\t\\t<SocialMedia />\\n\\t</div>\\n{/if}\\n\\n<style>@media (min-width: 768px) {\\n  .nav-items {\\n    display: none;\\n  }\\n}</style>\\n"],"names":[],"mappings":"AAyCO,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAChC,UAAU,cAAC,CAAC,AACV,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC"}`
};
var MobileMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $mobileMenuState, $$unsubscribe_mobileMenuState;
  $$unsubscribe_mobileMenuState = subscribe(mobileMenuState, (value) => $mobileMenuState = value);
  let { navItems = [] } = $$props;
  if ($$props.navItems === void 0 && $$bindings.navItems && navItems !== void 0)
    $$bindings.navItems(navItems);
  $$result.css.add(css$c);
  $$unsubscribe_mobileMenuState();
  return `${$mobileMenuState ? `<div class="${"nav-items absolute flex flex-col px-4 pt-8 pb-20 overflow-y-scroll w-screen h-screen space-y-xx-small bg-bbuilds-black z-10 border-t border-bbuilds-yellow svelte-7fwtyx"}">${each(navItems, (navItem) => `${validate_component(NavItem, "NavItem").$$render($$result, { navItem }, {}, {})}`)}
		${validate_component(SocialMedia, "SocialMedia").$$render($$result, {}, {}, {})}</div>` : ``}`;
});
var css$b = {
  code: "@media(min-width: 768px){button.svelte-1fguiqf{display:none}}",
  map: `{"version":3,"file":"Toggle.svelte","sources":["Toggle.svelte"],"sourcesContent":["<script>\\n\\timport { showHideOverflowY } from '$lib/utils/overflowY';\\n\\n\\timport {mobileMenuState} from './state';\\n\\n\\tconst handleToggle = () => {\\n\\t\\t$mobileMenuState = !$mobileMenuState;\\n\\t\\tif ($mobileMenuState) {\\n\\t\\t\\tshowHideOverflowY(true);\\n\\t\\t} else {\\n\\t\\t\\tshowHideOverflowY(false);\\n\\t\\t}\\n\\t};\\n<\/script>\\n\\n<button\\n\\ton:click={handleToggle}\\n\\taria-label=\\"Show / hide nav items\\"\\n\\tclass=\\"flex justify-center items-center h-8 w-12 rounded-xl bg-bbuilds-teal ml-auto\\"\\n>\\n\\t{#if $mobileMenuState}\\n\\t\\t<svg xmlns=\\"http://www.w3.org/2000/svg\\" fill=\\"none\\" width=\\"12\\" height=\\"12\\" viewBox=\\"0 0 12 12\\">\\n\\t\\t\\t<path\\n\\t\\t\\t\\tfill=\\"#292929\\"\\n\\t\\t\\t\\tfill-rule=\\"evenodd\\"\\n\\t\\t\\t\\td=\\"M10.242 11.657a1 1 0 001.414-1.414L7.413 6l4.243-4.243A1 1 0 0010.242.343L5.999 4.586 1.757.343A1 1 0 10.342 1.757L4.585 6 .342 10.243a1 1 0 001.415 1.414l4.242-4.243 4.243 4.243z\\"\\n\\t\\t\\t\\tclip-rule=\\"evenodd\\"\\n\\t\\t\\t/>\\n\\t\\t</svg>\\n\\t{:else}\\n\\t\\t<svg width=\\"16\\" height=\\"8\\" viewBox=\\"0 0 16 8\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\n\\t\\t\\t<rect width=\\"16\\" height=\\"2\\" rx=\\"1\\" fill=\\"#292929\\" />\\n\\t\\t\\t<rect y=\\"6\\" width=\\"16\\" height=\\"2\\" rx=\\"1\\" fill=\\"#292929\\" />\\n\\t\\t</svg>\\n\\t{/if}\\n</button>\\n\\n<style>@media (min-width: 768px) {\\n  button {\\n    display: none;\\n  }\\n}</style>\\n"],"names":[],"mappings":"AAqCO,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAChC,MAAM,eAAC,CAAC,AACN,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC"}`
};
var Toggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $mobileMenuState, $$unsubscribe_mobileMenuState;
  $$unsubscribe_mobileMenuState = subscribe(mobileMenuState, (value) => $mobileMenuState = value);
  $$result.css.add(css$b);
  $$unsubscribe_mobileMenuState();
  return `<button aria-label="${"Show / hide nav items"}" class="${"flex justify-center items-center h-8 w-12 rounded-xl bg-bbuilds-teal ml-auto svelte-1fguiqf"}">${$mobileMenuState ? `<svg xmlns="${"http://www.w3.org/2000/svg"}" fill="${"none"}" width="${"12"}" height="${"12"}" viewBox="${"0 0 12 12"}"><path fill="${"#292929"}" fill-rule="${"evenodd"}" d="${"M10.242 11.657a1 1 0 001.414-1.414L7.413 6l4.243-4.243A1 1 0 0010.242.343L5.999 4.586 1.757.343A1 1 0 10.342 1.757L4.585 6 .342 10.243a1 1 0 001.415 1.414l4.242-4.243 4.243 4.243z"}" clip-rule="${"evenodd"}"></path></svg>` : `<svg width="${"16"}" height="${"8"}" viewBox="${"0 0 16 8"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><rect width="${"16"}" height="${"2"}" rx="${"1"}" fill="${"#292929"}"></rect><rect y="${"6"}" width="${"16"}" height="${"2"}" rx="${"1"}" fill="${"#292929"}"></rect></svg>`}
</button>`;
});
var Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg id="${"logo-icon"}" class="${"logo-icon"}" viewBox="${"0 0 178.565 291.148"}" xmlns="${"http://www.w3.org/2000/svg"}" aria-hidden="${"true"}" focusable="${"false"}" fill="${"none"}"><rect id="${"line"}" class="${"fill-current logo-icon-left-bar"}" width="${"33.422"}" height="${"145.57"}"></rect><rect id="${"square"}" class="${"fill-current logo-icon-square"}" width="${"78.641"}" height="${"78.641"}" transform="${"translate(67.079 34)"}"></rect><path id="${"box"}" class="${"fill-current logo-icon-box"}" d="${"M5017.408,471.579H4905.343V617.148h145.486V471.579Zm0,112.147h-78.642V505h78.642Z"}" transform="${"translate(-4872.264 -326)"}"></path></svg>`;
});
var Name = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg xmlns="${"http://www.w3.org/2000/svg"}" width="${"2454.945"}" height="${"286.805"}" viewBox="${"0 0 2454.945 286.805"}" class="${"logo-name"}"><g id="${"Group_77"}" data-name="${"Group 77"}" transform="${"translate(-5144.367 -337.6)"}"><path id="${"logo-b"}" data-name="${"logo-b"}" class="${"logo-letter fill-current logo-b"}" d="${"M5144.367,618.215V358.233h91.2q40.438,0,60.457,18.57t20.014,49.52a69.109,69.109,0,0,1-7.015,29.713q-7.023,14.856-24.761,24.347,26.4,10.32,35.284,28.061t8.872,33.84q0,33.02-20.634,54.472t-63.138,21.459Zm85.423-229.032h-52.409V471.3h54.885q27.235,0,38.172-9.7t10.936-31.156q0-21.452-13.412-31.362T5229.79,389.183Zm9.079,111.833h-61.488v86.248h62.726q29.3,0,41.473-10.935t12.174-31.982q0-21.047-12.587-32.188T5238.869,501.016Z"}"></path><path id="${"logo-r"}" data-name="${"logo-r"}" class="${"logo-letter fill-current logo-r"}" d="${"M5375.048,618.215V449.021h32.6v35.9q9.073-21.047,24.967-31.569a63.887,63.887,0,0,1,36.109-10.524,40.641,40.641,0,0,1,7.428.619c2.2.413,4.126.761,5.777,1.032v37.553q-6.606-1.237-13.412-2.064a112.106,112.106,0,0,0-13.411-.825q-25.178,0-36.315,15.682T5407.648,546v72.217Z"}"></path><path id="${"logo-a"}" data-name="${"logo-a"}" class="${"logo-letter fill-current logo-a"}" d="${"M5500.909,533.617q0-21.867,7.428-39t18.983-28.474a81.2,81.2,0,0,1,26-17.332,75.019,75.019,0,0,1,28.887-5.984q17.737,0,34.87,9.7t27.03,29.093v-32.6h33.014V618.215H5644.1v-32.6q-9.9,19.4-27.03,29.093t-34.87,9.7a75.019,75.019,0,0,1-28.887-5.984,80.989,80.989,0,0,1-26-17.332q-11.559-11.346-18.983-28.474T5500.909,533.617Zm87.073-59.836q-24.354,0-38.791,17.332t-14.443,42.5q0,25.176,14.443,42.506t38.791,17.332q23.522,0,40.235-15.682t16.713-44.156q0-28.473-16.506-44.155T5587.982,473.781Z"}"></path><path id="${"logo-n"}" data-name="${"logo-n"}" class="${"logo-letter fill-current logo-n"}" d="${"M5739.018,618.215V449.021h33.013v37.552q9.073-22.284,26.205-33.013a68.309,68.309,0,0,1,36.934-10.73q27.642,0,44.568,19.6t16.919,55.5V618.215h-33.013V526.189q0-24.759-9.492-38.584t-30.537-13.824q-22.285,0-36.934,16.094t-14.65,48.282v80.058Z"}"></path><path id="${"logo-d"}" data-name="${"logo-d"}" class="${"logo-letter fill-current logo-d"}" d="${"M5944.112,533.617q0-21.867,7.221-39t18.364-28.474a77.31,77.31,0,0,1,25.379-17.332,72.579,72.579,0,0,1,28.268-5.984q18.154,0,35.9,9.7t28.062,29.506V337.6h33.013V618.215h-33.013V585.2q-10.32,19.808-28.062,29.506t-35.9,9.7a72.579,72.579,0,0,1-28.268-5.984,77.113,77.113,0,0,1-25.379-17.332q-11.142-11.346-18.364-28.474T5944.112,533.617Zm87.073-59.836q-24.354,0-38.791,17.332t-14.444,42.5q0,25.176,14.444,42.506t38.791,17.332q23.928,0,40.441-15.682t16.507-44.156q0-28.473-16.713-44.155T6031.185,473.781Z"}"></path><path id="${"logo-e"}" data-name="${"logo-e"}" class="${"logo-letter fill-current logo-e"}" d="${"M6257.326,624.405q-20.225,0-36.521-6.809a76.624,76.624,0,0,1-27.443-18.983,86.97,86.97,0,0,1-17.332-28.887,103.136,103.136,0,0,1-6.19-36.109,99.669,99.669,0,0,1,6.6-36.933A84.822,84.822,0,0,1,6194.806,468a83.013,83.013,0,0,1,27.649-18.57,88.971,88.971,0,0,1,34.458-6.6q36.309,0,60.044,23.729t23.728,62.932q0,3.307-.206,6.6t-.619,6.19H6204.092q2.06,24.354,16.094,38.79,14.024,14.451,37.14,14.444,17.332,0,29.919-7.841t16.3-20.633h33.839q-7.427,26-28.268,41.679T6257.326,624.405Zm-.413-152.688q-20.223,0-33.838,10.936T6205.33,515.46h101.1q-1.655-21.047-15.269-32.4T6256.913,471.717Z"}"></path><path id="${"logo-n2"}" data-name="${"logo-n2"}" class="${"logo-letter fill-current logo-n2"}" d="${"M6391.03,618.215V449.021h33.013v37.552q9.072-22.284,26.205-33.013a68.305,68.305,0,0,1,36.933-10.73q27.643,0,44.569,19.6t16.919,55.5V618.215h-33.013V526.189q0-24.759-9.492-38.584t-30.537-13.824q-22.284,0-36.934,16.094t-14.65,48.282v80.058Z"}"></path><path id="${"logo-b2"}" data-name="${"logo-b2"}" class="${"logo-letter fill-current logo-b2"}" d="${"M6609.741,618.215V358.233h91.2q40.438,0,60.456,18.57t20.014,49.52a69.1,69.1,0,0,1-7.015,29.713q-7.022,14.856-24.76,24.347,26.4,10.32,35.283,28.061t8.872,33.84q0,33.02-20.633,54.472t-63.139,21.459Zm85.423-229.032h-52.409V471.3h54.885q27.237,0,38.172-9.7t10.936-31.156q0-21.452-13.412-31.362T6695.164,389.183Zm9.079,111.833h-61.488v86.248h62.726q29.3,0,41.473-10.935t12.174-31.982q0-21.047-12.587-32.188T6704.243,501.016Z"}"></path><path id="${"logo-u"}" data-name="${"logo-u"}" class="${"logo-letter fill-current logo-u"}" d="${"M6870.547,449.021v101.1q0,20.638,8.46,31.981t27.442,11.349q20.631,0,34.045-16.1t13.412-48.282V449.021h33.014V618.215h-33.014V581.9q-8.667,21.877-24.76,32.188a63.775,63.775,0,0,1-35.077,10.317q-25.176,0-40.854-17.332t-15.682-48.7V449.021Z"}"></path><path id="${"logo-i"}" data-name="${"logo-i"}" class="${"logo-letter fill-current logo-i"}" d="${"M7048.816,618.215V449.021h33.013V618.215Z"}"></path><path id="${"logo-l"}" data-name="${"logo-l"}" class="${"logo-letter fill-current logo-l"}" d="${"M7143.728,618.215V337.6h33.014V618.215Z"}"></path><path id="${"logo-d2"}" data-name="${"logo-d2"}" class="${"logo-letter fill-current logo-d2"}" d="${"M7227.086,533.617q0-21.867,7.222-39t18.363-28.474a77.317,77.317,0,0,1,25.38-17.332,72.578,72.578,0,0,1,28.267-5.984q18.155,0,35.9,9.7t28.061,29.506V337.6H7403.3V618.215h-33.014V585.2q-10.321,19.808-28.061,29.506t-35.9,9.7a72.578,72.578,0,0,1-28.267-5.984,77.12,77.12,0,0,1-25.38-17.332q-11.142-11.346-18.363-28.474T7227.086,533.617Zm87.073-59.836q-24.354,0-38.791,17.332t-14.443,42.5q0,25.176,14.443,42.506t38.791,17.332q23.927,0,40.442-15.682t16.506-44.156q0-28.473-16.713-44.155T7314.159,473.781Z"}"></path><path id="${"logo-s"}" data-name="${"logo-s"}" class="${"logo-letter fill-current logo-s"}" d="${"M7593.535,499.366h-33.427q-.415-14.025-10.316-21.665t-27.649-7.634q-15.273,0-24.348,5.364t-9.079,14.856a16.768,16.768,0,0,0,7.635,14.443,57.128,57.128,0,0,0,19.189,8.254l41.267,9.9a74.726,74.726,0,0,1,29.919,14.237q12.582,10.117,12.586,30.744,0,23.523-18.983,40.029t-52.409,16.507q-32.188,0-54.473-16.919t-22.7-44.156h33.426q1.644,17.332,14.031,25.585t30.95,8.254q17.739,0,26.824-7.015t9.079-16.92A16.413,16.413,0,0,0,7557.632,559q-7.427-5.154-18.983-8.046l-35.489-8.666a81.186,81.186,0,0,1-32.188-15.476q-14.45-11.344-14.444-33.632,0-22.69,17.539-36.521t48.489-13.825q31.771,0,50.758,14.65T7593.535,499.366Z"}"></path><rect id="${"logo-i-dot"}" data-name="${"logo-i-dot"}" class="${"logo-letter fill-current logo-i-dot"}" width="${"39.642"}" height="${"39.642"}" transform="${"translate(7045.502 373.739)"}"></rect></g></svg>`;
});
var css$a = {
  code: ".logo .logo-name{display:none;--tw-text-opacity:1;color:rgba(230, 231, 232, var(--tw-text-opacity));height:auto}.logo .logo-icon{height:auto;max-width:25px;min-width:25px}.logo .logo-icon-left-bar{--tw-text-opacity:1;color:rgba(230, 231, 232, var(--tw-text-opacity))}.logo .logo-icon-square{--tw-text-opacity:1;color:rgba(255, 205, 103, var(--tw-text-opacity))}.logo .logo-icon-box{--tw-text-opacity:1;color:rgba(1, 253, 246, var(--tw-text-opacity))}.logo.svelte-1lg21q5{max-width:25%}@media(min-width: 768px){.logo .logo-name{display:block;max-width:25rem}.logo .logo-icon{margin-right:0.5rem}.menu-item:hover .dropdown-menu, .menu-item:focus-within .dropdown-menu{visibility:visible;opacity:1}}@media(min-width: 1024px){.logo.svelte-1lg21q5{max-width:15%}}",
  map: `{"version":3,"file":"Index.svelte","sources":["Index.svelte"],"sourcesContent":["<script>\\n\\timport { page } from '$app/stores';\\n\\timport NavItem from './NavItem.svelte';\\n\\timport MobileMenu from './MobileMenu.svelte';\\n\\timport MobileMenuToggle from './Toggle.svelte';\\n\\timport SocialMedia from './SocialMedia.svelte';\\n\\timport LogoIcon from '$lib/logo/Icon.svelte';\\n\\timport LogoName from '$lib/logo/Name.svelte';\\n\\timport { showHideOverflowY } from '$lib/utils/overflowY';\\n\\timport { mobileMenuState } from './state';\\n\\n\\tconst navItems = [\\n\\t\\t{\\n\\t\\t\\ttitle: 'Services',\\n\\t\\t\\thref: '/services',\\n\\t\\t\\tchildren: [\\n\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\ttitle: 'Web Development',\\n\\t\\t\\t\\t\\thref: '/web-development'\\n\\t\\t\\t\\t},\\n\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\ttitle: 'Headless WordPress Development',\\n\\t\\t\\t\\t\\thref: '/headless-wordpress-development'\\n\\t\\t\\t\\t},\\n\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\ttitle: 'WordPress Development',\\n\\t\\t\\t\\t\\thref: '/wordpress-development'\\n\\t\\t\\t\\t},\\n\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\ttitle: 'Search Engine Optimization',\\n\\t\\t\\t\\t\\thref: '/seo'\\n\\t\\t\\t\\t},\\n\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\ttitle: 'Storytelling / Branding',\\n\\t\\t\\t\\t\\thref: '/branding'\\n\\t\\t\\t\\t}\\n\\t\\t\\t]\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\ttitle: 'Blog',\\n\\t\\t\\thref: '/blog'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\ttitle: 'Contact',\\n\\t\\t\\thref: '/contact'\\n\\t\\t}\\n\\t];\\n<\/script>\\n\\n<header class=\\"bg-bbuilds-black w-full py-2 relative z-50\\" role=\\"banner\\">\\n\\t<nav id=\\"choose-project-observer-target-top\\" class=\\"mx-auto w-full\\">\\n\\t\\t<div class=\\"flex items-center h-12 px-4 sm:px-8\\">\\n\\t\\t\\t{#if $page.path !== '/'}\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\thref=\\"/\\"\\n\\t\\t\\t\\t\\taria-label=\\"Branden Builds\\"\\n\\t\\t\\t\\t\\ton:click={() => {\\n\\t\\t\\t\\t\\t\\t$mobileMenuState = false;\\n\\t\\t\\t\\t\\t\\tshowHideOverflowY(false);\\n\\t\\t\\t\\t\\t}}\\n\\t\\t\\t\\t\\tclass=\\"flex items-center logo\\"\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<LogoIcon />\\n\\t\\t\\t\\t\\t<LogoName />\\n\\t\\t\\t\\t</a>\\n\\t\\t\\t{/if}\\n\\t\\t\\t<ul\\n\\t\\t\\t\\tclass=\\"nav-items hidden px-2 space-x-6 items-center md:flex md:space-x-12 ml-auto mr-auto\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t{#each navItems as navItem}\\n\\t\\t\\t\\t\\t<li class=\\"menu-item relative group\\"><NavItem {navItem} on:click={() => ($mobileMenuState = !$mobileMenuState)} /></li>\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t</ul>\\n\\t\\t\\t<div class=\\"hidden md:flex\\">\\n\\t\\t\\t\\t<SocialMedia />\\n\\t\\t\\t</div>\\n\\t\\t\\t<MobileMenuToggle />\\n\\t\\t</div>\\n\\t\\t<MobileMenu {navItems} />\\n\\t</nav>\\n</header>\\n\\n<style>:global(.logo .logo-name) {\\n  display: none;\\n  --tw-text-opacity: 1;\\n  color: rgba(230, 231, 232, var(--tw-text-opacity));\\n  height: auto;\\n}\\n:global(.logo .logo-icon) {\\n  height: auto;\\n  max-width: 25px;\\n  min-width: 25px;\\n}\\n:global(.logo .logo-icon-left-bar) {\\n  --tw-text-opacity: 1;\\n  color: rgba(230, 231, 232, var(--tw-text-opacity));\\n}\\n:global(.logo .logo-icon-square) {\\n  --tw-text-opacity: 1;\\n  color: rgba(255, 205, 103, var(--tw-text-opacity));\\n}\\n:global(.logo .logo-icon-box) {\\n  --tw-text-opacity: 1;\\n  color: rgba(1, 253, 246, var(--tw-text-opacity));\\n}\\n.logo {\\n  max-width: 25%;\\n}\\n@media (min-width: 768px) {\\n  :global(.logo .logo-name) {\\n    display: block;\\n    max-width: 25rem;\\n  }\\n  :global(.logo .logo-icon) {\\n    margin-right: 0.5rem;\\n  }\\n  :global(.menu-item:hover .dropdown-menu, .menu-item:focus-within .dropdown-menu) {\\n    visibility: visible;\\n    opacity: 1;\\n  }\\n}\\n@media (min-width: 1024px) {\\n  .logo {\\n    max-width: 15%;\\n  }\\n}</style>\\n"],"names":[],"mappings":"AAkFe,gBAAgB,AAAE,CAAC,AAChC,OAAO,CAAE,IAAI,CACb,iBAAiB,CAAE,CAAC,CACpB,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAAC,CAClD,MAAM,CAAE,IAAI,AACd,CAAC,AACO,gBAAgB,AAAE,CAAC,AACzB,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,IAAI,CACf,SAAS,CAAE,IAAI,AACjB,CAAC,AACO,yBAAyB,AAAE,CAAC,AAClC,iBAAiB,CAAE,CAAC,CACpB,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAAC,AACpD,CAAC,AACO,uBAAuB,AAAE,CAAC,AAChC,iBAAiB,CAAE,CAAC,CACpB,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAAC,AACpD,CAAC,AACO,oBAAoB,AAAE,CAAC,AAC7B,iBAAiB,CAAE,CAAC,CACpB,KAAK,CAAE,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,iBAAiB,CAAC,CAAC,AAClD,CAAC,AACD,KAAK,eAAC,CAAC,AACL,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACjB,gBAAgB,AAAE,CAAC,AACzB,OAAO,CAAE,KAAK,CACd,SAAS,CAAE,KAAK,AAClB,CAAC,AACO,gBAAgB,AAAE,CAAC,AACzB,YAAY,CAAE,MAAM,AACtB,CAAC,AACO,uEAAuE,AAAE,CAAC,AAChF,UAAU,CAAE,OAAO,CACnB,OAAO,CAAE,CAAC,AACZ,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,KAAK,eAAC,CAAC,AACL,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC"}`
};
var Index = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $$unsubscribe_mobileMenuState;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_mobileMenuState = subscribe(mobileMenuState, (value) => value);
  const navItems = [
    {
      title: "Services",
      href: "/services",
      children: [
        {
          title: "Web Development",
          href: "/web-development"
        },
        {
          title: "Headless WordPress Development",
          href: "/headless-wordpress-development"
        },
        {
          title: "WordPress Development",
          href: "/wordpress-development"
        },
        {
          title: "Search Engine Optimization",
          href: "/seo"
        },
        {
          title: "Storytelling / Branding",
          href: "/branding"
        }
      ]
    },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" }
  ];
  $$result.css.add(css$a);
  $$unsubscribe_page();
  $$unsubscribe_mobileMenuState();
  return `<header class="${"bg-bbuilds-black w-full py-2 relative z-50"}" role="${"banner"}"><nav id="${"choose-project-observer-target-top"}" class="${"mx-auto w-full"}"><div class="${"flex items-center h-12 px-4 sm:px-8"}">${$page.path !== "/" ? `<a href="${"/"}" aria-label="${"Branden Builds"}" class="${"flex items-center logo svelte-1lg21q5"}">${validate_component(Icon, "LogoIcon").$$render($$result, {}, {}, {})}
					${validate_component(Name, "LogoName").$$render($$result, {}, {}, {})}</a>` : ``}
			<ul class="${"nav-items hidden px-2 space-x-6 items-center md:flex md:space-x-12 ml-auto mr-auto"}">${each(navItems, (navItem) => `<li class="${"menu-item relative group"}">${validate_component(NavItem, "NavItem").$$render($$result, { navItem }, {}, {})}</li>`)}</ul>
			<div class="${"hidden md:flex"}">${validate_component(SocialMedia, "SocialMedia").$$render($$result, {}, {}, {})}</div>
			${validate_component(Toggle, "MobileMenuToggle").$$render($$result, {}, {}, {})}</div>
		${validate_component(MobileMenu, "MobileMenu").$$render($$result, { navItems }, {}, {})}</nav>
</header>`;
});
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<footer class="${"bg-bbuilds-black w-full pt-4 pb-6"}"><div class="${"container mx-auto px-4"}"><p class="${"text-center text-bbuilds-gray"}">Copyright \xA9 ${escape2(new Date().getFullYear())} Branden Builds LLC. <a href="${"/sitemap.xml"}">Sitemap</a></p></div></footer>`;
});
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Index, "Nav").$$render($$result, {}, {}, {})}
<main class="${"flex-grow"}">${slots.default ? slots.default({}) : ``}</main>
${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var css$9 = {
  code: ".step.svelte-17h80dv{opacity:.05}.active.svelte-17h80dv{animation:svelte-17h80dv-fadeIn linear 2s;opacity:.4}@keyframes svelte-17h80dv-fadeIn{0%{opacity:.05}50%{opacity:1}100%{opacity:.40}}",
  map: `{"version":3,"file":"brandcube.svelte","sources":["brandcube.svelte"],"sourcesContent":["<script>\\n\\timport { onMount } from 'svelte';\\n\\n\\tonMount(() => {\\n\\t\\tconst steps = document.querySelectorAll('.step');\\n\\t\\tlet stepsArray = Array.prototype.slice.call(steps, 0);\\n\\t\\tstepsArray = stepsArray.sort(function (a, b) {\\n\\t\\t\\treturn a.id - b.id;\\n\\t\\t});\\n\\n\\t\\tstepsArray.forEach((step, i) => {\\n\\t\\t\\tsetTimeout(() => {\\n\\t\\t\\t\\tstep.classList.add('active')\\n\\t\\t\\t}, i * 2050);\\n\\t\\t});\\n\\t});\\n<\/script>\\n\\n<svg\\n\\txmlns=\\"http://www.w3.org/2000/svg\\"\\n\\twidth=\\"745.156\\"\\n\\theight=\\"556.508\\"\\n\\tviewBox=\\"0 0 745.156 556.508\\"\\n\\t><g transform=\\"translate(-354.862 -2738.079)\\">\\n\\t\\t<path\\n\\t\\t\\tid=\\"9\\"\\n\\t\\t\\tclass=\\"step square center transition duration-300 ease-in-out\\"\\n\\t\\t\\td=\\"M666.154,2955.047h-94.36v122.572H694.3V2955.047Zm0,94.43H599.937v-66.288h66.217Z\\"\\n\\t\\t\\tfill=\\"#01fdf6\\"\\n\\t\\t/>\\n\\t\\t<path\\n\\t\\t\\tid=\\"3\\"\\n\\t\\t\\tclass=\\"step square top-right transition duration-300 ease-in-out\\"\\n\\t\\t\\td=\\"M883.086,2738.079h-94.36v122.573h122.5V2738.079Zm0,94.43H816.869v-66.287h66.217Z\\"\\n\\t\\t\\tfill=\\"#01fdf6\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"10\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(618.974 2832.474)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"4\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(835.906 2860.652)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/><path\\n\\t\\t\\tid=\\"7\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\td=\\"M816.868,3294.587h94.36V3172.014h-122.5v122.573Zm0-94.431h66.218v66.288H816.868Z\\"\\n\\t\\t\\tfill=\\"#01fdf6\\"\\n\\t\\t/><rect\\n\\t\\t\\tid=\\"6\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(864.048 3172.014) rotate(180)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/><rect\\n\\t\\t\\tid=\\"12\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(618.974 3077.619)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/><rect\\n\\t\\t\\tid=\\"8\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(816.869 3002.262) rotate(90)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/><rect\\n\\t\\t\\tid=\\"18\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(571.794 3002.262) rotate(90)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/><rect\\n\\t\\t\\tid=\\"11\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"66.217\\"\\n\\t\\t\\theight=\\"66.217\\"\\n\\t\\t\\ttransform=\\"translate(666.154 2766.257) rotate(90)\\"\\n\\t\\t\\tfill=\\"#ffcd67\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"5\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"66.217\\"\\n\\t\\t\\theight=\\"66.217\\"\\n\\t\\t\\ttransform=\\"translate(883.086 2983.224) rotate(90)\\"\\n\\t\\t\\tfill=\\"#ffcd67\\"\\n\\t\\t/><rect\\n\\t\\t\\tid=\\"16\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(430.184 3172.014) rotate(180)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"17\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"66.217\\"\\n\\t\\t\\theight=\\"66.217\\"\\n\\t\\t\\ttransform=\\"translate(449.222 2983.224) rotate(90)\\"\\n\\t\\t\\tfill=\\"#ffcd67\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"2\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(1033.801 2785.294) rotate(90)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"1\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out active\\"\\n\\t\\t\\twidth=\\"66.217\\"\\n\\t\\t\\theight=\\"66.217\\"\\n\\t\\t\\ttransform=\\"translate(1100.018 2766.257) rotate(90)\\"\\n\\t\\t\\tfill=\\"#ffcd67\\"\\n\\t\\t/>\\n\\t\\t<path\\n\\t\\t\\tid=\\"15\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\td=\\"M449.222,3172.014h-94.36v122.573h122.5V3172.014Zm0,94.43H383v-66.288h66.218Z\\"\\n\\t\\t\\tfill=\\"#01fdf6\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"14\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"28.142\\"\\n\\t\\t\\theight=\\"122.573\\"\\n\\t\\t\\ttransform=\\"translate(599.936 3219.229) rotate(90)\\"\\n\\t\\t\\tfill=\\"#e6e7e8\\"\\n\\t\\t/>\\n\\t\\t<rect\\n\\t\\t\\tid=\\"13\\"\\n\\t\\t\\tclass=\\"step transition duration-300 ease-in-out\\"\\n\\t\\t\\twidth=\\"66.217\\"\\n\\t\\t\\theight=\\"66.217\\"\\n\\t\\t\\ttransform=\\"translate(666.154 3200.192) rotate(90)\\"\\n\\t\\t\\tfill=\\"#ffcd67\\"\\n\\t\\t/>\\n\\t</g>\\n</svg>\\n\\n<style>.step {\\n  opacity: .05;\\n}\\n.active {\\n  animation: fadeIn linear 2s;\\n  opacity: .4;\\n}\\n@keyframes fadeIn {\\n  0% {\\n    opacity: .05;\\n  }\\n  50% {\\n    opacity: 1;\\n  }\\n  100% {\\n    opacity: .40;\\n  }\\n}</style>\\n"],"names":[],"mappings":"AA4JO,KAAK,eAAC,CAAC,AACZ,OAAO,CAAE,GAAG,AACd,CAAC,AACD,OAAO,eAAC,CAAC,AACP,SAAS,CAAE,qBAAM,CAAC,MAAM,CAAC,EAAE,CAC3B,OAAO,CAAE,EAAE,AACb,CAAC,AACD,WAAW,qBAAO,CAAC,AACjB,EAAE,AAAC,CAAC,AACF,OAAO,CAAE,GAAG,AACd,CAAC,AACD,GAAG,AAAC,CAAC,AACH,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,OAAO,CAAE,GAAG,AACd,CAAC,AACH,CAAC"}`
};
var Brandcube = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$9);
  return `<svg xmlns="${"http://www.w3.org/2000/svg"}" width="${"745.156"}" height="${"556.508"}" viewBox="${"0 0 745.156 556.508"}"><g transform="${"translate(-354.862 -2738.079)"}"><path id="${"9"}" class="${"step square center transition duration-300 ease-in-out svelte-17h80dv"}" d="${"M666.154,2955.047h-94.36v122.572H694.3V2955.047Zm0,94.43H599.937v-66.288h66.217Z"}" fill="${"#01fdf6"}"></path><path id="${"3"}" class="${"step square top-right transition duration-300 ease-in-out svelte-17h80dv"}" d="${"M883.086,2738.079h-94.36v122.573h122.5V2738.079Zm0,94.43H816.869v-66.287h66.217Z"}" fill="${"#01fdf6"}"></path><rect id="${"10"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(618.974 2832.474)"}" fill="${"#e6e7e8"}"></rect><rect id="${"4"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(835.906 2860.652)"}" fill="${"#e6e7e8"}"></rect><path id="${"7"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" d="${"M816.868,3294.587h94.36V3172.014h-122.5v122.573Zm0-94.431h66.218v66.288H816.868Z"}" fill="${"#01fdf6"}"></path><rect id="${"6"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(864.048 3172.014) rotate(180)"}" fill="${"#e6e7e8"}"></rect><rect id="${"12"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(618.974 3077.619)"}" fill="${"#e6e7e8"}"></rect><rect id="${"8"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(816.869 3002.262) rotate(90)"}" fill="${"#e6e7e8"}"></rect><rect id="${"18"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(571.794 3002.262) rotate(90)"}" fill="${"#e6e7e8"}"></rect><rect id="${"11"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"66.217"}" height="${"66.217"}" transform="${"translate(666.154 2766.257) rotate(90)"}" fill="${"#ffcd67"}"></rect><rect id="${"5"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"66.217"}" height="${"66.217"}" transform="${"translate(883.086 2983.224) rotate(90)"}" fill="${"#ffcd67"}"></rect><rect id="${"16"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(430.184 3172.014) rotate(180)"}" fill="${"#e6e7e8"}"></rect><rect id="${"17"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"66.217"}" height="${"66.217"}" transform="${"translate(449.222 2983.224) rotate(90)"}" fill="${"#ffcd67"}"></rect><rect id="${"2"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(1033.801 2785.294) rotate(90)"}" fill="${"#e6e7e8"}"></rect><rect id="${"1"}" class="${"step transition duration-300 ease-in-out active svelte-17h80dv"}" width="${"66.217"}" height="${"66.217"}" transform="${"translate(1100.018 2766.257) rotate(90)"}" fill="${"#ffcd67"}"></rect><path id="${"15"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" d="${"M449.222,3172.014h-94.36v122.573h122.5V3172.014Zm0,94.43H383v-66.288h66.218Z"}" fill="${"#01fdf6"}"></path><rect id="${"14"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"28.142"}" height="${"122.573"}" transform="${"translate(599.936 3219.229) rotate(90)"}" fill="${"#e6e7e8"}"></rect><rect id="${"13"}" class="${"step transition duration-300 ease-in-out svelte-17h80dv"}" width="${"66.217"}" height="${"66.217"}" transform="${"translate(666.154 3200.192) rotate(90)"}" fill="${"#ffcd67"}"></rect></g></svg>`;
});
var css$8 = {
  code: ".hero-brand-cube.svelte-1mdkt8k{max-width:20%}",
  map: `{"version":3,"file":"__error.svelte","sources":["__error.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\texport function load({ error, status }) {\\n\\t\\treturn {\\n\\t\\t\\tprops: { error, status }\\n\\t\\t};\\n\\t}\\n<\/script>\\n\\n<script>\\n\\timport { dev } from '$app/env';\\n\\timport { page } from '$app/stores';\\n\\n\\timport OpenGraph from '$lib/OpenGraph.svelte';\\n\\timport BrandCube from '$lib/svgs/brandcube.svelte';\\n\\n\\texport let status;\\n\\texport let error;\\n\\texport let url = \`https://\${$page.host}\${$page.path}\`;\\n<\/script>\\n\\n<OpenGraph\\n\\ttitle={\`Branden Builds | \${status}\`}\\n\\tkeywords={'branden builds, web developer, frontend developer, backend developer'}\\n\\tdescription=\\"The system is down\\"\\n\\t{url}\\n\\timage={\`images/brandenbuilds-opengraph.jpg\`}\\n/>\\n<article>\\n\\t<section\\n\\t\\tid=\\"404-hero\\"\\n\\t\\tclass=\\"theme-full-height hero bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative\\"\\n\\t>\\n\\t\\t<div class=\\"container mx-auto px-4\\">\\n\\t\\t\\t<h1 class=\\"mb-8\\">Oh no! You've reached a {status}</h1>\\n\\t\\t\\t{#if error && error.message}\\n\\t\\t\\t\\t<p class=\\"md:w-1/2\\">{error.message}</p>\\n\\t\\t\\t{/if}\\n\\t\\t\\t{#if dev && error.stack}\\n\\t\\t\\t\\t<pre>{error.stack}</pre>\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t\\t<div class=\\"hero-brand-cube hidden md:block absolute right-0 bottom-0\\">\\n\\t\\t\\t<BrandCube />\\n\\t\\t</div>\\n\\t</section>\\n</article>\\n\\n<style>.hero-brand-cube {\\n  max-width: 20%;\\n}</style>\\n"],"names":[],"mappings":"AA+CO,gBAAgB,eAAC,CAAC,AACvB,SAAS,CAAE,GAAG,AAChB,CAAC"}`
};
function load$2({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { status } = $$props;
  let { error: error22 } = $$props;
  let { url = `https://${$page.host}${$page.path}` } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  $$result.css.add(css$8);
  $$unsubscribe_page();
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: `Branden Builds | ${status}`,
    keywords: "branden builds, web developer, frontend developer, backend developer",
    description: "The system is down",
    url,
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}
<article><section id="${"404-hero"}" class="${"theme-full-height hero bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4"}"><h1 class="${"mb-8"}">Oh no! You&#39;ve reached a ${escape2(status)}</h1>
			${error22 && error22.message ? `<p class="${"md:w-1/2"}">${escape2(error22.message)}</p>` : ``}
			${``}</div>
		<div class="${"hero-brand-cube hidden md:block absolute right-0 bottom-0 svelte-1mdkt8k"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></section>
</article>`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error,
  load: load$2
});
var css$7 = {
  code: ".hero-logo .logo-icon{min-width:18px;margin-right:0.25rem}.hero-home.svelte-1dudbc4{height:calc(75vh)}.expierence-list-item.svelte-1dudbc4{word-spacing:100vw}@media(min-width: 768px){.hero-logo .logo-icon{max-width:30px}.expierence-list-item.svelte-1dudbc4{word-spacing:normal}}@media(min-width: 1024px){.hero-home.svelte-1dudbc4{height:calc(65vh)}}",
  map: `{"version":3,"file":"Hero.svelte","sources":["Hero.svelte"],"sourcesContent":["<script>\\n\\timport { onMount } from 'svelte';\\n\\timport { fade, fly } from 'svelte/transition';\\n\\timport LogoIcon from '$lib/logo/Icon.svelte';\\n\\timport LogoName from '$lib/logo/Name.svelte';\\n\\n\\tlet activeIndex = 0;\\n\\n\\tonMount(() => {\\n\\t\\tconst interval = setInterval(() => {\\n\\t\\t\\tif (serviceslist[activeIndex + 1]) {\\n\\t\\t\\t\\tactiveIndex += 1;\\n\\t\\t\\t\\treturn;\\n\\t\\t\\t}\\n\\t\\t\\tactiveIndex = 0;\\n\\t\\t}, 2000);\\n\\t\\treturn () => {\\n\\t\\t\\tclearInterval(interval);\\n\\t\\t};\\n\\t});\\n\\n\\texport let title;\\n\\texport let subtitle;\\n\\texport let serviceslist;\\n<\/script>\\n\\n<section id=\\"home-banner\\" class=\\"hero-home bg-bbuilds-gray\\">\\n\\t<div class=\\"flex flex-col justify-center items-center h-full px-4\\">\\n\\t\\t<header class=\\"header-text text-center px-15\\">\\n\\t\\t\\t<h1 class=\\"text-xl\\">{title}</h1>\\n\\t\\t\\t<div class=\\"flex items-center justify-center mb-4 text-bbuilds-black hero-logo max-w-100\\">\\n\\t\\t\\t\\t<LogoIcon />\\n\\t\\t\\t\\t<LogoName />\\n\\t\\t\\t</div>\\n\\t\\t</header>\\n\\t\\t<div class=\\"w-full text-center transform pt-24 lg:pt-16\\">\\n\\t\\t\\t<p class=\\"mb-20 md:mb-10\\">{subtitle}</p>\\n\\t\\t\\t<ul\\n\\t\\t\\t\\tid=\\"expierence-list\\"\\n\\t\\t\\t\\tclass=\\"relative animated-list flex flex-col items-center justify-center w-full\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t{#each serviceslist as service, i}\\n\\t\\t\\t\\t\\t{#if activeIndex === i}\\n\\t\\t\\t\\t\\t\\t<li\\n\\t\\t\\t\\t\\t\\t\\tclass=\\"absolute text-3xl leading-tight expierence-list-item\\"\\n\\t\\t\\t\\t\\t\\t\\tin:fly={{ y: 10, duration: 300, delay: 300 }}\\n\\t\\t\\t\\t\\t\\t\\tout:fade\\n\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t\\t{service}\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t</ul>\\n\\t\\t</div>\\n\\t</div>\\n</section>\\n\\n<style>:global(.hero-logo .logo-icon) {\\n  min-width: 18px;\\n  margin-right: 0.25rem;\\n}\\n.hero-home {\\n  height: calc(75vh);\\n}\\n.expierence-list-item {\\n  word-spacing: 100vw;\\n}\\n@media (min-width: 768px) {\\n  :global(.hero-logo .logo-icon) {\\n    max-width: 30px;\\n  }\\n  .expierence-list-item {\\n    word-spacing: normal;\\n  }\\n}\\n@media (min-width: 1024px) {\\n  .hero-home {\\n    height: calc(65vh);\\n  }\\n}</style>\\n"],"names":[],"mappings":"AAyDe,qBAAqB,AAAE,CAAC,AACrC,SAAS,CAAE,IAAI,CACf,YAAY,CAAE,OAAO,AACvB,CAAC,AACD,UAAU,eAAC,CAAC,AACV,MAAM,CAAE,KAAK,IAAI,CAAC,AACpB,CAAC,AACD,qBAAqB,eAAC,CAAC,AACrB,YAAY,CAAE,KAAK,AACrB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACjB,qBAAqB,AAAE,CAAC,AAC9B,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,qBAAqB,eAAC,CAAC,AACrB,YAAY,CAAE,MAAM,AACtB,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,UAAU,eAAC,CAAC,AACV,MAAM,CAAE,KAAK,IAAI,CAAC,AACpB,CAAC,AACH,CAAC"}`
};
var Hero = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let activeIndex = 0;
  let { title: title2 } = $$props;
  let { subtitle } = $$props;
  let { serviceslist } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title2 !== void 0)
    $$bindings.title(title2);
  if ($$props.subtitle === void 0 && $$bindings.subtitle && subtitle !== void 0)
    $$bindings.subtitle(subtitle);
  if ($$props.serviceslist === void 0 && $$bindings.serviceslist && serviceslist !== void 0)
    $$bindings.serviceslist(serviceslist);
  $$result.css.add(css$7);
  return `<section id="${"home-banner"}" class="${"hero-home bg-bbuilds-gray svelte-1dudbc4"}"><div class="${"flex flex-col justify-center items-center h-full px-4"}"><header class="${"header-text text-center px-15"}"><h1 class="${"text-xl"}">${escape2(title2)}</h1>
			<div class="${"flex items-center justify-center mb-4 text-bbuilds-black hero-logo max-w-100"}">${validate_component(Icon, "LogoIcon").$$render($$result, {}, {}, {})}
				${validate_component(Name, "LogoName").$$render($$result, {}, {}, {})}</div></header>
		<div class="${"w-full text-center transform pt-24 lg:pt-16"}"><p class="${"mb-20 md:mb-10"}">${escape2(subtitle)}</p>
			<ul id="${"expierence-list"}" class="${"relative animated-list flex flex-col items-center justify-center w-full"}">${each(serviceslist, (service, i) => `${activeIndex === i ? `<li class="${"absolute text-3xl leading-tight expierence-list-item svelte-1dudbc4"}">${escape2(service)}
						</li>` : ``}`)}</ul></div></div>
</section>`;
});
var Connector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { classes } = $$props;
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  return `<svg${add_attribute("class", classes, 0)} xmlns="${"http://www.w3.org/2000/svg"}" width="${"122.573"}" height="${"66.217"}" viewBox="${"0 0 122.573 66.217"}"><g id="${"Group_145"}" data-name="${"Group 145"}" transform="${"translate(-1759.012 -2766.257)"}"><rect id="${"Rectangle_224"}" data-name="${"Rectangle 224"}" width="${"122.573"}" height="${"28.142"}" transform="${"translate(1759.012 2785.294)"}" fill="${"#e6e7e8"}"></rect></g><rect id="${"Rectangle_225"}" data-name="${"Rectangle 225"}" width="${"66.217"}" height="${"66.217"}" transform="${"translate(29.2)"}" fill="${"#ffcd67"}"></rect></svg>`;
});
var css$6 = {
  code: ".method-box .svg{max-height:1.5rem;color:var(--bbuilds-gray);transition:0.3s ease-out;min-width:1.2rem}@media(min-width: 768px){.method-box .svg{max-height:2rem}}@media(min-width: 1024px){.method-box .svg{max-height:2.25rem}}.method-box.svelte-b6n89m .icon-box.svelte-b6n89m::before{position:absolute;left:0;bottom:0;content:'';display:block;width:100%;height:100%;background-color:var(--bbuilds-yellow);transform-origin:0 bottom 0;transform:scaleY(0);transition:0.3s ease-out}.method-box.svelte-b6n89m .icon-box.svelte-b6n89m:hover:before,.method-box.svelte-b6n89m .icon-box.active.svelte-b6n89m:before{transform:scaleY(1)}.method-box .icon-box:hover .svg, .active .svg{color:var(--bbuilds-black)}.method-box.svelte-b6n89m .icon-box.svelte-b6n89m:hover,.active.svelte-b6n89m.svelte-b6n89m{color:var(--bbuilds-black)}",
  map: `{"version":3,"file":"Process.svelte","sources":["Process.svelte"],"sourcesContent":["<script>\\n\\timport { onMount } from 'svelte';\\n\\n\\timport ConnecterIcon from '$lib/svgs/connector.svelte';\\n\\n\\texport let title;\\n\\n\\tlet activeIndex = 0;\\n\\n\\tconst processList = [\\n\\t\\t{\\n\\t\\t\\tid: 1,\\n\\t\\t\\ttitle: 'Discovery',\\n\\t\\t\\turl: 'https://google.com/',\\n\\t\\t\\tcopy: 'What are we solving?',\\n\\t\\t\\tsvg:\\n\\t\\t\\t\\t'<svg aria-hidden=\\"true\\" focusable=\\"false\\"  class=\\"lightbulb-icon svg relative\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 352 512\\"><path fill=\\"currentColor\\" d=\\"M176 80c-52.94 0-96 43.06-96 96 0 8.84 7.16 16 16 16s16-7.16 16-16c0-35.3 28.72-64 64-64 8.84 0 16-7.16 16-16s-7.16-16-16-16zM96.06 459.17c0 3.15.93 6.22 2.68 8.84l24.51 36.84c2.97 4.46 7.97 7.14 13.32 7.14h78.85c5.36 0 10.36-2.68 13.32-7.14l24.51-36.84c1.74-2.62 2.67-5.7 2.68-8.84l.05-43.18H96.02l.04 43.18zM176 0C73.72 0 0 82.97 0 176c0 44.37 16.45 84.85 43.56 115.78 16.64 18.99 42.74 58.8 52.42 92.16v.06h48v-.12c-.01-4.77-.72-9.51-2.15-14.07-5.59-17.81-22.82-64.77-62.17-109.67-20.54-23.43-31.52-53.15-31.61-84.14-.2-73.64 59.67-128 127.95-128 70.58 0 128 57.42 128 128 0 30.97-11.24 60.85-31.65 84.14-39.11 44.61-56.42 91.47-62.1 109.46a47.507 47.507 0 0 0-2.22 14.3v.1h48v-.05c9.68-33.37 35.78-73.18 52.42-92.16C335.55 260.85 352 220.37 352 176 352 78.8 273.2 0 176 0z\\"></path></svg>'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\tid: 2,\\n\\t\\t\\ttitle: 'Research',\\n\\t\\t\\turl: 'https://google.com/',\\n\\t\\t\\tcopy: 'Who are we solving this for?',\\n\\t\\t\\tsvg:\\n\\t\\t\\t\\t'<svg aria-hidden=\\"true\\" focusable=\\"false\\" class=\\"searchengin-icon svg relative\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 460 512\\"><path fill=\\"currentColor\\" d=\\"M220.6 130.3l-67.2 28.2V43.2L98.7 233.5l54.7-24.2v130.3l67.2-209.3zm-83.2-96.7l-1.3 4.7-15.2 52.9C80.6 106.7 52 145.8 52 191.5c0 52.3 34.3 95.9 83.4 105.5v53.6C57.5 340.1 0 272.4 0 191.6c0-80.5 59.8-147.2 137.4-158zm311.4 447.2c-11.2 11.2-23.1 12.3-28.6 10.5-5.4-1.8-27.1-19.9-60.4-44.4-33.3-24.6-33.6-35.7-43-56.7-9.4-20.9-30.4-42.6-57.5-52.4l-9.7-14.7c-24.7 16.9-53 26.9-81.3 28.7l2.1-6.6 15.9-49.5c46.5-11.9 80.9-54 80.9-104.2 0-54.5-38.4-102.1-96-107.1V32.3C254.4 37.4 320 106.8 320 191.6c0 33.6-11.2 64.7-29 90.4l14.6 9.6c9.8 27.1 31.5 48 52.4 57.4s32.2 9.7 56.8 43c24.6 33.2 42.7 54.9 44.5 60.3s.7 17.3-10.5 28.5zm-9.9-17.9c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z\\"></path></svg>'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\tid: 3,\\n\\t\\t\\ttitle: 'Create',\\n\\t\\t\\turl: 'https://google.com/',\\n\\t\\t\\tcopy: 'How will we build this solution?',\\n\\t\\t\\tsvg:\\n\\t\\t\\t\\t'<svg aria-hidden=\\"true\\" focusable=\\"false\\" class=\\"svg relative code-icon\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 640 512\\"><path fill=\\"currentColor\\" d=\\"M278.9 511.5l-61-17.7c-6.4-1.8-10-8.5-8.2-14.9L346.2 8.7c1.8-6.4 8.5-10 14.9-8.2l61 17.7c6.4 1.8 10 8.5 8.2 14.9L293.8 503.3c-1.9 6.4-8.5 10.1-14.9 8.2zm-114-112.2l43.5-46.4c4.6-4.9 4.3-12.7-.8-17.2L117 256l90.6-79.7c5.1-4.5 5.5-12.3.8-17.2l-43.5-46.4c-4.5-4.8-12.1-5.1-17-.5L3.8 247.2c-5.1 4.7-5.1 12.8 0 17.5l144.1 135.1c4.9 4.6 12.5 4.4 17-.5zm327.2.6l144.1-135.1c5.1-4.7 5.1-12.8 0-17.5L492.1 112.1c-4.8-4.5-12.4-4.3-17 .5L431.6 159c-4.6 4.9-4.3 12.7.8 17.2L523 256l-90.6 79.7c-5.1 4.5-5.5 12.3-.8 17.2l43.5 46.4c4.5 4.9 12.1 5.1 17 .6z\\"></path></svg>'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\tid: 4,\\n\\t\\t\\ttitle: 'Launch',\\n\\t\\t\\turl: 'https://google.com/',\\n\\t\\t\\tcopy: 'How can the market use our solution?',\\n\\t\\t\\tsvg:\\n\\t\\t\\t\\t'<svg aria-hidden=\\"true\\" focusable=\\"false\\" class=\\"svg relative icon-rocket\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 512 512\\"><path fill=\\"currentColor\\" d=\\"M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z\\"></path></svg>'\\n\\t\\t}\\n\\t];\\n\\n\\tonMount(() => {\\n\\t\\tconst interval = setInterval(() => {\\n\\t\\t\\tif (processList[activeIndex + 1]) {\\n\\t\\t\\t\\tactiveIndex += 1;\\n\\t\\t\\t\\treturn;\\n\\t\\t\\t}\\n\\t\\t\\tactiveIndex = 0;\\n\\t\\t}, 3000);\\n\\t\\treturn () => {\\n\\t\\t\\tclearInterval(interval);\\n\\t\\t};\\n\\t});\\n<\/script>\\n\\n<section id=\\"process\\" class=\\"py-10 lg:py-20 bg-bbuilds-black text-bbuilds-gray\\">\\n\\t<div class=\\"px-4 mx-auto lg:px-0\\">\\n\\t\\t{#if title}\\n\\t\\t\\t<h2 class=\\"text-center mb-10\\">{title}</h2>\\n\\t\\t{/if}\\n\\t\\t<div class=\\"grid grid-cols-2 gap-2 md:gap-6 lg:grid-cols-4 lg:gap-0\\">\\n\\t\\t\\t{#each processList as item, index}<div class=\\"text-center method-box flex items-center\\">\\n\\t\\t\\t\\t\\t<ConnecterIcon classes={\`hidden lg:block\`} />\\n\\t\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\t\\tclass=\\"icon-box relative flex md:flex-col border-2 border-bbuilds-yellow px-4 py-2 justify-center items-center h-full transition duration-300 ease-in-out w-full lg:py-6\\"\\n\\t\\t\\t\\t\\t\\tclass:active={activeIndex === index}\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t{@html item.svg}\\n\\t\\t\\t\\t\\t\\t<h3 class=\\"text-lg relative ml-2 lg:text-xl\\">{item.title}</h3>\\n\\t\\t\\t\\t\\t\\t{#if title}\\n\\t\\t\\t\\t\\t\\t\\t<p class=\\"max-w-xs relative hidden lg:block\\">{item.copy}</p>\\n\\t\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t{#if index + 1 >= processList.length}\\n\\t\\t\\t\\t\\t\\t<ConnecterIcon classes={\`hidden lg:block\`} />\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/each}\\n\\t\\t</div>\\n\\t</div>\\n</section>\\n\\n<style>:global(.method-box .svg) {\\n  max-height: 1.5rem;\\n  color: var(--bbuilds-gray);\\n  transition: 0.3s ease-out;\\n  min-width: 1.2rem;\\n}\\n@media (min-width: 768px) {\\n  :global(.method-box .svg) {\\n    max-height: 2rem;\\n  }\\n}\\n@media (min-width: 1024px) {\\n  :global(.method-box .svg) {\\n    max-height: 2.25rem;\\n  }\\n}\\n.method-box .icon-box::before {\\n  position: absolute;\\n  left: 0;\\n  bottom: 0;\\n  content: '';\\n  display: block;\\n  width: 100%;\\n  height: 100%;\\n  background-color: var(--bbuilds-yellow);\\n  transform-origin: 0 bottom 0;\\n  transform: scaleY(0);\\n  transition: 0.3s ease-out;\\n}\\n.method-box .icon-box:hover:before, .method-box .icon-box.active:before {\\n  transform: scaleY(1);\\n}\\n:global(.method-box .icon-box:hover .svg, .active .svg) {\\n  color: var(--bbuilds-black);\\n}\\n.method-box .icon-box:hover, .active {\\n  color: var(--bbuilds-black);\\n}</style>\\n"],"names":[],"mappings":"AAqFe,gBAAgB,AAAE,CAAC,AAChC,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,cAAc,CAAC,CAC1B,UAAU,CAAE,IAAI,CAAC,QAAQ,CACzB,SAAS,CAAE,MAAM,AACnB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACjB,gBAAgB,AAAE,CAAC,AACzB,UAAU,CAAE,IAAI,AAClB,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAClB,gBAAgB,AAAE,CAAC,AACzB,UAAU,CAAE,OAAO,AACrB,CAAC,AACH,CAAC,AACD,yBAAW,CAAC,uBAAS,QAAQ,AAAC,CAAC,AAC7B,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,gBAAgB,CAAC,CACvC,gBAAgB,CAAE,CAAC,CAAC,MAAM,CAAC,CAAC,CAC5B,SAAS,CAAE,OAAO,CAAC,CAAC,CACpB,UAAU,CAAE,IAAI,CAAC,QAAQ,AAC3B,CAAC,AACD,yBAAW,CAAC,uBAAS,MAAM,OAAO,CAAE,yBAAW,CAAC,SAAS,qBAAO,OAAO,AAAC,CAAC,AACvE,SAAS,CAAE,OAAO,CAAC,CAAC,AACtB,CAAC,AACO,8CAA8C,AAAE,CAAC,AACvD,KAAK,CAAE,IAAI,eAAe,CAAC,AAC7B,CAAC,AACD,yBAAW,CAAC,uBAAS,MAAM,CAAE,OAAO,4BAAC,CAAC,AACpC,KAAK,CAAE,IAAI,eAAe,CAAC,AAC7B,CAAC"}`
};
var Process = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title: title2 } = $$props;
  let activeIndex = 0;
  const processList = [
    {
      id: 1,
      title: "Discovery",
      url: "https://google.com/",
      copy: "What are we solving?",
      svg: '<svg aria-hidden="true" focusable="false"  class="lightbulb-icon svg relative" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M176 80c-52.94 0-96 43.06-96 96 0 8.84 7.16 16 16 16s16-7.16 16-16c0-35.3 28.72-64 64-64 8.84 0 16-7.16 16-16s-7.16-16-16-16zM96.06 459.17c0 3.15.93 6.22 2.68 8.84l24.51 36.84c2.97 4.46 7.97 7.14 13.32 7.14h78.85c5.36 0 10.36-2.68 13.32-7.14l24.51-36.84c1.74-2.62 2.67-5.7 2.68-8.84l.05-43.18H96.02l.04 43.18zM176 0C73.72 0 0 82.97 0 176c0 44.37 16.45 84.85 43.56 115.78 16.64 18.99 42.74 58.8 52.42 92.16v.06h48v-.12c-.01-4.77-.72-9.51-2.15-14.07-5.59-17.81-22.82-64.77-62.17-109.67-20.54-23.43-31.52-53.15-31.61-84.14-.2-73.64 59.67-128 127.95-128 70.58 0 128 57.42 128 128 0 30.97-11.24 60.85-31.65 84.14-39.11 44.61-56.42 91.47-62.1 109.46a47.507 47.507 0 0 0-2.22 14.3v.1h48v-.05c9.68-33.37 35.78-73.18 52.42-92.16C335.55 260.85 352 220.37 352 176 352 78.8 273.2 0 176 0z"></path></svg>'
    },
    {
      id: 2,
      title: "Research",
      url: "https://google.com/",
      copy: "Who are we solving this for?",
      svg: '<svg aria-hidden="true" focusable="false" class="searchengin-icon svg relative" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 512"><path fill="currentColor" d="M220.6 130.3l-67.2 28.2V43.2L98.7 233.5l54.7-24.2v130.3l67.2-209.3zm-83.2-96.7l-1.3 4.7-15.2 52.9C80.6 106.7 52 145.8 52 191.5c0 52.3 34.3 95.9 83.4 105.5v53.6C57.5 340.1 0 272.4 0 191.6c0-80.5 59.8-147.2 137.4-158zm311.4 447.2c-11.2 11.2-23.1 12.3-28.6 10.5-5.4-1.8-27.1-19.9-60.4-44.4-33.3-24.6-33.6-35.7-43-56.7-9.4-20.9-30.4-42.6-57.5-52.4l-9.7-14.7c-24.7 16.9-53 26.9-81.3 28.7l2.1-6.6 15.9-49.5c46.5-11.9 80.9-54 80.9-104.2 0-54.5-38.4-102.1-96-107.1V32.3C254.4 37.4 320 106.8 320 191.6c0 33.6-11.2 64.7-29 90.4l14.6 9.6c9.8 27.1 31.5 48 52.4 57.4s32.2 9.7 56.8 43c24.6 33.2 42.7 54.9 44.5 60.3s.7 17.3-10.5 28.5zm-9.9-17.9c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z"></path></svg>'
    },
    {
      id: 3,
      title: "Create",
      url: "https://google.com/",
      copy: "How will we build this solution?",
      svg: '<svg aria-hidden="true" focusable="false" class="svg relative code-icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M278.9 511.5l-61-17.7c-6.4-1.8-10-8.5-8.2-14.9L346.2 8.7c1.8-6.4 8.5-10 14.9-8.2l61 17.7c6.4 1.8 10 8.5 8.2 14.9L293.8 503.3c-1.9 6.4-8.5 10.1-14.9 8.2zm-114-112.2l43.5-46.4c4.6-4.9 4.3-12.7-.8-17.2L117 256l90.6-79.7c5.1-4.5 5.5-12.3.8-17.2l-43.5-46.4c-4.5-4.8-12.1-5.1-17-.5L3.8 247.2c-5.1 4.7-5.1 12.8 0 17.5l144.1 135.1c4.9 4.6 12.5 4.4 17-.5zm327.2.6l144.1-135.1c5.1-4.7 5.1-12.8 0-17.5L492.1 112.1c-4.8-4.5-12.4-4.3-17 .5L431.6 159c-4.6 4.9-4.3 12.7.8 17.2L523 256l-90.6 79.7c-5.1 4.5-5.5 12.3-.8 17.2l43.5 46.4c4.5 4.9 12.1 5.1 17 .6z"></path></svg>'
    },
    {
      id: 4,
      title: "Launch",
      url: "https://google.com/",
      copy: "How can the market use our solution?",
      svg: '<svg aria-hidden="true" focusable="false" class="svg relative icon-rocket" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z"></path></svg>'
    }
  ];
  if ($$props.title === void 0 && $$bindings.title && title2 !== void 0)
    $$bindings.title(title2);
  $$result.css.add(css$6);
  return `<section id="${"process"}" class="${"py-10 lg:py-20 bg-bbuilds-black text-bbuilds-gray"}"><div class="${"px-4 mx-auto lg:px-0"}">${title2 ? `<h2 class="${"text-center mb-10"}">${escape2(title2)}</h2>` : ``}
		<div class="${"grid grid-cols-2 gap-2 md:gap-6 lg:grid-cols-4 lg:gap-0"}">${each(processList, (item, index2) => `<div class="${"text-center method-box flex items-center svelte-b6n89m"}">${validate_component(Connector, "ConnecterIcon").$$render($$result, { classes: `hidden lg:block` }, {}, {})}
					<div class="${[
    "icon-box relative flex md:flex-col border-2 border-bbuilds-yellow px-4 py-2 justify-center items-center h-full transition duration-300 ease-in-out w-full lg:py-6 svelte-b6n89m",
    activeIndex === index2 ? "active" : ""
  ].join(" ").trim()}"><!-- HTML_TAG_START -->${item.svg}<!-- HTML_TAG_END -->
						<h3 class="${"text-lg relative ml-2 lg:text-xl"}">${escape2(item.title)}</h3>
						${title2 ? `<p class="${"max-w-xs relative hidden lg:block"}">${escape2(item.copy)}</p>` : ``}</div>
					${index2 + 1 >= processList.length ? `${validate_component(Connector, "ConnecterIcon").$$render($$result, { classes: `hidden lg:block` }, {}, {})}` : ``}
				</div>`)}</div></div>
</section>`;
});
var Services$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { servicesTitle } = $$props;
  let { services: services2 } = $$props;
  let { skillsTitle } = $$props;
  let { skillsCopy } = $$props;
  let { skills } = $$props;
  if ($$props.servicesTitle === void 0 && $$bindings.servicesTitle && servicesTitle !== void 0)
    $$bindings.servicesTitle(servicesTitle);
  if ($$props.services === void 0 && $$bindings.services && services2 !== void 0)
    $$bindings.services(services2);
  if ($$props.skillsTitle === void 0 && $$bindings.skillsTitle && skillsTitle !== void 0)
    $$bindings.skillsTitle(skillsTitle);
  if ($$props.skillsCopy === void 0 && $$bindings.skillsCopy && skillsCopy !== void 0)
    $$bindings.skillsCopy(skillsCopy);
  if ($$props.skills === void 0 && $$bindings.skills && skills !== void 0)
    $$bindings.skills(skills);
  return `<section id="${"services"}" class="${"py-10 lg:py-20 bg-bbuilds-yellow text-bbuilds-black"}"><div class="${"container mx-auto px-4"}"><h2 class="${"text-center mb-10"}">${escape2(servicesTitle)}</h2>
		<ul class="${"grid gap-4 md:grid-cols-2 lg:grid-cols-3"}">${each(services2, (service) => `<li class="${"flex items-center"}"><a${add_attribute("href", service.url, 0)} class="${"p-4 border border-bbuilds-black rounded w-full h-full transition duration-300 ease-in-out transform hover:-translate-y-2 hover:bg-bbuilds-black hover:text-bbuilds-yellow"}"><h6 class="${"text-xs font-semibold leading-none"}">${escape2(service.title)}</h6>
						<p class="${"mt-2 leading-none"}">${escape2(service.copy)}
						</p></a>
				</li>`)}</ul>
		<div class="${"skillset hidden md:block pt-10"}"><h3 class="${"text-center mb-4"}">${escape2(skillsTitle)}</h3>
			<p class="${"text-center max-w-4xl mx-auto mb-6"}">${escape2(skillsCopy)}</p>
			<ul class="${"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"}">${each(skills, (skill, index2) => `<li class="${"flex items-center bg-bbuilds-gray text-center shadow-sm"}"><img${add_attribute("src", skill.logo, 0)}${add_attribute("alt", `${skill.title} Logo`, 0)} width="${"40"}" height="${"40"}" class="${"p-1.5 bg-white h-12 w-12"}">
						<span class="${"ml-auto mr-auto"}">${escape2(skill.title)}</span>
					</li>`)}</ul></div></div>
	</section>`;
});
var Link = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg aria-hidden="${"true"}" focusable="${"false"}" class="${"svg link duration-200"}" role="${"img"}" xmlns="${"http://www.w3.org/2000/svg"}" viewBox="${"0 0 512 512"}"><path fill="${"currentColor"}" d="${"M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"}"></path></svg>`;
});
var css$5 = {
  code: ".svg.link{opacity:0}.post-preview-link.svelte-11qqhz8:hover .svg.link{opacity:1}.post-preview-link.svelte-11qqhz8:hover img.svelte-11qqhz8{opacity:0.25}",
  map: '{"version":3,"file":"PostPreview.svelte","sources":["PostPreview.svelte"],"sourcesContent":["<script>\\n\\timport BlogHeader from \'$lib/BlogHeader.svelte\';\\n\\timport LinkSVG from \'$lib/svgs/link.svelte\';\\n\\texport let post;\\n<\/script>\\n\\n<article>\\n\\t<a href={`/blog/${post.slug}`} class=\\"post-preview-link\\">\\n\\t\\t<div\\n\\t\\t\\tclass=\\"bg-bbuilds-black m-auto overflow-hidden rounded-xl h-48 relative w-full flex items-center justify-center text-bbuilds-gray\\"\\n\\t\\t>\\n\\t\\t\\t<img\\n\\t\\t\\t\\tclass=\\"object-cover absolute duration-200\\"\\n\\t\\t\\t\\tsrc={`/images/blog/${post.slug}/${post.image}`}\\n\\t\\t\\t\\talt={post.title}\\n\\t\\t\\t/>\\n\\t\\t\\t<LinkSVG />\\n\\t\\t</div>\\n\\t</a>\\n\\t<BlogHeader rawDate={post.date} title={post.title} tags={post.tags} postPreview={true} />\\n\\t<p>{post.excerpt}</p>\\n\\t<a class=\\"flex items-center underline\\" href={`/blog/${post.slug}`}>Read Post</a>\\n</article>\\n\\n<style>:global(.svg.link) {\\n  opacity: 0;\\n}\\n.post-preview-link:hover :global(.svg.link) {\\n  opacity: 1;\\n}\\n.post-preview-link:hover img {\\n  opacity: 0.25;\\n}</style>\\n"],"names":[],"mappings":"AAwBe,SAAS,AAAE,CAAC,AACzB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,iCAAkB,MAAM,CAAC,AAAQ,SAAS,AAAE,CAAC,AAC3C,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,iCAAkB,MAAM,CAAC,GAAG,eAAC,CAAC,AAC5B,OAAO,CAAE,IAAI,AACf,CAAC"}'
};
var PostPreview = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { post } = $$props;
  if ($$props.post === void 0 && $$bindings.post && post !== void 0)
    $$bindings.post(post);
  $$result.css.add(css$5);
  return `<article><a${add_attribute("href", `/blog/${post.slug}`, 0)} class="${"post-preview-link svelte-11qqhz8"}"><div class="${"bg-bbuilds-black m-auto overflow-hidden rounded-xl h-48 relative w-full flex items-center justify-center text-bbuilds-gray"}"><img class="${"object-cover absolute duration-200 svelte-11qqhz8"}"${add_attribute("src", `/images/blog/${post.slug}/${post.image}`, 0)}${add_attribute("alt", post.title, 0)}>
			${validate_component(Link, "LinkSVG").$$render($$result, {}, {}, {})}</div></a>
	${validate_component(BlogHeader, "BlogHeader").$$render($$result, {
    rawDate: post.date,
    title: post.title,
    tags: post.tags,
    postPreview: true
  }, {}, {})}
	<p>${escape2(post.excerpt)}</p>
	<a class="${"flex items-center underline"}"${add_attribute("href", `/blog/${post.slug}`, 0)}>Read Post</a>
</article>`;
});
var css$4 = {
  code: ".svg.link{position:absolute;width:5rem;height:5rem}",
  map: `{"version":3,"file":"RecentPosts.svelte","sources":["RecentPosts.svelte"],"sourcesContent":["<script>\\n\\timport { session } from '$app/stores';\\n    import PostPreview from \\"$lib/PostPreview.svelte\\";\\n\\n    const posts = $session.posts\\n<\/script>\\n\\n<section id=\\"recent-posts\\" class=\\"bg-bbuilds-gray py-10 lg:py-20\\">\\n    <div class=\\"container mx-auto px-4\\">\\n        <h2 class=\\" mt-6 mb-16 text-center text-h2\\">Blog</h2>\\n        <div class=\\"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10\\">\\n            {#each posts.slice(0, 3) as post, index}\\n                <div class=\\"posts-grid__item\\">\\n                    <PostPreview {post} />\\n                </div>\\n            {/each}\\n        </div>\\n        <div class=\\"text-center pt-10\\">\\n            <a href=\\"/blog\\" class=\\"button\\">View Blog</a>\\n        </div>\\n    </div>\\n</section>\\n\\n<style>:global(.svg.link) {\\n  position: absolute;\\n  width: 5rem;\\n  height: 5rem;\\n}</style>"],"names":[],"mappings":"AAuBe,SAAS,AAAE,CAAC,AACzB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC"}`
};
var RecentPosts = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  const posts = $session.posts;
  $$result.css.add(css$4);
  $$unsubscribe_session();
  return `<section id="${"recent-posts"}" class="${"bg-bbuilds-gray py-10 lg:py-20"}"><div class="${"container mx-auto px-4"}"><h2 class="${" mt-6 mb-16 text-center text-h2"}">Blog</h2>
        <div class="${"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"}">${each(posts.slice(0, 3), (post, index2) => `<div class="${"posts-grid__item"}">${validate_component(PostPreview, "PostPreview").$$render($$result, { post }, {}, {})}
                </div>`)}</div>
        <div class="${"text-center pt-10"}"><a href="${"/blog"}" class="${"button"}">View Blog</a></div></div>
</section>`;
});
var Recommendations = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<section id="${"street-cred"}" class="${"bg-bbuilds-yellow py-10 lg:py-20"}"><div class="${"container mx-auto px-4 text-center"}"><h2 class="${"sr-only"}">Branden Builds Reccomendation</h2>
        <figure><blockquote cite="${"https://www.linkedin.com/in/branden-builds/"}"><p class="${"text-lg"}"><em>Branden is an incredibly talented full-stack developer who always approaches tasks with a calm and collected mindset, regardless a problem&#39;s size or complexity. His creative thinking and extensive knowledge has inspired me to learn front-end development myself. As a developer, he is well equipped to handle pressure and take on demanding projects, while never ceasing to better his own methodology. As a mentor, his passion for coding and patience to clearly explain processes make him an invaluable asset to any company.</em></p></blockquote>
            <figcaption class="${"mt-4"}">\u2014 <cite><a href="${"https://www.linkedin.com/in/branden-builds/"}" class="${"underline"}" title="${"Aisha's Reccomendation"}" target="${"_blank"}" rel="${"nofollow"}">Aisha Frances Natividad</a></cite></figcaption></figure></div></section>`;
});
async function load$1({ fetch: fetch2 }) {
  const [resServices, resSkills] = await Promise.all([fetch2("/api/services"), fetch2("/api/skillset")]);
  const servicesData = await resServices.json();
  const skillsData = await resSkills.json();
  if (resServices.ok && resSkills.ok) {
    return { props: { servicesData, skillsData } };
  }
  return { error: new Error() };
}
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { servicesData } = $$props;
  let { skillsData } = $$props;
  if ($$props.servicesData === void 0 && $$bindings.servicesData && servicesData !== void 0)
    $$bindings.servicesData(servicesData);
  if ($$props.skillsData === void 0 && $$bindings.skillsData && skillsData !== void 0)
    $$bindings.skillsData(skillsData);
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Branden Builds Web Developer && Storyteller",
    keywords: "freelance web developer, frontend developer, backend developer, headless CMS, headless wordpress",
    description: "Branden Builds specializes in building custom web development, headless wordpress solutions, and telling bad ass stories.",
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<article>${validate_component(Hero, "Hero").$$render($$result, {
    title: `Greetings I'm`,
    subtitle: `I enjoy building...`,
    serviceslist: [
      "Engaging Experiences \u{1F981}",
      "Lean Products \u26A1",
      "Accelerated Brands \u{1F331}",
      "Technical SEO \u{1F913}"
    ]
  }, {}, {})}

	${validate_component(Services$1, "Services").$$render($$result, {
    servicesTitle: servicesData.title,
    services: servicesData.services,
    skillsTitle: skillsData.title,
    skillsCopy: skillsData.copy,
    skills: skillsData.skills
  }, {}, {})}

	${validate_component(Process, "Process").$$render($$result, { title: "Methods && Madness" }, {}, {})}

	${validate_component(Recommendations, "Reccomendation").$$render($$result, {}, {}, {})}

	${validate_component(RecentPosts, "RecentPosts").$$render($$result, {}, {}, {})}</article>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  load: load$1
});
var css$3 = {
  code: "blockquote.svelte-3oyus9{font-size:1.25em;margin:1em 0;padding-left:1em;border-left:3px solid rgb(55, 53, 47)}",
  map: '{"version":3,"file":"Blockquote.svelte","sources":["Blockquote.svelte"],"sourcesContent":["<script>\\n    export let citation;\\n<\/script>\\n\\n<blockquote>\\n    <slot/>\\n    <cite class=\\"text-small block\\">{citation}</cite>\\n</blockquote>\\n\\n<style>blockquote {\\n  font-size: 1.25em;\\n  margin: 1em 0;\\n  padding-left: 1em;\\n  border-left: 3px solid rgb(55, 53, 47);\\n}</style>"],"names":[],"mappings":"AASO,UAAU,cAAC,CAAC,AACjB,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,GAAG,CAAC,CAAC,CACb,YAAY,CAAE,GAAG,CACjB,WAAW,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,AACxC,CAAC"}'
};
var Blockquote = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { citation } = $$props;
  if ($$props.citation === void 0 && $$bindings.citation && citation !== void 0)
    $$bindings.citation(citation);
  $$result.css.add(css$3);
  return `<blockquote class="${"svelte-3oyus9"}">${slots.default ? slots.default({}) : ``}
    <cite class="${"text-small block"}">${escape2(citation)}</cite>
</blockquote>`;
});
var Headless_wordpress_development = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "HeadLess WordPress Development | Branden Builds",
    keywords: "branden builds, web developer, wordpress, headless wordpress",
    description: "Custom built headless wordpress developement by Branden Builds",
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<article><header id="${"services-hero"}" class="${"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4 pb-20 relative z-10"}"><h1 class="${"text-xl md:text-3xl lg:max-w-2/3 mb-8"}">Custom Headless WordPress Development</h1>
			<p class="${"md:w-1/2"}">When you merge modern frontend development with the world&#39;s most popular CMS, WordPress.
			</p>
			<a href="${"/contact"}" class="${"button mt-8 inline-block"}">Talk nerdy to me</a></div>
		<div class="${"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></header>
	<section class="${"pt-10 pb-20 post-content"}"><div class="${"px-4 max-w-3xl mx-auto"}"><h2>Defining a Headless CMS</h2>
			<p>This seems to be a popular buzz phrase in recent years but for a great meaning, a headless
				content management system or headless CMS is a way to let the a CMS handle only the data and
				a modern JS framework, like react, Vue, Svelte, etc handle how to display the data. <a href="${"/blog/byoungz-headlesswp-gatsby"}">Headless Wordpress</a> is using WordPress to manage the content as the backend.
			</p>
			<h3>Defining JAMstack and Static Site Generation</h3>

			${validate_component(Blockquote, "Blockquote").$$render($$result, {
    citation: "Mathias Biilmann (CEO & Co-founder of Netlify)."
  }, {}, {
    default: () => `A modern web development architecture based on client-side JavaScript, reusable APIs,
                and prebuilt Markup`
  })}

			<p>Jamstack approach uses JavaScript to connect to third party backends, such as headless
				WordPress to create static generated sites, called pre-rendering or compiling, the data into
				basic HTML, JS, and CSS files.
			</p>
			<h3>Why a Headless WordPress Approach?</h3>
			<p>WordPress already claims <a href="${"https://wordpress.com/"}" target="${"_blank"}" rel="${"noopener noreferrer nofollow"}">over 40%</a> of the web is built on its platform. So it&#39;s familiarity as managing content is widely
				popular. However, WordPress can be infamous for being bloated and insecure. When we remove the
				&quot;head&quot; and only use WordPres to manage data, we can create a blazingly fast and secure
				website that will leave your competitors in your wake.
			</p>
			<p>Some benefits of headless CMS development in general</p>
			<ul class="${"bulleted-list"}"><li>Easy to integrate multiple data sources into one frontend framework like using WordPress
					for basic data and shopify for ecommerce.
				</li>
				<li>Removing a lot of security concerns through database exploits. Can&#39;t exploit a
					database if there isn&#39;t one connected to the frontend.
				</li>
				<li>Blazingly fast static generated site that leveraging modern techniques like code
					splitting, mage optimization, inline critical styles, and much more to give you off the
					charts performance scores.
				</li></ul>
			<h3>Headlesss WordPress JavaScript Frameworks</h3>
			<p>I have an experience in a variety of JavaScript frameworks. I have used several JS
				frameworks to build headless CMS and specifically headless Wordpress solutions such as:
			</p>
			<ul><li>Gatsby JS</li>
				<li>Frontity</li>
				<li>Next.JS</li>
				<li>Eleventy</li>
				<li>Wp Engines Atlas</li></ul></div></section></article>`;
});
var headlessWordpressDevelopment = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Headless_wordpress_development
});
var Wordpress_development = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Traditional WordPress Development Services | Branden Builds",
    keywords: "wordpress, php, plugin development, theme development",
    description: "WordPress Development Services by Branden Builds",
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<article><header id="${"hero"}" class="${"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4 pb-20 relative z-10"}"><h1 class="${"text-xl md:text-3xl lg:max-w-2/3 mb-8"}">Traditional WordPress Development</h1>
			<p class="${"md:w-1/2"}">Using WordPress as a traditional monolithic CMS? I come correct in every aspect of real
				WordPress development.
			</p>
			<a href="${"/contact"}" class="${"button mt-8 inline-block"}">Talk nerdy to me</a></div>
		<div class="${"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></header>
	<section class="${"pt-10 pb-20 post-content"}"><div class="${"px-4 max-w-3xl mx-auto"}"><p>WordPress has been around for a long time and dominates the web as <a href="${"https://wordpress.com/"}" target="${"_blank"}" rel="${"noopener noreferrer nofollow"}">42% of the web is powered by WordPress.</a> It&#39;s a highly flexible and customizable CMS that I have tinkered with every aspect of the WordPress
				ecosystem.
			</p>
			<h2>An Actual WordPress Developer</h2>
			<p>WordPress can get a bad reputation from being bloated and having a lot of people
				&quot;claim&quot; to be developers and then build a half-assed website using a site builder.
				It can be really difficult to sift through the thousands of marketing or &quot;web
				development&quot; agencies to see who is legit.
			</p>
			<p>When I builds WordPress solutions or join a team, I am looking to build from the ground up
				and use as minimal plugins as possible. I take pride in the speed and code quality of every
				WordPress website project I&#39;m in.
			</p>
			<p>Some WordPress Development Services I offer:
			</p>
			<ul><li>custom plugin development</li>						
				<li>custom built from the ground up theme development</li>						
				<li>migrations to or from WordPress</li>						
				<li>building Block Editor (Gutenberg) blocks</li>						
				<li>optimization / website Audit.</li>			
				<li>agency training</li>
				<li><a href="${"/headless-wordpress-development"}">headless WordPress development</a></li></ul></div></section></article>`;
});
var wordpressDevelopment = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Wordpress_development
});
var load = async ({ fetch: fetch2 }) => {
  const res = await fetch2("/api/skillset");
  const skillsData = await res.json();
  return { props: { skillsData } };
};
var Web_development = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { skillsData } = $$props;
  const skills = skillsData.skills;
  const backendSkills = skills.filter((skill) => {
    return skill.type === "backend";
  });
  const frontendSkills = skills.filter((skill) => {
    return skill.type === "frontend";
  });
  if ($$props.skillsData === void 0 && $$bindings.skillsData && skillsData !== void 0)
    $$bindings.skillsData(skillsData);
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Website and Web App Development Services | Branden Builds",
    keywords: "web development, frontend development, backend development",
    description: "Website and Web App Development by Branden Builds",
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<article><header id="${"hero"}" class="${"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4 pb-20 relative z-10"}"><h1 class="${"text-xl md:text-3xl lg:max-w-2/3 mb-8"}">Website and Web App Development</h1>
			<p class="${"md:w-1/2"}">I like creating sexy user interfaces &amp;&amp; lean and scalable backend systems.
			</p>
			<a href="${"/contact"}" class="${"button mt-8 inline-block"}">Talk nerdy to me</a></div>
		<div class="${"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></header>
	<section class="${"pt-10 pb-20 post-content"}"><div class="${"px-4 max-w-3xl mx-auto"}"><p>There is no one size fits all or cooking cutter process when it comes to creating digital
				experiences on the web. I am able to build custom websites and apps from the group up or
				jump in any part of the process to aide a currently development team. Transform ideas and
				inspirations into engaging digital experiences.
			</p>
			<p>I use a tried true process to build web solutions from the ground up.
			</p>
			<ol><li>Discovery - What are the business goals and problem we would like to solve?</li>						
				<li>Research - Who are we solving this for?</li>						
				<li>Create - How will we build this solution?</li>						
				<li>QA - Test Our Solution</li>
				<li>Launch - Time to market our solution?</li></ol>
			<p>Repeat steps 2, 3, and 4 are necessary. This is not a waterfall approach process.
			</p>
			<h2>Frontend Development</h2>
			<p>First impressions are vital to your reputation and business. I enjoy creating frontend web
				development solutions using latest JS frameworks like Vue, React, and Svelte, specially
				consuming decoupled backend CMS solutions. I can take designs and craft them into sexy user
				interfaces that are remarkably fast. I enjoy using animation as tool for intuitive client
				interactions.
			</p>
            <ul class="${"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6"}" style="${"padding-left:0;"}">${each(frontendSkills, (skill) => `<li class="${"flex items-center bg-bbuilds-gray text-center shadow-sm"}"><img${add_attribute("src", skill.logo, 0)}${add_attribute("alt", `${skill.title} Logo`, 0)} width="${"40"}" height="${"40"}" class="${"p-1.5 bg-white h-12 w-12"}">
						<span class="${"ml-auto mr-auto"}">${escape2(skill.title)}</span>
					</li>`)}</ul>
			<h2>Backend Development</h2>
			<p>Need a scalable and secure API built? I enjoy using the backend languages PHP and Node.js
				mostly
			</p>
            <ul class="${"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6"}" style="${"padding-left:0;"}">${each(backendSkills, (skill) => `<li class="${"flex items-center bg-bbuilds-gray text-center shadow-sm"}"><img${add_attribute("src", skill.logo, 0)}${add_attribute("alt", `${skill.title} Logo`, 0)} width="${"40"}" height="${"40"}" class="${"p-1.5 bg-white h-12 w-12"}">
						<span class="${"ml-auto mr-auto"}">${escape2(skill.title)}</span>
					</li>`)}</ul></div></section></article>`;
});
var webDevelopment = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Web_development,
  load
});
var Branding = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Branding and Story Telling Services | Branden Builds",
    keywords: "branding, market strategy, story telling",
    description: "Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence.",
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<article><header id="${"hero"}" class="${"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4 pb-20 relative z-10"}"><h1 class="${"text-xl md:text-3xl lg:max-w-2/3 mb-8"}">Brand Development and Story Telling</h1>
			<p class="${"md:w-1/2"}">Telling a story requires an insightful, handcrafted presence propelled by emotional
				intelligence.
			</p>
			<a href="${"/contact"}" class="${"button mt-8 inline-block"}">Talk nerdy to me</a></div>
		<div class="${"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></header>
	<section class="${"pt-10 pb-20 post-content"}"><div class="${"px-4 max-w-3xl mx-auto"}"><p>Designing the story is a craft that connects the company&#39;s values, mission, and vision with
				their target audience. A brand is composed of two parts; Brand Image, (the skeleton and DNA
				of an idea) and Brand Identity (the physical appearance of an idea.)
			</p>
			<h2>Branding Goals</h2>
			<p>A successful brand needs to meet these seven goals:</p>
			<ol><li>Emotions \u2013 What types of emotions do we want to establish with your clients?</li>
				<li>Desires \u2013\xA0What desires will your firm satisfy for your clients?</li>
				<li>Differentiation \u2013 How can you stand out from other law firms?</li>
				<li>Trust \u2013 How can you establish trust in your law\xA0firm?</li>
				<li>Value \u2013 What are the core values of your firm? Do your clients share the same values?
				</li>
				<li>Connection \u2013 Law firms will want to connect with the outside world. How can your law firm
					share your clients\u2019 emotions with the outside world?
				</li>
				<li>Belongingness \u2013 How can you connect and reflect your clients within your brand? You want
					your clients and community to feel like they are a part of your brand.
				</li></ol>
			<p>Below the my process I&#39;m constantly refining to meet the goals above.</p>
			<h2>Branding Process</h2>
			<ol><li>Discovery</li>
				<li>Research 
                    <ul><li>Market Research</li>
						<li>Company Research</li></ul></li>
				<li>Brand Image / Strategy
                    <ul><li>Unique Selling Proposition</li>
                        <li>Mission Statement</li>
                        <li>Vision Statement</li>
                        <li>Values</li>
                        <li>Jungian Archetype / Positioning </li></ul></li>
				<li>Brand Identity
                    <ul><li>Logo</li>
                        <li>Typography</li>
                        <li>Color Scheme</li>
                        <li>Complete Style Guide</li></ul></li>
				<li>Story Telling</li></ol></div></section></article>`;
});
var branding = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Branding
});
var css$2 = {
  code: ".service.svelte-d20ok2:hover{transform:scale(1.05)}",
  map: `{"version":3,"file":"services.svelte","sources":["services.svelte"],"sourcesContent":["<script>\\n\\timport Process from '$lib/Process.svelte';\\n\\timport BrandCube from '$lib/svgs/brandcube.svelte';\\n\\timport OpenGraph from '$lib/OpenGraph.svelte';\\n\\t\\n\\tconst services = [\\n\\t\\t{\\n\\t\\t\\ttitle: 'Web Development',\\n\\t\\t\\ttagline:\\n\\t\\t\\t\\t'Creating intuitive sexy client facing front ends while writing lean and clean structured backends.',\\n\\t\\t\\tspecialities: [\\n\\t\\t\\t\\t'JavaScript Framework Development',\\n\\t\\t\\t\\t'back-end development',\\n\\t\\t\\t\\t'eCommerce',\\n\\t\\t\\t\\t'API integrations',\\n\\t\\t\\t\\t'content management system solutions'\\n\\t\\t\\t],\\n\\t\\t\\timage: '/images/web-development-illustration.svg',\\n\\t\\t\\turl: '/web-development'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\ttitle: 'WordPress Solutions',\\n\\t\\t\\ttagline:\\n\\t\\t\\t\\t'WordPress dominates the web world and I come correct to tackle every aspect of the development ecosystem.',\\n\\t\\t\\tspecialities: [\\n\\t\\t\\t\\t'Headlesss Wordpress / Jamstack Builds',\\n\\t\\t\\t\\t'Block Editor Development',\\n\\t\\t\\t\\t'traditional theme development',\\n\\t\\t\\t\\t'agency development training',\\n\\t\\t\\t],\\n\\t\\t\\timage: '/images/wordpress-development-illustration.svg',\\n\\t\\t\\turl: '/wordpress-development'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\ttitle: 'Branding',\\n\\t\\t\\ttagline:\\n\\t\\t\\t\\t'Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence.',\\n\\t\\t\\tspecialities: [\\n\\t\\t\\t\\t'market research',\\n\\t\\t\\t\\t'brand strategy / positioning',\\n\\t\\t\\t\\t'brand identity',\\n\\t\\t\\t\\t'storytelling',\\n\\t\\t\\t],\\n\\t\\t\\timage: '/images/branding-service-illustration.svg',\\n\\t\\t\\turl: '/branding'\\n\\t\\t},\\n\\t\\t{\\n\\t\\t\\ttitle: 'Search Engine Optimization',\\n\\t\\t\\ttagline:\\n\\t\\t\\t\\t'Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence.',\\n\\t\\t\\tspecialities: [\\n\\t\\t\\t\\t'local ranking',\\n\\t\\t\\t\\t'on site optimization',\\n\\t\\t\\t\\t'technical seo analysis',\\n\\t\\t\\t\\t'complete SEO audit',\\n\\t\\t\\t],\\n\\t\\t\\timage: '/images/seo-service-illustration.svg',\\n\\t\\t\\turl: '/seo'\\n\\t\\t}\\n\\t];\\n<\/script>\\n<OpenGraph\\n\\ttitle={'Web Developemnt, SEO, and Branding Services from Branden Builds'}\\n\\tkeywords={'web dev, frontend development, backend development'}\\n\\tdescription=\\"Top notch web development, digital marketing, and branding services from Branden Builds.\\"\\n\\timage={\`images/brandenbuilds-opengraph.jpg\`}\\n/>\\n<section\\n\\tid=\\"services-hero\\"\\n\\tclass=\\"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative\\"\\n>\\n\\t<div class=\\"container mx-auto px-4 pb-20 relative z-10\\">\\n\\t\\t<h1 class=\\"text-xl md:text-3xl lg:max-w-2/3 mb-8\\">\\n\\t\\t\\tBranden Builds Web Development | Branding | SEO Freelance Services\\n\\t\\t</h1>\\n\\t\\t<blockquote class=\\"text-lg md:text-xl md:mb-6 lg:max-w-2/3 leading-snug\\">\\n\\t\\t\\t\\"modern problems require modern solutions\\" <cite class=\\"block text-md\\">-Dave Chappelle</cite>\\n\\t\\t</blockquote>\\n\\t\\t<a href=\\"/contact\\" class=\\"button mt-8 inline-block\\">Talk nerdy to me</a>\\n\\t</div>\\n\\t<div class=\\"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4\\">\\n\\t\\t<BrandCube />\\n\\t</div>\\n</section>\\n<section id=\\"services-list\\" class=\\"bg-bbuilds-yellow py-10 lg:py-20\\">\\n\\t<div class=\\"mx-auto max-w-3xl px-4\\">\\n\\t\\t<ul>\\n\\t\\t\\t{#each services as service, index}\\n\\t\\t\\t\\t<li\\n\\t\\t\\t\\t\\tclass=\\"mb-10\\"\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t<a href={service.url} sveltekit:prefetch class=\\"service block md:flex items-center p-4 border border-bbuilds-black rounded w-full h-full transition duration-300 ease-in-out\\">\\n\\t\\t\\t\\t\\t<picture class=\\"md:p-8\\">\\n\\t\\t\\t\\t\\t\\t<img src={service.image} alt={\`\${service.title} Illustration\`} class=\\"w-1/4 md:w-100\\" />\\n\\t\\t\\t\\t\\t</picture>\\n\\t\\t\\t\\t\\t<div class=\\"py-8\\">\\n\\t\\t\\t\\t\\t\\t\\n\\t\\t\\t\\t\\t\\t<h6 class=\\"text-xl font-semibold leading-none mb-4\\">\\n\\t\\t\\t\\t\\t\\t\\t{service.title}\\n\\t\\t\\t\\t\\t\\t</h6>\\n\\t\\t\\t\\t\\t\\t<p class=\\"mt-2\\">\\n\\t\\t\\t\\t\\t\\t\\t{service.tagline}\\n\\t\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t\\t\\t{#if service.specialities}\\n\\t\\t\\t\\t\\t\\t\\t<ul class=\\"mt-4 disc\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t{#each service.specialities as item}\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<li>{item}</li>\\n\\t\\t\\t\\t\\t\\t\\t\\t{/each}\\n\\t\\t\\t\\t\\t\\t\\t</ul>\\n\\t\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t</li>\\n\\t\\t\\t{/each}\\n\\t\\t</ul>\\n\\t</div>\\n</section>\\n<Process title={false} />\\n\\n<style>.service:hover {\\n  transform: scale(1.05);\\n}</style>\\n"],"names":[],"mappings":"AAuHO,sBAAQ,MAAM,AAAC,CAAC,AACrB,SAAS,CAAE,MAAM,IAAI,CAAC,AACxB,CAAC"}`
};
var Services = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const services2 = [
    {
      title: "Web Development",
      tagline: "Creating intuitive sexy client facing front ends while writing lean and clean structured backends.",
      specialities: [
        "JavaScript Framework Development",
        "back-end development",
        "eCommerce",
        "API integrations",
        "content management system solutions"
      ],
      image: "/images/web-development-illustration.svg",
      url: "/web-development"
    },
    {
      title: "WordPress Solutions",
      tagline: "WordPress dominates the web world and I come correct to tackle every aspect of the development ecosystem.",
      specialities: [
        "Headlesss Wordpress / Jamstack Builds",
        "Block Editor Development",
        "traditional theme development",
        "agency development training"
      ],
      image: "/images/wordpress-development-illustration.svg",
      url: "/wordpress-development"
    },
    {
      title: "Branding",
      tagline: "Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence.",
      specialities: [
        "market research",
        "brand strategy / positioning",
        "brand identity",
        "storytelling"
      ],
      image: "/images/branding-service-illustration.svg",
      url: "/branding"
    },
    {
      title: "Search Engine Optimization",
      tagline: "Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence.",
      specialities: [
        "local ranking",
        "on site optimization",
        "technical seo analysis",
        "complete SEO audit"
      ],
      image: "/images/seo-service-illustration.svg",
      url: "/seo"
    }
  ];
  $$result.css.add(css$2);
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Web Developemnt, SEO, and Branding Services from Branden Builds",
    keywords: "web dev, frontend development, backend development",
    description: "Top notch web development, digital marketing, and branding services from Branden Builds.",
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}
<section id="${"services-hero"}" class="${"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4 pb-20 relative z-10"}"><h1 class="${"text-xl md:text-3xl lg:max-w-2/3 mb-8"}">Branden Builds Web Development | Branding | SEO Freelance Services
		</h1>
		<blockquote class="${"text-lg md:text-xl md:mb-6 lg:max-w-2/3 leading-snug"}">&quot;modern problems require modern solutions&quot; <cite class="${"block text-md"}">-Dave Chappelle</cite></blockquote>
		<a href="${"/contact"}" class="${"button mt-8 inline-block"}">Talk nerdy to me</a></div>
	<div class="${"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></section>
<section id="${"services-list"}" class="${"bg-bbuilds-yellow py-10 lg:py-20"}"><div class="${"mx-auto max-w-3xl px-4"}"><ul>${each(services2, (service, index2) => `<li class="${"mb-10"}"><a${add_attribute("href", service.url, 0)} sveltekit:prefetch class="${"service block md:flex items-center p-4 border border-bbuilds-black rounded w-full h-full transition duration-300 ease-in-out svelte-d20ok2"}"><picture class="${"md:p-8"}"><img${add_attribute("src", service.image, 0)}${add_attribute("alt", `${service.title} Illustration`, 0)} class="${"w-1/4 md:w-100"}"></picture>
					<div class="${"py-8"}"><h6 class="${"text-xl font-semibold leading-none mb-4"}">${escape2(service.title)}</h6>
						<p class="${"mt-2"}">${escape2(service.tagline)}</p>
						${service.specialities ? `<ul class="${"mt-4 disc"}">${each(service.specialities, (item) => `<li>${escape2(item)}</li>`)}
							</ul>` : ``}
					</div></a>
				</li>`)}</ul></div></section>
${validate_component(Process, "Process").$$render($$result, { title: false }, {}, {})}`;
});
var services = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Services
});
var Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { url = `https://${$page.host}${$page.path}` } = $$props;
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  $$unsubscribe_page();
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Contact Branden Builds",
    keywords: "branden builds, web developer, frontend developer, backend developer",
    description: "Contact branden builds for all of your web services.",
    url,
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<article><section id="${"contact-hero"}" class="${"theme-full-height bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4 relative z-10"}"><h1 class="${"text-xl md:text-3xl lg:max-w-2/3 mb-8"}">Contact Branden Builds</h1>
			<form name="${"bbuilds-contact"}" class="${"md:max-w-1/2"}" action="${"https://formspree.io/f/xjvjpbqb"}" method="${"POST"}"><ul><li class="${"mb-4"}"><label class="${"block mb-2"}" for="${"name"}">Name*</label>
						<input id="${"name"}" class="${"block bg-bbuilds-gray w-full p-2 text-bbuilds-black"}" type="${"text"}" autocomplete="${"name"}" name="${"name"}"></li>
					<li class="${"mb-4 mb-2"}"><label for="${"email"}" class="${"block mb-2"}">E-Mail*</label>
						<input id="${"email"}" type="${"email"}" autocomplete="${"email"}" name="${"email"}" class="${"block bg-bbuilds-gray w-full p-2 text-bbuilds-black"}"></li>
					<li class="${"mb-4"}"><label class="${"block mb-2"}" for="${"message"}">Your message*</label>
						<textarea id="${"message"}" cols="${"30"}" rows="${"10"}" class="${"block bg-bbuilds-gray w-full p-2 text-bbuilds-black"}" name="${"message"}"></textarea></li>
					<li><button type="${"submit"}" class="${"btn"}">Send message</button></li></ul></form></div>
		<div class="${"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></section></article>`;
});
var contact = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Contact
});
var css$1 = {
  code: ".hero.svelte-1qd0x0h{height:35vh;min-height:200px}.hero-brand-cube.svelte-1qd0x0h{max-width:20%}.svg.link{position:absolute;width:5rem;height:5rem}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script>\\n\\timport { session } from '$app/stores';\\n    import PostPreview from \\"$lib/PostPreview.svelte\\";\\n    import { page } from '$app/stores';\\n\\timport OpenGraph from '$lib/OpenGraph.svelte';\\n\\timport BrandCube from '$lib/svgs/brandcube.svelte';\\n\\texport let url = \`https://\${$page.host}\${$page.path}\`;\\n\\n    const posts = $session.posts\\n<\/script>\\n\\n<OpenGraph\\n\\ttitle={'Branden Builds Blog'}\\n\\tkeywords={'frontend posts, backend posts, technical SEO articles'}\\n\\tdescription=\\"A blog that has content on full stack web development, technical SEO, and branding.\\"\\n\\t{url}\\n\\timage={\`images/brandenbuilds-opengraph.jpg\`}\\n/>\\n\\n\\n<section\\n\\t\\tid=\\"blog-hero\\"\\n\\t\\tclass=\\"hero bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative\\"\\n\\t>\\n\\t\\t<div class=\\"container mx-auto px-4\\">\\n\\t\\t\\t<h1 class=\\"mb-8\\">Branden Builds Blog</h1>\\n            <p class=\\"md:w-1/2\\">Read articles and posts on web development, SEO, and branding.</p>\\n\\t\\t</div>\\n\\t\\t<div class=\\"hero-brand-cube hidden md:block absolute right-0 bottom-0\\">\\n\\t\\t\\t<BrandCube />\\n\\t\\t</div>\\n\\t</section>\\n\\n<section id=\\"recent-posts\\" class=\\"bg-bbuilds-gray py-20\\">\\n    <div class=\\"container mx-auto px-4\\">\\n        <h2 class=\\"mb-16 text-center text-h2\\">Articles</h2>\\n        <div class=\\"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10\\">\\n            {#each posts as post, index}\\n                <div class=\\"posts-grid__item\\">\\n                    <PostPreview {post} />\\n                </div>\\n            {/each}\\n        </div>\\n    </div>\\n</section>\\n\\n<style>.hero {\\n  height: 35vh;\\n  min-height: 200px;\\n}\\n.hero-brand-cube {\\n  max-width: 20%;\\n}\\n:global(.svg.link) {\\n  position: absolute;\\n  width: 5rem;\\n  height: 5rem;\\n}</style>"],"names":[],"mappings":"AA8CO,KAAK,eAAC,CAAC,AACZ,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,gBAAgB,eAAC,CAAC,AAChB,SAAS,CAAE,GAAG,AAChB,CAAC,AACO,SAAS,AAAE,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC"}`
};
var Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  let $page, $$unsubscribe_page;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { url = `https://${$page.host}${$page.path}` } = $$props;
  const posts = $session.posts;
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  $$result.css.add(css$1);
  $$unsubscribe_session();
  $$unsubscribe_page();
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Branden Builds Blog",
    keywords: "frontend posts, backend posts, technical SEO articles",
    description: "A blog that has content on full stack web development, technical SEO, and branding.",
    url,
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}


<section id="${"blog-hero"}" class="${"hero bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative svelte-1qd0x0h"}"><div class="${"container mx-auto px-4"}"><h1 class="${"mb-8"}">Branden Builds Blog</h1>
            <p class="${"md:w-1/2"}">Read articles and posts on web development, SEO, and branding.</p></div>
		<div class="${"hero-brand-cube hidden md:block absolute right-0 bottom-0 svelte-1qd0x0h"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></section>

<section id="${"recent-posts"}" class="${"bg-bbuilds-gray py-20"}"><div class="${"container mx-auto px-4"}"><h2 class="${"mb-16 text-center text-h2"}">Articles</h2>
        <div class="${"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"}">${each(posts, (post, index2) => `<div class="${"posts-grid__item"}">${validate_component(PostPreview, "PostPreview").$$render($$result, { post }, {}, {})}
                </div>`)}</div></div>
</section>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Blog
});
var css = {
  code: ".hero-brand-cube.svelte-1yr9s0y{max-width:20%}.svg.link{position:absolute;width:5rem;height:5rem}",
  map: '{"version":3,"file":"[tag].svelte","sources":["[tag].svelte"],"sourcesContent":["<script>\\n\\timport { page, session } from \'$app/stores\';\\n\\timport OpenGraph from \'$lib/OpenGraph.svelte\';\\n\\timport BrandCube from \'$lib/svgs/brandcube.svelte\';\\n\\timport PostPreview from \'$lib/PostPreview.svelte\';\\n\\n\\texport let tag = $page.params.tag;\\n\\texport let url = `https://${$page.host}${$page.path}`;\\n\\n\\tconst posts = $session.posts;\\n\\tconsole.log(\'posts\', posts);\\n\\tconst filteredTagPosts = posts.filter((post) => {\\n\\t\\treturn post.tags.includes(tag);\\n\\t});\\n<\/script>\\n\\n<OpenGraph\\n\\ttitle={`Posts tagged ${tag} on Branden Builds Blog `}\\n\\tkeywords={`frontend posts, backend posts, technical SEO articles tagged ${tag}`}\\n\\tdescription={`Read Branden Build\'s articles on ${tag}`}\\n\\t{url}\\n\\timage={`images/brandenbuilds-opengraph.jpg`}\\n/>\\n\\n<section\\n\\tid=\\"tag-hero\\"\\n\\tclass=\\"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative\\"\\n>\\n\\t<div class=\\"container mx-auto px-4\\">\\n\\t\\t<h1 class=\\"text-xl md:text-3xl mb-8 md:w-1/2\\">Branden Builds Blog Posts Tagged: {tag}</h1>\\n\\t</div>\\n\\t<div class=\\"hero-brand-cube hidden md:block absolute right-0 bottom-0\\">\\n\\t\\t<BrandCube />\\n\\t</div>\\n</section>\\n\\n<section\\n\\tid=\\"tagged-posts\\"\\n\\tclass=\\"bg-bbuilds-gray py-10 lg:py-20\\"\\n>\\n\\t<div class=\\"container mx-auto px-4\\">\\n\\t\\t<h2 class=\\" mt-6 mb-16 text-center text-h2\\">Articles Tagged: {tag}</h2>\\n\\t\\t<div class=\\"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10\\">\\n\\t\\t\\t{#each filteredTagPosts as post}\\n\\t\\t\\t\\t<div class=\\"posts-grid__item\\">\\n\\t\\t\\t\\t\\t<PostPreview {post} />\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/each}\\n\\t\\t</div>\\n\\t</div>\\n</section>\\n\\n<style>.hero-brand-cube {\\n  max-width: 20%;\\n}\\n:global(.svg.link) {\\n  position: absolute;\\n  width: 5rem;\\n  height: 5rem;\\n}</style>\\n"],"names":[],"mappings":"AAoDO,gBAAgB,eAAC,CAAC,AACvB,SAAS,CAAE,GAAG,AAChB,CAAC,AACO,SAAS,AAAE,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACd,CAAC"}'
};
var U5Btagu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  let $page, $$unsubscribe_page;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { tag = $page.params.tag } = $$props;
  let { url = `https://${$page.host}${$page.path}` } = $$props;
  const posts = $session.posts;
  console.log("posts", posts);
  const filteredTagPosts = posts.filter((post) => {
    return post.tags.includes(tag);
  });
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  $$result.css.add(css);
  $$unsubscribe_session();
  $$unsubscribe_page();
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: `Posts tagged ${tag} on Branden Builds Blog `,
    keywords: `frontend posts, backend posts, technical SEO articles tagged ${tag}`,
    description: `Read Branden Build's articles on ${tag}`,
    url,
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<section id="${"tag-hero"}" class="${"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4"}"><h1 class="${"text-xl md:text-3xl mb-8 md:w-1/2"}">Branden Builds Blog Posts Tagged: ${escape2(tag)}</h1></div>
	<div class="${"hero-brand-cube hidden md:block absolute right-0 bottom-0 svelte-1yr9s0y"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></section>

<section id="${"tagged-posts"}" class="${"bg-bbuilds-gray py-10 lg:py-20"}"><div class="${"container mx-auto px-4"}"><h2 class="${" mt-6 mb-16 text-center text-h2"}">Articles Tagged: ${escape2(tag)}</h2>
		<div class="${"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"}">${each(filteredTagPosts, (post) => `<div class="${"posts-grid__item"}">${validate_component(PostPreview, "PostPreview").$$render($$result, { post }, {}, {})}
				</div>`)}</div></div>
</section>`;
});
var _tag_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Btagu5D
});
var Seo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(OpenGraph, "OpenGraph").$$render($$result, {
    title: "Search Engine Optimization Services | Branden Builds",
    keywords: "seo, search engine optimization, local seo, technical seo",
    description: "Top ranking SEO services by Branden Builds",
    image: `images/brandenbuilds-opengraph.jpg`
  }, {}, {})}

<article><header id="${"hero"}" class="${"py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"}"><div class="${"container mx-auto px-4 pb-20 relative z-10"}"><h1 class="${"text-xl md:text-3xl lg:max-w-2/3 mb-8"}">Search Engine Optimization Services</h1>
			<p class="${"md:w-1/2"}">To excel at search engine optimization, one must understand the technical action needed to
				improve search results.
			</p>
			<a href="${"/contact"}" class="${"button mt-8 inline-block"}">Talk nerdy to me</a></div>
		<div class="${"hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4"}">${validate_component(Brandcube, "BrandCube").$$render($$result, {}, {}, {})}</div></header>
	<section class="${"py-10 post-content"}"><div class="${"px-4 max-w-3xl mx-auto"}"><p>SEO agencies have really given SEO a bad name. In the world of web and tech, they get the reputaiton as used car salesman. Most liekly because a lot of &quot;SEO experts&quot; claim to be marketing gensisuses and not in depth technical experts of how the web and search engines work. Let&#39;s work together to change that.</p>
			<h2>Content Strategy</h2>
			<p>This is where we need to start. Before we can display the content, we first need to focus
				and define with research and data what our content will be. Our goal is to understand what
				your audience wants to fine and how we can use our research to create an engaging message.
				Some things we will do here:
			</p>
			<ul><li>Market Research</li>
				<li>Keyword Research</li>
				<li>Content Creation</li></ul>
			<ul><li>On page SEO (getting into technical SEO below)</li>
				<li>urls</li>
				<li>meta tags</li>
				<li>Semantic structured HTML with a content flow.</li></ul>
			<h2>Technical SEO</h2>
			<p>You can have the best keyword research driven content, but poor search results and
				conversions if your website your website isn&#39;t optimized to be crawled, indexed, and
				&quot;understood&quot; by search engines. This requires in depth knowledge of how websites
				are built and the how search engines operate. Below are some technical SEO categories and
				services I can optimize.
			</p>
			<h3>Crawlability</h3>
			<p>How well can search engines discover your website and find what you want them to discover.
				Some methods and properties to service are:
			</p>
			<ul><li>URL Structure</li>
				<li>Site Maps</li>
				<li>Internal linking and Breadcrumbs</li>
				<li>Robots.txt</li>
				<li>More!</li></ul>
			<h3>Performance</h3>
			<p>We always have known that website speed played a factor in ranking but as of this year,
				2021, Google announced directly that their rollout of Core Web Vitals will be a direct
				ranking factor. I understand these metrics and modern development tools and practices to
				make sure website is meeting performance metrics specified such as:
			</p>
			<ul><li>Website loading with 2.5s or less</li>
				<li>Interactivity, your site should be interactive within 100ms or less</li>
				<li>Stable layout, content isn&#39;t shifting all over the place as the website loads.</li>
				<li>Mobile usability</li></ul>
			<h3>Indexation / Understanding</h3>
			<p>Once the search engines can easily crawl and discover your content, we want them to
				&quot;understand&quot; what it&#39;s crawling. This is where the technical expertise as a
				web developer really comes in.
			</p>
			<ul><li>Structured Data using JSON</li>
				<li>Semantic HTML setup</li>
				<li>Accessibility checks</li>
				<li>Well written content</li>
				<li>More!</li></ul>
			<h2>Local SEO</h2>
			<p>Getting on the map is easy, dominating the map takes skill. Since 2015, over <a href="${"https://searchengineland.com/report-nearly-60-percent-searches-now-mobile-devices-255025"}" target="${"_blank"}" rel="${"noopener noreferrer nofollow"}">60% of searches have been mobile</a>
				with research showing that
				<a href="${"https://www.searchenginewatch.com/2014/04/09/80-of-local-searches-on-mobile-phones-convert-study/"}" target="${"_blank"}" rel="${"noopener noreferrer nofollow"}">80% of local searches on mobile phones convert</a>. We can safely admit these numbers have increased since 2015 and will only continue. This
				is one of the most important marketing strategies fo a local business ready to connect to
				potential buyers.
			</p>
			<p>Some things we can focus on here:</p>
			<ul><li>Google My Business (GMB) page optimization</li>
				<li>Google My Business Posts</li>
				<li><a href="${"https://developers.google.com/search/docs/advanced/structured-data/local-business"}" target="${"_blank"}" rel="${"noopener noreferrer nofollow"}">Local Business Schema Markup</a></li>
				<li>Spam Fighting</li></ul></div></section></article>`;
});
var seo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Seo
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
