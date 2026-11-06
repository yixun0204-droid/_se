var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedAsync(name) {
  const fn = /* @__PURE__ */ notImplemented(name);
  fn.__promisify__ = () => /* @__PURE__ */ notImplemented(name + ".__promisify__");
  fn.native = fn;
  return fn;
}
__name(notImplementedAsync, "notImplementedAsync");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// worker.js
import { handleAsNodeRequest } from "cloudflare:node";

// node_modules/unenv/dist/runtime/node/internal/fs/promises.mjs
var access = /* @__PURE__ */ notImplemented("fs.access");
var copyFile = /* @__PURE__ */ notImplemented("fs.copyFile");
var cp = /* @__PURE__ */ notImplemented("fs.cp");
var open = /* @__PURE__ */ notImplemented("fs.open");
var opendir = /* @__PURE__ */ notImplemented("fs.opendir");
var rename = /* @__PURE__ */ notImplemented("fs.rename");
var truncate = /* @__PURE__ */ notImplemented("fs.truncate");
var rm = /* @__PURE__ */ notImplemented("fs.rm");
var rmdir = /* @__PURE__ */ notImplemented("fs.rmdir");
var mkdir = /* @__PURE__ */ notImplemented("fs.mkdir");
var readdir = /* @__PURE__ */ notImplemented("fs.readdir");
var readlink = /* @__PURE__ */ notImplemented("fs.readlink");
var symlink = /* @__PURE__ */ notImplemented("fs.symlink");
var lstat = /* @__PURE__ */ notImplemented("fs.lstat");
var stat = /* @__PURE__ */ notImplemented("fs.stat");
var link = /* @__PURE__ */ notImplemented("fs.link");
var unlink = /* @__PURE__ */ notImplemented("fs.unlink");
var chmod = /* @__PURE__ */ notImplemented("fs.chmod");
var lchmod = /* @__PURE__ */ notImplemented("fs.lchmod");
var lchown = /* @__PURE__ */ notImplemented("fs.lchown");
var chown = /* @__PURE__ */ notImplemented("fs.chown");
var utimes = /* @__PURE__ */ notImplemented("fs.utimes");
var lutimes = /* @__PURE__ */ notImplemented("fs.lutimes");
var realpath = /* @__PURE__ */ notImplemented("fs.realpath");
var mkdtemp = /* @__PURE__ */ notImplemented("fs.mkdtemp");
var writeFile = /* @__PURE__ */ notImplemented("fs.writeFile");
var appendFile = /* @__PURE__ */ notImplemented("fs.appendFile");
var readFile = /* @__PURE__ */ notImplemented("fs.readFile");
var watch = /* @__PURE__ */ notImplemented("fs.watch");
var statfs = /* @__PURE__ */ notImplemented("fs.statfs");
var glob = /* @__PURE__ */ notImplemented("fs.glob");

// node_modules/unenv/dist/runtime/node/internal/fs/constants.mjs
var constants_exports = {};
__export(constants_exports, {
  COPYFILE_EXCL: () => COPYFILE_EXCL,
  COPYFILE_FICLONE: () => COPYFILE_FICLONE,
  COPYFILE_FICLONE_FORCE: () => COPYFILE_FICLONE_FORCE,
  EXTENSIONLESS_FORMAT_JAVASCRIPT: () => EXTENSIONLESS_FORMAT_JAVASCRIPT,
  EXTENSIONLESS_FORMAT_WASM: () => EXTENSIONLESS_FORMAT_WASM,
  F_OK: () => F_OK,
  O_APPEND: () => O_APPEND,
  O_CREAT: () => O_CREAT,
  O_DIRECT: () => O_DIRECT,
  O_DIRECTORY: () => O_DIRECTORY,
  O_DSYNC: () => O_DSYNC,
  O_EXCL: () => O_EXCL,
  O_NOATIME: () => O_NOATIME,
  O_NOCTTY: () => O_NOCTTY,
  O_NOFOLLOW: () => O_NOFOLLOW,
  O_NONBLOCK: () => O_NONBLOCK,
  O_RDONLY: () => O_RDONLY,
  O_RDWR: () => O_RDWR,
  O_SYNC: () => O_SYNC,
  O_TRUNC: () => O_TRUNC,
  O_WRONLY: () => O_WRONLY,
  R_OK: () => R_OK,
  S_IFBLK: () => S_IFBLK,
  S_IFCHR: () => S_IFCHR,
  S_IFDIR: () => S_IFDIR,
  S_IFIFO: () => S_IFIFO,
  S_IFLNK: () => S_IFLNK,
  S_IFMT: () => S_IFMT,
  S_IFREG: () => S_IFREG,
  S_IFSOCK: () => S_IFSOCK,
  S_IRGRP: () => S_IRGRP,
  S_IROTH: () => S_IROTH,
  S_IRUSR: () => S_IRUSR,
  S_IRWXG: () => S_IRWXG,
  S_IRWXO: () => S_IRWXO,
  S_IRWXU: () => S_IRWXU,
  S_IWGRP: () => S_IWGRP,
  S_IWOTH: () => S_IWOTH,
  S_IWUSR: () => S_IWUSR,
  S_IXGRP: () => S_IXGRP,
  S_IXOTH: () => S_IXOTH,
  S_IXUSR: () => S_IXUSR,
  UV_DIRENT_BLOCK: () => UV_DIRENT_BLOCK,
  UV_DIRENT_CHAR: () => UV_DIRENT_CHAR,
  UV_DIRENT_DIR: () => UV_DIRENT_DIR,
  UV_DIRENT_FIFO: () => UV_DIRENT_FIFO,
  UV_DIRENT_FILE: () => UV_DIRENT_FILE,
  UV_DIRENT_LINK: () => UV_DIRENT_LINK,
  UV_DIRENT_SOCKET: () => UV_DIRENT_SOCKET,
  UV_DIRENT_UNKNOWN: () => UV_DIRENT_UNKNOWN,
  UV_FS_COPYFILE_EXCL: () => UV_FS_COPYFILE_EXCL,
  UV_FS_COPYFILE_FICLONE: () => UV_FS_COPYFILE_FICLONE,
  UV_FS_COPYFILE_FICLONE_FORCE: () => UV_FS_COPYFILE_FICLONE_FORCE,
  UV_FS_O_FILEMAP: () => UV_FS_O_FILEMAP,
  UV_FS_SYMLINK_DIR: () => UV_FS_SYMLINK_DIR,
  UV_FS_SYMLINK_JUNCTION: () => UV_FS_SYMLINK_JUNCTION,
  W_OK: () => W_OK,
  X_OK: () => X_OK
});
var UV_FS_SYMLINK_DIR = 1;
var UV_FS_SYMLINK_JUNCTION = 2;
var O_RDONLY = 0;
var O_WRONLY = 1;
var O_RDWR = 2;
var UV_DIRENT_UNKNOWN = 0;
var UV_DIRENT_FILE = 1;
var UV_DIRENT_DIR = 2;
var UV_DIRENT_LINK = 3;
var UV_DIRENT_FIFO = 4;
var UV_DIRENT_SOCKET = 5;
var UV_DIRENT_CHAR = 6;
var UV_DIRENT_BLOCK = 7;
var EXTENSIONLESS_FORMAT_JAVASCRIPT = 0;
var EXTENSIONLESS_FORMAT_WASM = 1;
var S_IFMT = 61440;
var S_IFREG = 32768;
var S_IFDIR = 16384;
var S_IFCHR = 8192;
var S_IFBLK = 24576;
var S_IFIFO = 4096;
var S_IFLNK = 40960;
var S_IFSOCK = 49152;
var O_CREAT = 64;
var O_EXCL = 128;
var UV_FS_O_FILEMAP = 0;
var O_NOCTTY = 256;
var O_TRUNC = 512;
var O_APPEND = 1024;
var O_DIRECTORY = 65536;
var O_NOATIME = 262144;
var O_NOFOLLOW = 131072;
var O_SYNC = 1052672;
var O_DSYNC = 4096;
var O_DIRECT = 16384;
var O_NONBLOCK = 2048;
var S_IRWXU = 448;
var S_IRUSR = 256;
var S_IWUSR = 128;
var S_IXUSR = 64;
var S_IRWXG = 56;
var S_IRGRP = 32;
var S_IWGRP = 16;
var S_IXGRP = 8;
var S_IRWXO = 7;
var S_IROTH = 4;
var S_IWOTH = 2;
var S_IXOTH = 1;
var F_OK = 0;
var R_OK = 4;
var W_OK = 2;
var X_OK = 1;
var UV_FS_COPYFILE_EXCL = 1;
var COPYFILE_EXCL = 1;
var UV_FS_COPYFILE_FICLONE = 2;
var COPYFILE_FICLONE = 2;
var UV_FS_COPYFILE_FICLONE_FORCE = 4;
var COPYFILE_FICLONE_FORCE = 4;

// node_modules/unenv/dist/runtime/node/fs/promises.mjs
var promises_default = {
  constants: constants_exports,
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  cp,
  glob,
  lchmod,
  lchown,
  link,
  lstat,
  lutimes,
  mkdir,
  mkdtemp,
  open,
  opendir,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  statfs,
  symlink,
  truncate,
  unlink,
  utimes,
  watch,
  writeFile
};

// node_modules/unenv/dist/runtime/node/internal/fs/classes.mjs
var Dir = /* @__PURE__ */ notImplementedClass("fs.Dir");
var Dirent = /* @__PURE__ */ notImplementedClass("fs.Dirent");
var Stats = /* @__PURE__ */ notImplementedClass("fs.Stats");
var ReadStream2 = /* @__PURE__ */ notImplementedClass("fs.ReadStream");
var WriteStream2 = /* @__PURE__ */ notImplementedClass("fs.WriteStream");
var FileReadStream = ReadStream2;
var FileWriteStream = WriteStream2;

// node_modules/unenv/dist/runtime/node/internal/fs/fs.mjs
function callbackify(fn) {
  const fnc = /* @__PURE__ */ __name(function(...args) {
    const cb = args.pop();
    fn().catch((error3) => cb(error3)).then((val) => cb(void 0, val));
  }, "fnc");
  fnc.__promisify__ = fn;
  fnc.native = fnc;
  return fnc;
}
__name(callbackify, "callbackify");
var access2 = callbackify(access);
var appendFile2 = callbackify(appendFile);
var chown2 = callbackify(chown);
var chmod2 = callbackify(chmod);
var copyFile2 = callbackify(copyFile);
var cp2 = callbackify(cp);
var lchown2 = callbackify(lchown);
var lchmod2 = callbackify(lchmod);
var link2 = callbackify(link);
var lstat2 = callbackify(lstat);
var lutimes2 = callbackify(lutimes);
var mkdir2 = callbackify(mkdir);
var mkdtemp2 = callbackify(mkdtemp);
var realpath2 = callbackify(realpath);
var open2 = callbackify(open);
var opendir2 = callbackify(opendir);
var readdir2 = callbackify(readdir);
var readFile2 = callbackify(readFile);
var readlink2 = callbackify(readlink);
var rename2 = callbackify(rename);
var rm2 = callbackify(rm);
var rmdir2 = callbackify(rmdir);
var stat2 = callbackify(stat);
var symlink2 = callbackify(symlink);
var truncate2 = callbackify(truncate);
var unlink2 = callbackify(unlink);
var utimes2 = callbackify(utimes);
var writeFile2 = callbackify(writeFile);
var statfs2 = callbackify(statfs);
var close = /* @__PURE__ */ notImplementedAsync("fs.close");
var createReadStream = /* @__PURE__ */ notImplementedAsync("fs.createReadStream");
var createWriteStream = /* @__PURE__ */ notImplementedAsync("fs.createWriteStream");
var exists = /* @__PURE__ */ notImplementedAsync("fs.exists");
var fchown = /* @__PURE__ */ notImplementedAsync("fs.fchown");
var fchmod = /* @__PURE__ */ notImplementedAsync("fs.fchmod");
var fdatasync = /* @__PURE__ */ notImplementedAsync("fs.fdatasync");
var fstat = /* @__PURE__ */ notImplementedAsync("fs.fstat");
var fsync = /* @__PURE__ */ notImplementedAsync("fs.fsync");
var ftruncate = /* @__PURE__ */ notImplementedAsync("fs.ftruncate");
var futimes = /* @__PURE__ */ notImplementedAsync("fs.futimes");
var lstatSync = /* @__PURE__ */ notImplementedAsync("fs.lstatSync");
var read = /* @__PURE__ */ notImplementedAsync("fs.read");
var readv = /* @__PURE__ */ notImplementedAsync("fs.readv");
var realpathSync = /* @__PURE__ */ notImplementedAsync("fs.realpathSync");
var statSync = /* @__PURE__ */ notImplementedAsync("fs.statSync");
var unwatchFile = /* @__PURE__ */ notImplementedAsync("fs.unwatchFile");
var watch2 = /* @__PURE__ */ notImplementedAsync("fs.watch");
var watchFile = /* @__PURE__ */ notImplementedAsync("fs.watchFile");
var write = /* @__PURE__ */ notImplementedAsync("fs.write");
var writev = /* @__PURE__ */ notImplementedAsync("fs.writev");
var _toUnixTimestamp = /* @__PURE__ */ notImplementedAsync("fs._toUnixTimestamp");
var openAsBlob = /* @__PURE__ */ notImplementedAsync("fs.openAsBlob");
var glob2 = /* @__PURE__ */ notImplementedAsync("fs.glob");
var appendFileSync = /* @__PURE__ */ notImplemented("fs.appendFileSync");
var accessSync = /* @__PURE__ */ notImplemented("fs.accessSync");
var chownSync = /* @__PURE__ */ notImplemented("fs.chownSync");
var chmodSync = /* @__PURE__ */ notImplemented("fs.chmodSync");
var closeSync = /* @__PURE__ */ notImplemented("fs.closeSync");
var copyFileSync = /* @__PURE__ */ notImplemented("fs.copyFileSync");
var cpSync = /* @__PURE__ */ notImplemented("fs.cpSync");
var existsSync = /* @__PURE__ */ __name(() => false, "existsSync");
var fchownSync = /* @__PURE__ */ notImplemented("fs.fchownSync");
var fchmodSync = /* @__PURE__ */ notImplemented("fs.fchmodSync");
var fdatasyncSync = /* @__PURE__ */ notImplemented("fs.fdatasyncSync");
var fstatSync = /* @__PURE__ */ notImplemented("fs.fstatSync");
var fsyncSync = /* @__PURE__ */ notImplemented("fs.fsyncSync");
var ftruncateSync = /* @__PURE__ */ notImplemented("fs.ftruncateSync");
var futimesSync = /* @__PURE__ */ notImplemented("fs.futimesSync");
var lchownSync = /* @__PURE__ */ notImplemented("fs.lchownSync");
var lchmodSync = /* @__PURE__ */ notImplemented("fs.lchmodSync");
var linkSync = /* @__PURE__ */ notImplemented("fs.linkSync");
var lutimesSync = /* @__PURE__ */ notImplemented("fs.lutimesSync");
var mkdirSync = /* @__PURE__ */ notImplemented("fs.mkdirSync");
var mkdtempSync = /* @__PURE__ */ notImplemented("fs.mkdtempSync");
var openSync = /* @__PURE__ */ notImplemented("fs.openSync");
var opendirSync = /* @__PURE__ */ notImplemented("fs.opendirSync");
var readdirSync = /* @__PURE__ */ notImplemented("fs.readdirSync");
var readSync = /* @__PURE__ */ notImplemented("fs.readSync");
var readvSync = /* @__PURE__ */ notImplemented("fs.readvSync");
var readFileSync = /* @__PURE__ */ notImplemented("fs.readFileSync");
var readlinkSync = /* @__PURE__ */ notImplemented("fs.readlinkSync");
var renameSync = /* @__PURE__ */ notImplemented("fs.renameSync");
var rmSync = /* @__PURE__ */ notImplemented("fs.rmSync");
var rmdirSync = /* @__PURE__ */ notImplemented("fs.rmdirSync");
var symlinkSync = /* @__PURE__ */ notImplemented("fs.symlinkSync");
var truncateSync = /* @__PURE__ */ notImplemented("fs.truncateSync");
var unlinkSync = /* @__PURE__ */ notImplemented("fs.unlinkSync");
var utimesSync = /* @__PURE__ */ notImplemented("fs.utimesSync");
var writeFileSync = /* @__PURE__ */ notImplemented("fs.writeFileSync");
var writeSync = /* @__PURE__ */ notImplemented("fs.writeSync");
var writevSync = /* @__PURE__ */ notImplemented("fs.writevSync");
var statfsSync = /* @__PURE__ */ notImplemented("fs.statfsSync");
var globSync = /* @__PURE__ */ notImplemented("fs.globSync");

// node_modules/unenv/dist/runtime/node/fs.mjs
var fs_default = {
  F_OK,
  R_OK,
  W_OK,
  X_OK,
  constants: constants_exports,
  promises: promises_default,
  Dir,
  Dirent,
  FileReadStream,
  FileWriteStream,
  ReadStream: ReadStream2,
  Stats,
  WriteStream: WriteStream2,
  _toUnixTimestamp,
  access: access2,
  accessSync,
  appendFile: appendFile2,
  appendFileSync,
  chmod: chmod2,
  chmodSync,
  chown: chown2,
  chownSync,
  close,
  closeSync,
  copyFile: copyFile2,
  copyFileSync,
  cp: cp2,
  cpSync,
  createReadStream,
  createWriteStream,
  exists,
  existsSync,
  fchmod,
  fchmodSync,
  fchown,
  fchownSync,
  fdatasync,
  fdatasyncSync,
  fstat,
  fstatSync,
  fsync,
  fsyncSync,
  ftruncate,
  ftruncateSync,
  futimes,
  futimesSync,
  glob: glob2,
  lchmod: lchmod2,
  globSync,
  lchmodSync,
  lchown: lchown2,
  lchownSync,
  link: link2,
  linkSync,
  lstat: lstat2,
  lstatSync,
  lutimes: lutimes2,
  lutimesSync,
  mkdir: mkdir2,
  mkdirSync,
  mkdtemp: mkdtemp2,
  mkdtempSync,
  open: open2,
  openAsBlob,
  openSync,
  opendir: opendir2,
  opendirSync,
  read,
  readFile: readFile2,
  readFileSync,
  readSync,
  readdir: readdir2,
  readdirSync,
  readlink: readlink2,
  readlinkSync,
  readv,
  readvSync,
  realpath: realpath2,
  realpathSync,
  rename: rename2,
  renameSync,
  rm: rm2,
  rmSync,
  rmdir: rmdir2,
  rmdirSync,
  stat: stat2,
  statSync,
  statfs: statfs2,
  statfsSync,
  symlink: symlink2,
  symlinkSync,
  truncate: truncate2,
  truncateSync,
  unlink: unlink2,
  unlinkSync,
  unwatchFile,
  utimes: utimes2,
  utimesSync,
  watch: watch2,
  watchFile,
  write,
  writeFile: writeFile2,
  writeFileSync,
  writeSync,
  writev,
  writevSync
};

// src/app.js
import http from "node:http";
import path2 from "node:path";
import { fileURLToPath } from "node:url";

// src/config.js
var ALGORITHM_VERSION = "tf-idf-cosine-v1";
var MAX_BODY_BYTES = 64 * 1024;

// src/http.js
import path from "node:path";
var HttpError = class extends Error {
  static {
    __name(this, "HttpError");
  }
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
};
var CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};
function parseCookies(header = "") {
  const cookies = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }
  return cookies;
}
__name(parseCookies, "parseCookies");
function setCookie(res, name, value, { maxAge, path: cookiePath = "/", httpOnly = true, sameSite = "Lax" } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${cookiePath}`);
  if (maxAge !== void 0) parts.push(`Max-Age=${maxAge}`);
  if (httpOnly) parts.push("HttpOnly");
  if (sameSite) parts.push(`SameSite=${sameSite}`);
  res.setHeader("Set-Cookie", parts.join("; "));
}
__name(setCookie, "setCookie");
function readBody(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, "\u8ACB\u6C42\u5167\u5BB9\u8D85\u904E\u5927\u5C0F\u9650\u5236"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
__name(readBody, "readBody");
function sendHtml(res, html, status = 200) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
    "Content-Security-Policy": "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  });
  res.end(html);
}
__name(sendHtml, "sendHtml");
function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(data, null, 2));
}
__name(sendJson, "sendJson");
function redirect(res, location, status = 302) {
  res.writeHead(status, { Location: location });
  res.end();
}
__name(redirect, "redirect");
function serveStatic(res, root, pathname) {
  const relative = pathname.slice("/static/".length);
  if (!relative || relative.includes("\0")) return false;
  const resolvedRoot = path.resolve(root);
  const filePath = path.resolve(resolvedRoot, relative);
  if (filePath !== resolvedRoot && !filePath.startsWith(`${resolvedRoot}${path.sep}`)) {
    return false;
  }
  let stat3;
  try {
    stat3 = fs_default.statSync(filePath);
  } catch {
    return false;
  }
  if (!stat3.isFile()) return false;
  const extension = path.extname(filePath).toLowerCase();
  const type = CONTENT_TYPES[extension] ?? "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat3.size,
    "Cache-Control": "public, max-age=3600"
  });
  res.end(fs_default.readFileSync(filePath));
  return true;
}
__name(serveStatic, "serveStatic");

// src/preferences.js
var DEFAULT_PREFERENCES = Object.freeze({
  theme: "light",
  density: "comfortable",
  showScores: true
});
var THEMES = ["light", "dark"];
var DENSITIES = ["comfortable", "compact"];
function sanitizePreferences(input = {}) {
  const theme = THEMES.includes(input.theme) ? input.theme : DEFAULT_PREFERENCES.theme;
  const density = DENSITIES.includes(input.density) ? input.density : DEFAULT_PREFERENCES.density;
  const showScores = typeof input.showScores === "boolean" ? input.showScores : DEFAULT_PREFERENCES.showScores;
  return { theme, density, showScores };
}
__name(sanitizePreferences, "sanitizePreferences");
function parsePreferences(raw) {
  if (!raw) return { ...DEFAULT_PREFERENCES };
  try {
    return sanitizePreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}
__name(parsePreferences, "parsePreferences");
function serializePreferences(preferences) {
  return JSON.stringify(sanitizePreferences(preferences));
}
__name(serializePreferences, "serializePreferences");

// src/router.js
function splitPath(pathname) {
  return pathname.split("/").filter(Boolean);
}
__name(splitPath, "splitPath");
function matchSegments(pattern, pathname) {
  const expected = splitPath(pattern);
  const actual = splitPath(pathname);
  if (expected.length !== actual.length) return null;
  const params = {};
  for (let i = 0; i < expected.length; i++) {
    const part = expected[i];
    if (part.startsWith(":")) {
      try {
        params[part.slice(1)] = decodeURIComponent(actual[i]);
      } catch {
        return null;
      }
    } else if (part !== actual[i]) {
      return null;
    }
  }
  return params;
}
__name(matchSegments, "matchSegments");
function createRouter() {
  const routes = [];
  function add(method, pattern, handler) {
    routes.push({ method, pattern, handler });
  }
  __name(add, "add");
  return {
    get: /* @__PURE__ */ __name((pattern, handler) => add("GET", pattern, handler), "get"),
    post: /* @__PURE__ */ __name((pattern, handler) => add("POST", pattern, handler), "post"),
    find(method, pathname) {
      let pathMatched = false;
      for (const route of routes) {
        const params = matchSegments(route.pattern, pathname);
        if (!params) continue;
        pathMatched = true;
        if (route.method === method) {
          return { handler: route.handler, params };
        }
      }
      return pathMatched ? { methodNotAllowed: true } : null;
    }
  };
}
__name(createRouter, "createRouter");

// src/safety/resources.js
var EMERGENCY_NOTE = "\u5982\u679C\u4F60\u6216\u8EAB\u908A\u7684\u4EBA\u6B63\u8655\u65BC\u7ACB\u5373\u5371\u96AA\uFF0C\u8ACB\u7ACB\u523B\u64A5\u6253 119\uFF08\u7DCA\u6025\u6551\u8B77\uFF09\u6216 110\uFF08\u5831\u8B66\uFF09\u3002";
var HOTLINES = [
  {
    id: "1925",
    name: "1925 \u5B89\u5FC3\u5C08\u7DDA",
    phone: "1925",
    hours: "24 \u5C0F\u6642",
    description: "\u885B\u751F\u798F\u5229\u90E8\u63D0\u4F9B\u7684\u5FC3\u60C5\u652F\u6301\u3001\u58D3\u529B\u8ABF\u9069\u8207\u5371\u6A5F\u8AEE\u8A62\u3002",
    tone: "primary"
  },
  {
    id: "1995",
    name: "1995 \u751F\u547D\u7DDA\u5354\u8AC7\u5C08\u7DDA",
    phone: "1995",
    hours: "24 \u5C0F\u6642",
    description: "\u7531\u5C08\u696D\u5FD7\u5DE5\u63D0\u4F9B\u50BE\u807D\u3001\u966A\u4F34\u8207\u81EA\u6BBA\u9632\u6CBB\u5354\u52A9\u3002",
    tone: "primary"
  },
  {
    id: "1980",
    name: "1980 \u5F35\u8001\u5E2B\u5C08\u7DDA",
    phone: "1980",
    hours: "\u670D\u52D9\u6642\u9593\u4F9D\u5404\u4E2D\u5FC3\u516C\u544A",
    description: "\u63D0\u4F9B\u60C5\u7DD2\u56F0\u64FE\u3001\u4EBA\u969B\u95DC\u4FC2\u8207\u5BB6\u5EAD\u8B70\u984C\u7684\u8AEE\u8A62\u3002",
    tone: "calm"
  },
  {
    id: "113",
    name: "113 \u4FDD\u8B77\u5C08\u7DDA",
    phone: "113",
    hours: "24 \u5C0F\u6642",
    description: "\u5BB6\u5EAD\u66B4\u529B\u3001\u6027\u4FB5\u5BB3\u3001\u5152\u5C11\u4FDD\u8B77\u8207\u4EBA\u8EAB\u5B89\u5168\u901A\u5831\u3002",
    tone: "calm"
  },
  {
    id: "119",
    name: "119 \u7DCA\u6025\u6551\u8B77",
    phone: "119",
    hours: "24 \u5C0F\u6642",
    description: "\u5DF2\u6709\u7ACB\u5373\u751F\u547D\u5371\u96AA\u6216\u8EAB\u9AD4\u50B7\u5BB3\u6642\uFF0C\u8ACB\u7ACB\u5373\u64A5\u6253\u3002",
    tone: "emergency"
  },
  {
    id: "110",
    name: "110 \u5831\u8B66",
    phone: "110",
    hours: "24 \u5C0F\u6642",
    description: "\u9700\u8981\u8B66\u65B9\u5354\u52A9\u6216\u6709\u4EBA\u8EAB\u5B89\u5168\u5A01\u8105\u6642\u64A5\u6253\u3002",
    tone: "emergency"
  }
];
var CARE_STEPS = [
  "\u5148\u78BA\u4FDD\u81EA\u5DF1\u5B89\u5168\uFF1A\u9060\u96E2\u53EF\u80FD\u9020\u6210\u50B7\u5BB3\u7684\u7269\u54C1\u3001\u5834\u6240\u6216\u60C5\u5883\u3002",
  "\u544A\u8A34\u4E00\u4F4D\u4F60\u4FE1\u4EFB\u7684\u4EBA\uFF0C\u8B93\u5C0D\u65B9\u77E5\u9053\u4F60\u73FE\u5728\u7684\u72C0\u6CC1\uFF0C\u4E26\u8ACB\u5C0D\u65B9\u966A\u4F34\u4F60\u3002",
  "\u64A5\u6253 1925 \u6216 1995\uFF0C\u6216\u524D\u5F80\u9130\u8FD1\u91AB\u9662\u7684\u6025\u8A3A\u3001\u8EAB\u5FC3\u79D1\u5C0B\u6C42\u5354\u52A9\u3002",
  "\u5982\u679C\u5DF2\u7D93\u53D7\u50B7\uFF0C\u6216\u89BA\u5F97\u81EA\u5DF1\u53EF\u80FD\u7ACB\u523B\u505A\u51FA\u50B7\u5BB3\u81EA\u5DF1\u7684\u884C\u70BA\uFF0C\u8ACB\u64A5\u6253 119 \u6216 110\u3002"
];
var DISTRESS_STEPS = [
  "\u5148\u505C\u4E0B\u4F86\uFF0C\u505A\u5E7E\u6B21\u7DE9\u6162\u7684\u6DF1\u547C\u5438\uFF0C\u8B93\u8EAB\u9AD4\u6709\u4E00\u9EDE\u7A7A\u9593\u3002",
  "\u628A\u73FE\u5728\u7684\u611F\u53D7\u544A\u8A34\u4E00\u4F4D\u4FE1\u4EFB\u7684\u4EBA\uFF0C\u4E0D\u9700\u8981\u7368\u81EA\u627F\u53D7\u3002",
  "\u5982\u679C\u60C5\u7DD2\u6301\u7E8C\u5F71\u97FF\u751F\u6D3B\uFF0C\u53EF\u4EE5\u9810\u7D04\u8EAB\u5FC3\u79D1\u6216\u5FC3\u7406\u8AEE\u5546\u3002",
  "\u82E5\u51FA\u73FE\u50B7\u5BB3\u81EA\u5DF1\u6216\u4ED6\u4EBA\u7684\u5FF5\u982D\uFF0C\u8ACB\u7ACB\u5373\u64A5\u6253 1925\u30011995 \u6216 119\u3002"
];
var PHYSICAL_STEPS = [
  "\u8A18\u9304\u75C7\u72C0\u8207\u6301\u7E8C\u6642\u9593\uFF0C\u5FC5\u8981\u6642\u76E1\u65E9\u5C31\u91AB\u3002",
  "\u7DAD\u6301\u57FA\u672C\u7684\u6C34\u5206\u8207\u71DF\u990A\u651D\u53D6\uFF0C\u907F\u514D\u7368\u81EA\u627F\u53D7\u8EAB\u9AD4\u4E0D\u9069\u3002",
  "\u82E5\u51FA\u73FE\u610F\u8B58\u4E0D\u6E05\u3001\u5287\u70C8\u75BC\u75DB\u6216\u7ACB\u5373\u5371\u96AA\uFF0C\u8ACB\u64A5\u6253 119\u3002",
  "\u8EAB\u9AD4\u8207\u5FC3\u7406\u7684\u5065\u5EB7\u540C\u6A23\u91CD\u8981\uFF0C\u5FC5\u8981\u6642\u53EF\u540C\u6642\u5C0B\u6C42\u5C08\u696D\u5354\u52A9\u3002"
];

// src/views/common.js
var ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char]);
}
__name(esc, "esc");
function flash(ok, err) {
  const parts = [];
  if (ok) parts.push(`<div class="flash flash-ok" role="status">${esc(ok)}</div>`);
  if (err) parts.push(`<div class="flash flash-err" role="alert">${esc(err)}</div>`);
  return parts.join("");
}
__name(flash, "flash");
function searchForm({ query = "", large = false } = {}) {
  return `<form class="search-form${large ? " search-form-lg" : ""}" method="get" action="/search" role="search">
    <label class="sr-only" for="q">\u641C\u5C0B\u95DC\u9375\u5B57</label>
    <input id="q" name="q" type="search" value="${esc(query)}" placeholder="\u8F38\u5165\u95DC\u9375\u5B57\uFF0C\u4F8B\u5982\uFF1A\u8CC7\u6599\u5EAB\u3001\u7761\u7720\u3001\u58D3\u529B" autocomplete="off" required>
    <button class="btn btn-primary" type="submit">\u641C\u5C0B</button>
  </form>`;
}
__name(searchForm, "searchForm");
function hotlineCard(item) {
  return `<article class="hotline hotline-${esc(item.tone)}">
    <div class="hotline-head">
      <h3>${esc(item.name)}</h3>
      <span class="hotline-hours">${esc(item.hours)}</span>
    </div>
    <p>${esc(item.description)}</p>
    <a class="hotline-phone" href="tel:${esc(item.phone)}">${esc(item.phone)}</a>
  </article>`;
}
__name(hotlineCard, "hotlineCard");
function hotlineCards({ limit } = {}) {
  const items = limit ? HOTLINES.slice(0, limit) : HOTLINES;
  return `<div class="hotline-grid">${items.map(hotlineCard).join("")}</div>`;
}
__name(hotlineCards, "hotlineCards");
function careBanner({ severity, acknowledged = false, categories = [] }) {
  const labels = categories.map((category) => category.label).join("\u3001");
  const title2 = severity === "critical" ? acknowledged ? "\u4F60\u9078\u64C7\u7E7C\u7E8C\u67E5\u770B\u7D50\u679C\uFF0C\u4F46\u6211\u5011\u4ECD\u60F3\u966A\u8457\u4F60" : "\u5148\u505C\u4E00\u4E0B\uFF0C\u8B93\u6211\u5011\u95DC\u5FC3\u4F60" : "\u5148\u7167\u9867\u81EA\u5DF1\uFF0C\u518D\u7E7C\u7E8C\u641C\u5C0B";
  return `<section class="care-banner" role="status" aria-live="polite">
    <div class="care-banner-text">
      <h2>${esc(title2)}</h2>
      <p>${labels ? `\u6211\u5011\u6CE8\u610F\u5230\u9019\u5247\u641C\u5C0B\u53EF\u80FD\u8207\u300C${esc(labels)}\u300D\u6709\u95DC\u3002` : "\u6211\u5011\u6CE8\u610F\u5230\u9019\u5247\u641C\u5C0B\u53EF\u80FD\u8207\u60C5\u7DD2\u6216\u8EAB\u9AD4\u5065\u5EB7\u6709\u95DC\u3002"}\u4F60\u4E0D\u9700\u8981\u7368\u81EA\u9762\u5C0D\u3002</p>
      <p>\u5982\u679C\u60C5\u6CC1\u7DCA\u6025\uFF0C\u8ACB\u64A5\u6253 <a href="tel:119">119</a> \u6216 <a href="tel:110">110</a>\uFF1B\u9700\u8981\u6709\u4EBA\u966A\u4F60\u8AAA\u8A71\uFF0C\u53EF\u4EE5\u64A5\u6253 <a href="tel:1925">1925</a> \u6216 <a href="tel:1995">1995</a>\u3002</p>
    </div>
    <div class="care-banner-actions">
      <a class="btn btn-primary" href="/help">\u67E5\u770B\u6C42\u52A9\u8CC7\u6E90</a>
      <a class="btn btn-ghost" href="tel:1925">\u64A5\u6253 1925</a>
    </div>
  </section>`;
}
__name(careBanner, "careBanner");
function statRow(items) {
  return `<div class="stat-row">${items.map(
    (item) => `<div class="stat"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></div>`
  ).join("")}</div>`;
}
__name(statRow, "statRow");

// src/views/layout.js
var NAV = [
  { path: "/", label: "\u9996\u9801", exact: true },
  { path: "/about", label: "\u6F14\u7B97\u6CD5\u8AAA\u660E" },
  { path: "/help", label: "\u6C42\u52A9\u8CC7\u6E90" },
  { path: "/preferences", label: "\u504F\u597D\u8A2D\u5B9A" }
];
function isActive(item, active) {
  if (item.exact) return active === item.path;
  return active === item.path || active.startsWith(`${item.path}/`);
}
__name(isActive, "isActive");
function navHtml(active) {
  return NAV.map((item) => {
    const current = isActive(item, active) ? ' aria-current="page"' : "";
    return `<a href="${esc(item.path)}"${current}>${esc(item.label)}</a>`;
  }).join("");
}
__name(navHtml, "navHtml");
function layout({
  title: title2,
  preferences = DEFAULT_PREFERENCES,
  active = "",
  content = "",
  ok = "",
  err = ""
}) {
  const theme = preferences.theme === "dark" ? "dark" : "light";
  const density = preferences.density === "compact" ? "compact" : "comfortable";
  return `<!doctype html>
<html lang="zh-Hant" data-theme="${esc(theme)}" data-density="${esc(density)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="\u5B89\u5FC3\u641C\u5C0B\uFF1A\u4E0D\u53D7\u500B\u4EBA\u504F\u597D\u5F71\u97FF\u7684\u641C\u5C0B\u6392\u5E8F\uFF0C\u4E26\u5728\u654F\u611F\u641C\u5C0B\u6642\u512A\u5148\u63D0\u4F9B\u6C42\u52A9\u8CC7\u6E90\u3002">
  <title>${esc(title2)} | \u5B89\u5FC3\u641C\u5C0B</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
<header class="topbar">
  <a class="brand" href="/">
    <span class="brand-mark">\u5B89</span>
    <span class="brand-text">
      <strong>\u5B89\u5FC3\u641C\u5C0B</strong>
      <small>\u516C\u5E73\u6392\u5E8F \xB7 \u5373\u6642\u95DC\u61F7</small>
    </span>
  </a>
  <nav class="main-nav" aria-label="\u4E3B\u8981\u5C0E\u89BD">${navHtml(active)}</nav>
</header>
<main class="page">
  ${flash(ok, err)}
  ${content}
</main>
<footer class="footer">
  <p>\u5B89\u5FC3\u641C\u5C0B \xB7 \u73FE\u4EE3\u8EDF\u9AD4\u5DE5\u7A0B\u8AB2\u7A0B\u5C08\u6848</p>
  <p>\u672C\u7CFB\u7D71\u70BA\u6559\u5B78\u793A\u7BC4\uFF0C\u4E0D\u63D0\u4F9B\u91AB\u7642\u8A3A\u65B7\u3002\u82E5\u4F60\u6216\u8EAB\u908A\u7684\u4EBA\u6709\u7ACB\u5373\u5371\u96AA\uFF0C\u8ACB\u64A5\u6253 119 \u6216 110\u3002</p>
</footer>
</body>
</html>`;
}
__name(layout, "layout");

// src/views/pages.js
function stepList(steps) {
  return `<ol class="step-list">${steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>`;
}
__name(stepList, "stepList");
function renderAbout({ preferences = DEFAULT_PREFERENCES }) {
  const content = `
  <section class="page-header">
    <p class="eyebrow">\u6F14\u7B97\u6CD5\u8AAA\u660E</p>
    <h1>\u70BA\u4EC0\u9EBC\u6BCF\u500B\u4EBA\u770B\u5230\u7684\u6392\u5E8F\u90FD\u4E00\u6A23\uFF1F</h1>
    <p class="hero-lead">\u5B89\u5FC3\u641C\u5C0B\u523B\u610F\u4E0D\u505A\u500B\u4EBA\u5316\u3002\u6392\u5E8F\u7D50\u679C\u53EA\u53D6\u6C7A\u65BC\u300C\u4F60\u6253\u4E86\u4EC0\u9EBC\u5B57\u300D\u8207\u300C\u6587\u4EF6\u88E1\u6709\u4EC0\u9EBC\u5167\u5BB9\u300D\uFF0C\u8207\u4F60\u662F\u8AB0\u3001\u4F60\u7684\u504F\u597D\u3001\u4F60\u904E\u53BB\u641C\u5C0B\u904E\u4EC0\u9EBC\u90FD\u7121\u95DC\u3002</p>
  </section>

  <section class="panel">
    <h2>\u4F7F\u7528\u7684\u8CC7\u6599</h2>
    <div class="two-col">
      <div>
        <h3>\u6703\u5F71\u97FF\u6392\u5E8F</h3>
        <ul class="check-list">
          <li>\u67E5\u8A62\u5B57\u8A5E\u672C\u8EAB</li>
          <li>\u6587\u4EF6\u6A19\u984C\uFF08\u6B0A\u91CD 3\uFF09</li>
          <li>\u6587\u4EF6\u6A19\u7C64\u8207\u5206\u985E\uFF08\u6B0A\u91CD 2\uFF09</li>
          <li>\u6587\u4EF6\u5167\u5BB9\uFF08\u6B0A\u91CD 1\uFF09</li>
          <li>\u5168\u9AD4\u6587\u4EF6\u7684\u8A5E\u983B\u8207\u9006\u6587\u4EF6\u983B\u7387\uFF08IDF\uFF09</li>
          <li>\u540C\u5206\u6642\u7684\u6587\u4EF6\u7DE8\u865F\uFF08\u56FA\u5B9A\u7531\u5C0F\u5230\u5927\uFF09</li>
        </ul>
      </div>
      <div>
        <h3>\u4E0D\u6703\u5F71\u97FF\u6392\u5E8F</h3>
        <ul class="cross-list">
          <li>\u4F7F\u7528\u8005\u504F\u597D\u8A2D\u5B9A</li>
          <li>\u700F\u89BD\u7D00\u9304\u8207\u641C\u5C0B\u6B77\u53F2</li>
          <li>\u5730\u7406\u4F4D\u7F6E\u8207\u88DD\u7F6E</li>
          <li>\u6642\u9593\u3001\u71B1\u9580\u5EA6\u6216\u5EE3\u544A</li>
          <li>\u5E33\u865F\u3001\u8EAB\u5206\u6216\u500B\u4EBA\u6A94\u6848</li>
          <li>\u4EFB\u4F55\u5373\u6642\u56DE\u994B\u6216\u9EDE\u64CA\u884C\u70BA</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="panel">
    <h2>\u6F14\u7B97\u6CD5\u6B65\u9A5F</h2>
    <ol class="step-list">
      <li>\u5C07\u67E5\u8A62\u8207\u6587\u4EF6\u8F49\u70BA\u5C0F\u5BEB\u4E26\u6B63\u898F\u5316\u3002</li>
      <li>\u4E2D\u6587\u4EE5\u76F8\u9130\u4E8C\u5B57\u8A5E\uFF08bigram\uFF09\u5207\u5206\uFF0C\u82F1\u6587\u8207\u6578\u5B57\u4EE5\u55AE\u8A5E\u5207\u5206\u3002</li>
      <li>\u4F9D\u6A19\u984C\u3001\u6A19\u7C64\u3001\u5206\u985E\u3001\u5167\u5BB9\u7684\u56FA\u5B9A\u6B0A\u91CD\u8A08\u7B97\u8A5E\u983B TF\u3002</li>
      <li>\u4EE5 IDF = ln((N + 1) / (df + 1)) + 1 \u8A08\u7B97\u6BCF\u500B\u8A5E\u7684\u91CD\u8981\u6027\u3002</li>
      <li>\u5C07\u67E5\u8A62\u8207\u6587\u4EF6\u8868\u793A\u70BA TF-IDF \u5411\u91CF\uFF0C\u8A08\u7B97\u9918\u5F26\u76F8\u4F3C\u5EA6\u3002</li>
      <li>\u4F9D\u5206\u6578\u7531\u9AD8\u5230\u4F4E\u6392\u5E8F\uFF1B\u5206\u6578\u76F8\u540C\u6642\uFF0C\u4F9D\u6587\u4EF6\u7DE8\u865F\u7531\u5C0F\u5230\u5927\u6392\u5E8F\u3002</li>
    </ol>
    <pre class="formula">score(q, d) = (q \xB7 d) / (|q| \xD7 |d|)

q\uFF1A\u67E5\u8A62\u7684 TF-IDF \u5411\u91CF
d\uFF1A\u6587\u4EF6\u7684 TF-IDF \u5411\u91CF
|q|\u3001|d|\uFF1A\u5411\u91CF\u9577\u5EA6
\u540C\u5206\u6392\u5E8F\uFF1Adocument.id \u7531\u5C0F\u5230\u5927</pre>
  </section>

  <section class="panel">
    <h2>\u5982\u4F55\u9A57\u8B49\uFF1F</h2>
    <p>\u504F\u597D\u8A2D\u5B9A\u9801\u9762\u53EF\u4EE5\u5207\u63DB\u4E3B\u984C\u3001\u5BC6\u5EA6\u8207\u662F\u5426\u986F\u793A\u5206\u6578\uFF0C\u4F46\u9019\u4E9B\u8A2D\u5B9A\u53EA\u6539\u8B8A\u756B\u9762\u5916\u89C0\u3002\u4F60\u53EF\u4EE5\u7528\u5169\u500B\u4E0D\u540C\u7684\u700F\u89BD\u5668\u8A2D\u5B9A\u641C\u5C0B\u540C\u4E00\u500B\u95DC\u9375\u5B57\uFF0C\u7D50\u679C\u7684\u9806\u5E8F\u8207\u5206\u6578\u6703\u5B8C\u5168\u76F8\u540C\u3002\u7CFB\u7D71\u4E5F\u63D0\u4F9B <code>/api/search?q=\u95DC\u9375\u5B57</code>\uFF0C\u56DE\u61C9\u4E2D\u56FA\u5B9A\u6A19\u793A <code>personalization: false</code> \u8207 <code>preferencesUsed: false</code>\u3002</p>
    <p>\u9019\u500B\u8A2D\u8A08\u7684\u53D6\u6368\u662F\uFF1A\u7121\u6CD5\u91DD\u5C0D\u500B\u5225\u4F7F\u7528\u8005\u8ABF\u6574\u7D50\u679C\uFF0C\u4F46\u80FD\u5F97\u5230\u53EF\u9810\u6E2C\u3001\u53EF\u6BD4\u8F03\u3001\u53EF\u7A3D\u6838\u7684\u641C\u5C0B\u7D50\u679C\u3002</p>
  </section>

  <section class="panel">
    <h2>\u654F\u611F\u641C\u5C0B\u7684\u8655\u7406</h2>
    <p>\u7CFB\u7D71\u5728\u6392\u5E8F\u4E4B\u524D\u6703\u5148\u9032\u884C\u5B89\u5168\u5075\u6E2C\u3002\u82E5\u67E5\u8A62\u5305\u542B\u81EA\u6BBA\u3001\u81EA\u6211\u50B7\u5BB3\u3001\u50B7\u5BB3\u4ED6\u4EBA\u7B49\u95DC\u9375\u5B57\uFF0C\u6703\u5148\u986F\u793A\u6C42\u52A9\u8CC7\u6E90\uFF0C\u800C\u4E0D\u662F\u4E00\u822C\u7D50\u679C\u9801\u3002\u9019\u662F\u552F\u4E00\u6703\u6539\u8B8A\u300C\u770B\u5230\u4EC0\u9EBC\u300D\u7684\u898F\u5247\uFF0C\u800C\u4E14\u5B83\u5C0D\u6240\u6709\u4F7F\u7528\u8005\u4E00\u8996\u540C\u4EC1\uFF0C\u4E0D\u56E0\u500B\u4EBA\u504F\u597D\u800C\u4E0D\u540C\u3002</p>
    <p>\u5075\u6E2C\u63A1\u95DC\u9375\u5B57\u6BD4\u5C0D\uFF0C\u6703\u5148\u9032\u884C NFKC \u6B63\u898F\u5316\u3001\u53BB\u9664\u7A7A\u767D\u8207\u6A19\u9EDE\uFF0C\u4EE5\u964D\u4F4E\u300C\u81EA \u6BBA\u300D\u9019\u985E\u898F\u907F\u5BEB\u6CD5\u7684\u6F0F\u5224\uFF1B\u540C\u6642\u52A0\u5165\u5C11\u91CF\u6392\u9664\u8A5E\uFF0C\u964D\u4F4E\u300C\u60F3\u6B7B\u4F60\u4E86\u300D\u3001\u300C\u81EA\u6BBA\u7A81\u64CA\u968A\u300D\u7B49\u8AA4\u5224\u3002\u95DC\u9375\u5B57\u6CD5\u4ECD\u6709\u5176\u9650\u5236\uFF0C\u7121\u6CD5\u5B8C\u5168\u53D6\u4EE3\u5C08\u696D\u5224\u65B7\u3002</p>
  </section>

  <section class="panel">
    <h2>\u96B1\u79C1</h2>
    <p>\u672C\u7CFB\u7D71\u4E0D\u5EFA\u7ACB\u4F7F\u7528\u8005\u5E33\u865F\u3001\u4E0D\u8A18\u9304\u641C\u5C0B\u7D00\u9304\u3001\u4E0D\u5BEB\u5165\u67E5\u8A62\u65E5\u8A8C\u3002\u504F\u597D\u8A2D\u5B9A\u53EA\u5132\u5B58\u5728\u700F\u89BD\u5668 Cookie \u4E2D\uFF0C\u7528\u65BC\u5916\u89C0\u5448\u73FE\u3002\u4F3A\u670D\u5668\u4E0D\u6703\u5C07\u67E5\u8A62\u5167\u5BB9\u6301\u4E45\u5316\u3002</p>
  </section>
  `;
  return layout({ title: "\u6F14\u7B97\u6CD5\u8AAA\u660E", preferences, active: "/about", content });
}
__name(renderAbout, "renderAbout");
function renderHelp({ preferences = DEFAULT_PREFERENCES }) {
  const content = `
  <section class="page-header">
    <p class="eyebrow">\u6C42\u52A9\u8CC7\u6E90</p>
    <h1>\u4F60\u503C\u5F97\u88AB\u597D\u597D\u63A5\u4F4F\u3002</h1>
    <p class="hero-lead">\u7121\u8AD6\u662F\u60C5\u7DD2\u3001\u8EAB\u9AD4\u6216\u4EBA\u8EAB\u5B89\u5168\uFF0C\u5C0B\u6C42\u5E6B\u52A9\u90FD\u4E0D\u662F\u8EDF\u5F31\u3002\u4EE5\u4E0B\u8CC7\u6E90\u53EF\u4EE5\u7ACB\u5373\u4F7F\u7528\uFF1B\u5982\u679C\u4F60\u6216\u8EAB\u908A\u7684\u4EBA\u6709\u7ACB\u5373\u5371\u96AA\uFF0C\u8ACB\u5148\u64A5\u6253 119 \u6216 110\u3002</p>
  </section>

  <section class="panel">
    <h2>24 \u5C0F\u6642\u8207\u4E3B\u8981\u5C08\u7DDA</h2>
    ${hotlineCards()}
    <p class="emergency-note">${esc(EMERGENCY_NOTE)}</p>
  </section>

  <section class="panel">
    <h2>\u5982\u679C\u4F60\u6B63\u6709\u50B7\u5BB3\u81EA\u5DF1\u7684\u5FF5\u982D</h2>
    ${stepList(CARE_STEPS)}
  </section>

  <section class="panel">
    <h2>\u5982\u679C\u4F60\u6B63\u88AB\u60C5\u7DD2\u6DF9\u6C92</h2>
    ${stepList(DISTRESS_STEPS)}
  </section>

  <section class="panel">
    <h2>\u5982\u679C\u8EAB\u9AD4\u51FA\u73FE\u6301\u7E8C\u4E0D\u9069</h2>
    ${stepList(PHYSICAL_STEPS)}
  </section>

  <section class="panel">
    <h2>\u5982\u4F55\u966A\u4F34\u8EAB\u908A\u7684\u4EBA</h2>
    <ul class="check-list">
      <li>\u5148\u50BE\u807D\uFF0C\u4E0D\u6025\u8457\u7D66\u5EFA\u8B70\uFF0C\u4E5F\u4E0D\u6025\u8457\u8A55\u50F9\u5C0D\u65B9\u7684\u611F\u53D7\u3002</li>
      <li>\u76F4\u63A5\u800C\u6EAB\u548C\u5730\u8A62\u554F\uFF1A\u300C\u4F60\u6700\u8FD1\u9084\u597D\u55CE\uFF1F\u6709\u6C92\u6709\u60F3\u904E\u50B7\u5BB3\u81EA\u5DF1\uFF1F\u300D</li>
      <li>\u4E0D\u8981\u627F\u8AFE\u4FDD\u5BC6\u5230\u5371\u53CA\u5B89\u5168\u7684\u7A0B\u5EA6\uFF1B\u5FC5\u8981\u6642\u966A\u540C\u5C0D\u65B9\u5C0B\u6C42\u5C08\u696D\u5354\u52A9\u3002</li>
      <li>\u5982\u679C\u5C0D\u65B9\u6709\u7ACB\u5373\u5371\u96AA\uFF0C\u7559\u5728\u8EAB\u908A\u4E26\u64A5\u6253 119 \u6216 110\u3002</li>
      <li>\u966A\u4F34\u8005\u4E5F\u9700\u8981\u652F\u6301\uFF0C\u53EF\u4EE5\u4E00\u8D77\u4F7F\u7528\u5C08\u7DDA\u6216\u5C0B\u6C42\u8AEE\u5546\u3002</li>
    </ul>
  </section>

  <section class="panel">
    <h2>\u4EC0\u9EBC\u6642\u5019\u8A72\u5C31\u91AB\u6216\u5C0B\u6C42\u5C08\u696D\u5354\u52A9\uFF1F</h2>
    <ul class="check-list">
      <li>\u60C5\u7DD2\u4F4E\u843D\u3001\u7126\u616E\u6216\u5931\u7720\u6301\u7E8C\u6578\u9031\uFF0C\u4E26\u5F71\u97FF\u65E5\u5E38\u751F\u6D3B\u3002</li>
      <li>\u51FA\u73FE\u50B7\u5BB3\u81EA\u5DF1\u6216\u4ED6\u4EBA\u7684\u5FF5\u982D\u3001\u8A08\u756B\u6216\u884C\u70BA\u3002</li>
      <li>\u8EAB\u9AD4\u4E0D\u9069\u6301\u7E8C\u60E1\u5316\uFF0C\u6216\u51FA\u73FE\u610F\u8B58\u4E0D\u6E05\u3001\u5287\u70C8\u75BC\u75DB\u7B49\u8B66\u8A0A\u3002</li>
      <li>\u8EAB\u908A\u7684\u4EBA\u8868\u9054\u7D55\u671B\u3001\u544A\u5225\u6216\u4EA4\u4EE3\u5F8C\u4E8B\u7B49\u8A0A\u606F\u3002</li>
    </ul>
  </section>
  `;
  return layout({ title: "\u6C42\u52A9\u8CC7\u6E90", preferences, active: "/help", content });
}
__name(renderHelp, "renderHelp");
function radioGroup({ name, label, options, value }) {
  return `<fieldset class="field-group">
    <legend>${esc(label)}</legend>
    <div class="radio-row">
      ${options.map(
    (option) => `<label class="radio-card">
        <input type="radio" name="${esc(name)}" value="${esc(option.value)}" ${option.value === value ? "checked" : ""}>
        <span>
          <strong>${esc(option.label)}</strong>
          <small>${esc(option.hint)}</small>
        </span>
      </label>`
  ).join("")}
    </div>
  </fieldset>`;
}
__name(radioGroup, "radioGroup");
function renderPreferences({
  preferences = DEFAULT_PREFERENCES,
  ok = "",
  err = ""
}) {
  const content = `
  <section class="page-header">
    <p class="eyebrow">\u504F\u597D\u8A2D\u5B9A</p>
    <h1>\u9019\u88E1\u7684\u8A2D\u5B9A\u53EA\u6539\u8B8A\u5916\u89C0\u3002</h1>
    <p class="hero-lead">\u5B89\u5FC3\u641C\u5C0B\u4E0D\u63D0\u4F9B\u500B\u4EBA\u5316\u6392\u5E8F\u3002\u4EE5\u4E0B\u504F\u597D\u4E0D\u6703\u5F71\u97FF\u641C\u5C0B\u7D50\u679C\u7684\u9806\u5E8F\u3001\u7BE9\u9078\u6216\u5371\u6A5F\u5075\u6E2C\uFF1B\u5B83\u5011\u53EA\u6703\u6539\u8B8A\u4E3B\u984C\u3001\u5BC6\u5EA6\u8207\u662F\u5426\u986F\u793A\u5206\u6578\u3002</p>
  </section>

  <form class="panel form" method="post" action="/preferences">
    ${radioGroup({
    name: "theme",
    label: "\u4E3B\u984C",
    value: preferences.theme,
    options: THEMES.map((theme) => ({
      value: theme,
      label: theme === "dark" ? "\u6DF1\u8272" : "\u6DFA\u8272",
      hint: theme === "dark" ? "\u964D\u4F4E\u591C\u9593\u87A2\u5E55\u4EAE\u5EA6" : "\u9810\u8A2D\u7684\u660E\u4EAE\u4ECB\u9762"
    }))
  })}
    ${radioGroup({
    name: "density",
    label: "\u7D50\u679C\u5BC6\u5EA6",
    value: preferences.density,
    options: DENSITIES.map((density) => ({
      value: density,
      label: density === "compact" ? "\u7DCA\u6E4A" : "\u5BEC\u9B06",
      hint: density === "compact" ? "\u7E2E\u5C0F\u9593\u8DDD\uFF0C\u4E00\u9801\u770B\u5230\u66F4\u591A" : "\u8F03\u5927\u7684\u9593\u8DDD\uFF0C\u95B1\u8B80\u8F03\u8F15\u9B06"
    }))
  })}
    <label class="check-row">
      <input type="checkbox" name="showScores" value="1" ${preferences.showScores ? "checked" : ""}>
      <span>\u5728\u641C\u5C0B\u7D50\u679C\u986F\u793A\u76F8\u4F3C\u5EA6\u5206\u6578</span>
    </label>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit">\u5132\u5B58\u504F\u597D</button>
      <a class="btn btn-ghost" href="/">\u56DE\u5230\u9996\u9801</a>
    </div>
  </form>

  <section class="panel">
    <h2>\u76EE\u524D\u8A2D\u5B9A</h2>
    <ul class="check-list">
      <li>\u4E3B\u984C\uFF1A${esc(preferences.theme === "dark" ? "\u6DF1\u8272" : "\u6DFA\u8272")}</li>
      <li>\u5BC6\u5EA6\uFF1A${esc(preferences.density === "compact" ? "\u7DCA\u6E4A" : "\u5BEC\u9B06")}</li>
      <li>\u986F\u793A\u5206\u6578\uFF1A${preferences.showScores ? "\u662F" : "\u5426"}</li>
    </ul>
    <p class="muted">\u504F\u597D\u5132\u5B58\u5728\u700F\u89BD\u5668 Cookie \u4E2D\uFF0C\u4E0D\u6703\u4E0A\u50B3\u5230\u4F3A\u670D\u5668\u8CC7\u6599\u5EAB\uFF0C\u4E5F\u4E0D\u6703\u53C3\u8207\u641C\u5C0B\u6392\u5E8F\u3002</p>
  </section>

  <section class="panel">
    <h2>\u60F3\u78BA\u8A8D\u6392\u5E8F\u771F\u7684\u6C92\u8B8A\uFF1F</h2>
    <p>\u5207\u63DB\u504F\u597D\u5F8C\uFF0C\u7528\u540C\u4E00\u500B\u95DC\u9375\u5B57\u641C\u5C0B\uFF0C\u6216\u76F4\u63A5\u958B\u555F <code>/api/search?q=\u5065\u5EB7</code>\u3002\u7D50\u679C\u7684\u9806\u5E8F\u8207\u5206\u6578\u4E0D\u6703\u56E0\u70BA\u504F\u597D\u800C\u6539\u8B8A\u3002</p>
    <div class="crisis-actions">
      <a class="btn btn-ghost" href="/search?q=\u5065\u5EB7">\u641C\u5C0B\u300C\u5065\u5EB7\u300D</a>
      <a class="btn btn-ghost" href="/api/search?q=\u5065\u5EB7">\u67E5\u770B JSON</a>
    </div>
  </section>
  `;
  return layout({
    title: "\u504F\u597D\u8A2D\u5B9A",
    preferences,
    active: "/preferences",
    content,
    ok,
    err
  });
}
__name(renderPreferences, "renderPreferences");

// src/routes/pages.js
function registerPageRoutes(router) {
  router.get("/about", (ctx) => {
    sendHtml(ctx.res, renderAbout({ preferences: ctx.preferences }));
  });
  router.get("/help", (ctx) => {
    sendHtml(ctx.res, renderHelp({ preferences: ctx.preferences }));
  });
  router.get("/preferences", (ctx) => {
    sendHtml(
      ctx.res,
      renderPreferences({
        preferences: ctx.preferences,
        ok: ctx.ok === "1" ? "\u504F\u597D\u5DF2\u5132\u5B58\u3002\u9019\u4E9B\u8A2D\u5B9A\u53EA\u6703\u6539\u8B8A\u5916\u89C0\uFF0C\u4E0D\u5F71\u97FF\u641C\u5C0B\u6392\u5E8F\u3002" : ctx.ok,
        err: ctx.err
      })
    );
  });
  router.post("/preferences", (ctx) => {
    const preferences = sanitizePreferences({
      theme: ctx.body.get("theme"),
      density: ctx.body.get("density"),
      showScores: ctx.body.get("showScores") === "1"
    });
    setCookie(ctx.res, "prefs", serializePreferences(preferences), {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "Lax"
    });
    redirect(ctx.res, "/preferences?ok=1");
  });
}
__name(registerPageRoutes, "registerPageRoutes");

// src/safety/keywords.js
var CATEGORY_META = {
  suicide: { label: "\u81EA\u6BBA\u6216\u7D50\u675F\u751F\u547D\u7684\u5FF5\u982D", severity: "critical" },
  self_harm: { label: "\u81EA\u6211\u50B7\u5BB3", severity: "critical" },
  harm_others: { label: "\u50B7\u5BB3\u4ED6\u4EBA", severity: "critical" },
  severe_distress: { label: "\u56B4\u91CD\u60C5\u7DD2\u56F0\u64FE", severity: "concern" },
  physical: { label: "\u8EAB\u9AD4\u5065\u5EB7\u56F0\u64FE", severity: "concern" }
};
var EXCLUSIONS = [
  "\u60F3\u6B7B\u4F60",
  "\u60F3\u6B7B\u59B3",
  "\u60F3\u6B7B\u60A8",
  "\u60F3\u6B7B\u6211",
  "\u4E0D\u60F3\u6D3B\u52D5",
  "\u4E0D\u60F3\u6D3B\u52A8",
  "\u81EA\u6BBA\u5F0F",
  "\u81EA\u6740\u5F0F",
  "\u81EA\u6BBA\u70B8\u5F48",
  "\u81EA\u6740\u70B8\u5F39",
  "\u81EA\u6BBA\u7A81\u64CA\u968A",
  "\u81EA\u6740\u7A81\u51FB\u961F",
  "\u50B7\u5BB3\u81EA\u5DF1\u4EBA",
  "\u4F24\u5BB3\u81EA\u5DF1\u4EBA",
  "\u7D55\u98DF\u6297\u8B70",
  "\u7EDD\u98DF\u6297\u8BAE",
  "\u6182\u9B31\u7684\u71B1\u5E36",
  "\u5FE7\u90C1\u7684\u70ED\u5E26"
];
var KEYWORD_GROUPS = [
  {
    category: "suicide",
    keywords: [
      "\u81EA\u6BBA",
      "\u81EA\u6740",
      "\u81EA\u76E1",
      "\u81EA\u5C3D",
      "\u8F15\u751F",
      "\u8F7B\u751F",
      "\u60F3\u6B7B",
      "\u4E0D\u60F3\u6D3B",
      "\u6D3B\u4E0D\u4E0B\u53BB",
      "\u7D50\u675F\u751F\u547D",
      "\u7ED3\u675F\u751F\u547D",
      "\u7D50\u675F\u81EA\u5DF1",
      "\u7ED3\u675F\u81EA\u5DF1",
      "\u4E00\u4E86\u767E\u4E86",
      "\u81EA\u6211\u4E86\u65B7",
      "\u81EA\u6211\u4E86\u65AD",
      "\u6D3B\u8457\u6C92\u610F\u7FA9",
      "\u6D3B\u7740\u6CA1\u610F\u4E49",
      "\u6D3B\u8457\u6C92\u610F\u601D",
      "\u6D3B\u7740\u6CA1\u610F\u601D",
      "\u6B7B\u4E86\u7B97\u4E86",
      "\u4E0D\u5982\u6B7B",
      "\u60F3\u7D50\u675F\u4E00\u5207",
      "\u60F3\u7ED3\u675F\u4E00\u5207",
      "suicide",
      "suicidal",
      "kill myself",
      "kill my self",
      "end my life",
      "want to die",
      "wanna die",
      "better off dead",
      "take my own life",
      "don't want to live",
      "dont want to live",
      "no reason to live"
    ]
  },
  {
    category: "self_harm",
    keywords: [
      "\u81EA\u6B98",
      "\u81EA\u6B8B",
      "\u81EA\u50B7",
      "\u81EA\u4F24",
      "\u5272\u8155",
      "\u5272\u624B",
      "\u50B7\u5BB3\u81EA\u5DF1",
      "\u4F24\u5BB3\u81EA\u5DF1",
      "\u50B7\u5BB3\u8EAB\u9AD4",
      "\u4F24\u5BB3\u8EAB\u4F53",
      "\u81EA\u6211\u50B7\u5BB3",
      "\u81EA\u6211\u4F24\u5BB3",
      "\u60F3\u50B7\u5BB3\u81EA\u5DF1",
      "\u60F3\u4F24\u5BB3\u81EA\u5DF1",
      "self harm",
      "self-harm",
      "self-harming",
      "self harming",
      "self harmed",
      "selfharm",
      "cutting myself",
      "cut myself",
      "hurt myself",
      "harming myself"
    ]
  },
  {
    category: "harm_others",
    keywords: [
      "\u60F3\u6BBA\u4EBA",
      "\u60F3\u6740\u4EBA",
      "\u6BBA\u4E86\u4ED6",
      "\u6740\u4E86\u4ED6",
      "\u50B7\u5BB3\u5225\u4EBA",
      "\u4F24\u5BB3\u522B\u4EBA",
      "\u5831\u5FA9\u793E\u6703",
      "\u62A5\u590D\u793E\u4F1A",
      "\u60F3\u6BBA\u6B7B",
      "\u60F3\u6740\u6B7B",
      "kill them",
      "kill someone",
      "hurt someone",
      "hurt people"
    ]
  },
  {
    category: "severe_distress",
    keywords: [
      "\u6182\u9B31",
      "\u5FE7\u90C1",
      "\u6291\u9B31",
      "\u6291\u90C1",
      "\u60C5\u7DD2\u5D29\u6F70",
      "\u60C5\u7EEA\u5D29\u6E83",
      "\u7CBE\u795E\u5D29\u6F70",
      "\u7CBE\u795E\u5D29\u6E83",
      "\u5FEB\u5D29\u6F70",
      "\u5FEB\u5D29\u6E83",
      "\u6490\u4E0D\u4E0B\u53BB",
      "\u6491\u4E0D\u4E0B\u53BB",
      "\u7D55\u671B",
      "\u7EDD\u671B",
      "\u6C92\u5E0C\u671B",
      "\u6CA1\u5E0C\u671B",
      "\u6C92\u4EBA\u611B\u6211",
      "\u6CA1\u4EBA\u7231\u6211",
      "\u6211\u662F\u5EE2\u7269",
      "\u6211\u662F\u5E9F\u7269",
      "\u7126\u616E",
      "\u7126\u8651",
      "\u6050\u614C\u767C\u4F5C",
      "\u6050\u614C\u53D1\u4F5C",
      "\u6050\u614C\u75C7",
      "\u60F3\u6D88\u5931",
      "\u597D\u75DB\u82E6",
      "\u6D3B\u5F97\u597D\u7D2F",
      "\u4E0D\u60F3\u8D77\u5E8A",
      "depressed",
      "depression",
      "hopeless",
      "worthless",
      "panic attack",
      "can't go on",
      "cant go on",
      "emotional pain"
    ]
  },
  {
    category: "physical",
    keywords: [
      "\u4E0D\u5403\u4E0D\u559D",
      "\u4E0D\u60F3\u5403\u6771\u897F",
      "\u4E0D\u60F3\u5403\u4E1C\u897F",
      "\u7D55\u98DF",
      "\u7EDD\u98DF",
      "\u50AC\u5410",
      "\u66B4\u98DF",
      "\u53AD\u98DF",
      "\u538C\u98DF",
      "\u5931\u7720",
      "\u7761\u4E0D\u8457",
      "\u7761\u4E0D\u7740",
      "\u81EA\u66B4\u81EA\u68C4",
      "\u81EA\u66B4\u81EA\u5F03",
      "\u4E0D\u60F3\u7761",
      "not eating",
      "can't sleep",
      "cant sleep",
      "starving myself",
      "binge eating",
      "purging"
    ]
  }
];

// src/safety/detect.js
function normalizeForMatch(input) {
  const normalized = String(input ?? "").normalize("NFKC").toLowerCase();
  return {
    spaced: normalized.replace(/\s+/g, " ").trim(),
    compact: normalized.replace(/[^\p{L}\p{N}]+/gu, "")
  };
}
__name(normalizeForMatch, "normalizeForMatch");
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
__name(escapeRegExp, "escapeRegExp");
function isLatinKeyword(keyword) {
  return /^[a-z0-9][a-z0-9' -]*$/.test(keyword);
}
__name(isLatinKeyword, "isLatinKeyword");
function stripExclusions(compact) {
  let result = compact;
  for (const phrase of EXCLUSIONS) {
    result = result.split(phrase).join(" ");
  }
  return result;
}
__name(stripExclusions, "stripExclusions");
function matchesKeyword(keyword, spaced, compact) {
  if (isLatinKeyword(keyword)) {
    const parts = keyword.trim().split(/\s+/).map(escapeRegExp);
    const pattern = new RegExp(`(^|[^a-z0-9])${parts.join("\\s+")}([^a-z0-9]|$)`);
    return pattern.test(spaced);
  }
  return compact.includes(keyword.replace(/\s+/g, ""));
}
__name(matchesKeyword, "matchesKeyword");
function detectSafety(input) {
  const { spaced, compact } = normalizeForMatch(input);
  const searchableCompact = stripExclusions(compact);
  const matches = [];
  const categories = /* @__PURE__ */ new Map();
  for (const group3 of KEYWORD_GROUPS) {
    for (const keyword of group3.keywords) {
      if (!matchesKeyword(keyword, spaced, searchableCompact)) continue;
      matches.push({ category: group3.category, keyword });
      if (!categories.has(group3.category)) {
        categories.set(group3.category, CATEGORY_META[group3.category]);
      }
    }
  }
  let severity = "none";
  if (matches.length > 0) {
    severity = "concern";
    for (const category of categories.keys()) {
      if (CATEGORY_META[category].severity === "critical") {
        severity = "critical";
        break;
      }
    }
  }
  return {
    flagged: matches.length > 0,
    severity,
    categories: [...categories.entries()].map(([id, meta]) => ({
      id,
      label: meta.label,
      severity: meta.severity
    })),
    matches
  };
}
__name(detectSafety, "detectSafety");

// src/search/tokenize.js
var CJK_RUN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g;
var LATIN_WORD = /[a-z0-9]+/g;
function normalizeText(input) {
  return String(input ?? "").normalize("NFKC").toLowerCase();
}
__name(normalizeText, "normalizeText");
function tokenize(input) {
  const text = normalizeText(input);
  const tokens = [];
  for (const match of text.matchAll(LATIN_WORD)) {
    tokens.push(match[0]);
  }
  for (const run of text.match(CJK_RUN) ?? []) {
    const chars = [...run];
    if (chars.length === 1) {
      tokens.push(chars[0]);
      continue;
    }
    for (let i = 0; i < chars.length - 1; i++) {
      tokens.push(chars[i] + chars[i + 1]);
    }
  }
  return tokens;
}
__name(tokenize, "tokenize");

// src/search/rank.js
function rankDocuments(query, index) {
  const terms = [...new Set(tokenize(query))].filter((term) => index.idf.has(term));
  if (terms.length === 0) return [];
  const queryVector = /* @__PURE__ */ new Map();
  let querySumSquares = 0;
  for (const term of terms) {
    const weight = index.idf.get(term);
    queryVector.set(term, weight);
    querySumSquares += weight * weight;
  }
  const queryNorm = Math.sqrt(querySumSquares) || 1;
  const results = [];
  for (const entry of index.entries) {
    let dotProduct = 0;
    const matchedTerms = [];
    for (const term of terms) {
      const documentWeight = entry.vector.get(term);
      if (!documentWeight) continue;
      dotProduct += documentWeight * queryVector.get(term);
      matchedTerms.push(term);
    }
    if (dotProduct <= 0) continue;
    results.push({
      document: entry.document,
      score: dotProduct / (entry.norm * queryNorm),
      matchedTerms
    });
  }
  results.sort(
    (left, right) => right.score - left.score || left.document.id.localeCompare(right.document.id)
  );
  return results;
}
__name(rankDocuments, "rankDocuments");

// src/views/home.js
var EXAMPLES = ["\u8CC7\u6599\u5EAB", "\u7761\u7720\u54C1\u8CEA", "\u58D3\u529B\u8ABF\u9069", "\u7DB2\u8DEF\u5B89\u5168", "\u6642\u9593\u7BA1\u7406"];
function renderHome({ documents, preferences = DEFAULT_PREFERENCES }) {
  const categories = [...new Set(documents.map((document) => document.category))];
  const content = `
  <section class="hero">
    <p class="eyebrow">\u516C\u5E73\u3001\u900F\u660E\u3001\u4EE5\u4EBA\u70BA\u672C</p>
    <h1>\u540C\u6A23\u7684\u67E5\u8A62\uFF0C<br>\u6BCF\u500B\u4EBA\u770B\u5230\u540C\u6A23\u7684\u7D50\u679C\u3002</h1>
    <p class="hero-lead">\u5B89\u5FC3\u641C\u5C0B\u4E0D\u4F7F\u7528\u4F60\u7684\u504F\u597D\u3001\u700F\u89BD\u7D00\u9304\u3001\u4F4D\u7F6E\u6216\u88DD\u7F6E\u4F86\u8ABF\u6574\u6392\u5E8F\u3002\u7576\u641C\u5C0B\u5167\u5BB9\u53EF\u80FD\u8207\u81EA\u6211\u50B7\u5BB3\u6216\u56B4\u91CD\u60C5\u7DD2\u56F0\u64FE\u6709\u95DC\u6642\uFF0C\u7CFB\u7D71\u6703\u5148\u505C\u4E0B\u4F86\uFF0C\u63D0\u4F9B\u7ACB\u5373\u7684\u95DC\u5FC3\u8207\u6C42\u52A9\u8CC7\u6E90\u3002</p>
    ${searchForm({ large: true })}
    <div class="example-row">
      <span>\u8A66\u8A66\u770B\uFF1A</span>
      ${EXAMPLES.map(
    (query) => `<a class="chip" href="/search?q=${encodeURIComponent(query)}">${esc(query)}</a>`
  ).join("")}
    </div>
  </section>

  <section class="feature-grid">
    <article class="feature-card">
      <span class="feature-icon">01</span>
      <h2>\u4E0D\u53D7\u504F\u597D\u5F71\u97FF\u7684\u6392\u5E8F</h2>
      <p>\u6392\u5E8F\u53EA\u6839\u64DA\u67E5\u8A62\u5B57\u8A5E\u8207\u6587\u4EF6\u5167\u5BB9\u7684 TF-IDF \u9918\u5F26\u76F8\u4F3C\u5EA6\uFF0C\u540C\u5206\u6642\u4F9D\u6587\u4EF6\u7DE8\u865F\u6392\u5E8F\u3002\u504F\u597D\u8A2D\u5B9A\u53EA\u5F71\u97FF\u5916\u89C0\u3002</p>
      <a href="/about">\u4E86\u89E3\u6F14\u7B97\u6CD5</a>
    </article>
    <article class="feature-card">
      <span class="feature-icon">02</span>
      <h2>\u654F\u611F\u641C\u5C0B\u7684\u5373\u6642\u95DC\u61F7</h2>
      <p>\u5075\u6E2C\u5230\u81EA\u6BBA\u3001\u81EA\u6211\u50B7\u5BB3\u3001\u56B4\u91CD\u60C5\u7DD2\u56F0\u64FE\u7B49\u95DC\u9375\u5B57\u6642\uFF0C\u5148\u986F\u793A\u6C42\u52A9\u8CC7\u6E90\uFF0C\u800C\u4E0D\u662F\u4E00\u822C\u641C\u5C0B\u7D50\u679C\u3002</p>
      <a href="/help">\u67E5\u770B\u6C42\u52A9\u8CC7\u6E90</a>
    </article>
    <article class="feature-card">
      <span class="feature-icon">03</span>
      <h2>\u53EF\u9A57\u8B49\u7684\u900F\u660E\u898F\u5247</h2>
      <p>\u6BCF\u4E00\u7B46\u7D50\u679C\u90FD\u986F\u793A\u5206\u6578\u8207\u547D\u4E2D\u8A5E\uFF0C\u4E26\u516C\u958B\u8AAA\u660E\u4F7F\u7528\u4E86\u54EA\u4E9B\u8CC7\u6599\u3001\u6C92\u6709\u4F7F\u7528\u54EA\u4E9B\u8CC7\u6599\u3002</p>
      <a href="/about">\u95B1\u8B80\u8A2D\u8A08\u8AAA\u660E</a>
    </article>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>\u76EE\u524D\u7D22\u5F15</h2>
      <span class="muted">\u5171 ${documents.length} \u7BC7\u6587\u4EF6</span>
    </div>
    ${statRow([
    { value: documents.length, label: "\u6587\u4EF6" },
    { value: categories.length, label: "\u5206\u985E" },
    { value: 0, label: "\u500B\u4EBA\u5316\u8A0A\u865F" }
  ])}
    <div class="category-row">${categories.map((category) => `<span class="chip chip-static">${esc(category)}</span>`).join("")}</div>
  </section>

  <section class="panel care-panel">
    <h2>\u9700\u8981\u5E6B\u5FD9\u6642\uFF0C\u4E0D\u5FC5\u7B49\u5230\u6E96\u5099\u597D</h2>
    <p>\u5982\u679C\u4F60\u73FE\u5728\u6B63\u7D93\u6B77\u96E3\u4EE5\u627F\u53D7\u7684\u60C5\u7DD2\uFF0C\u6216\u8EAB\u908A\u7684\u4EBA\u6709\u7ACB\u5373\u5371\u96AA\uFF0C\u8ACB\u5148\u806F\u7D61\u5C08\u696D\u8CC7\u6E90\u3002</p>
    ${hotlineCards({ limit: 4 })}
    <p class="emergency-note">${esc(EMERGENCY_NOTE)}</p>
  </section>
  `;
  return layout({ title: "\u9996\u9801", preferences, active: "/", content });
}
__name(renderHome, "renderHome");

// src/views/results.js
function resultCard(item, showScores) {
  const document = item.document;
  const snippet = document.content.length > 180 ? `${document.content.slice(0, 180)}\u2026` : document.content;
  return `<article class="result">
    <div class="result-head">
      <h2>${esc(document.title)}</h2>
      <span class="chip chip-static">${esc(document.category)}</span>
    </div>
    <p class="result-snippet">${esc(snippet)}</p>
    <div class="result-meta">
      ${document.tags.map((tag) => `<span class="tag">#${esc(tag)}</span>`).join("")}
      ${showScores ? `<span class="score">\u76F8\u4F3C\u5EA6 ${esc(item.score.toFixed(4))}</span>` : ""}
    </div>
    <details class="why">
      <summary>\u70BA\u4EC0\u9EBC\u6703\u770B\u5230\u9019\u5247\u7D50\u679C\uFF1F</summary>
      <p>\u547D\u4E2D\u8A5E\uFF1A${item.matchedTerms.map((term) => `<code>${esc(term)}</code>`).join("\u3001") || "\u2014"}</p>
      <p>\u5206\u6578\uFF1A${esc(item.score.toFixed(6))}\uFF08TF-IDF \u9918\u5F26\u76F8\u4F3C\u5EA6\uFF0C\u672A\u4F7F\u7528\u4EFB\u4F55\u500B\u4EBA\u504F\u597D\uFF09</p>
    </details>
  </article>`;
}
__name(resultCard, "resultCard");
function renderResults({
  query,
  safety,
  results,
  preferences = DEFAULT_PREFERENCES,
  acknowledged = false
}) {
  const showScores = preferences.showScores !== false;
  const content = `
  <div class="results-top">
    ${searchForm({ query })}
    <p class="result-count">\u300C${esc(query)}\u300D\u5171\u6709 ${results.length} \u7B46\u7D50\u679C \xB7 \u6392\u5E8F\u50C5\u4F7F\u7528\u67E5\u8A62\u8207\u6587\u4EF6\u5167\u5BB9</p>
  </div>

  ${safety.flagged ? careBanner({ severity: safety.severity, acknowledged, categories: safety.categories }) : ""}

  <div class="preference-note">
    <strong>\u6392\u5E8F\u4E0D\u53D7\u504F\u597D\u5F71\u97FF\u3002</strong>
    <span>\u76EE\u524D\u504F\u597D\uFF1A\u4E3B\u984C ${esc(preferences.theme === "dark" ? "\u6DF1\u8272" : "\u6DFA\u8272")}\u3001\u5BC6\u5EA6 ${esc(
    preferences.density === "compact" ? "\u7DCA\u6E4A" : "\u5BEC\u9B06"
  )}\u3002\u9019\u4E9B\u8A2D\u5B9A\u53EA\u5F71\u97FF\u5916\u89C0\u3002</span>
    <a href="/preferences">\u8ABF\u6574\u504F\u597D</a>
  </div>

  <section class="result-list">
    ${results.length === 0 ? `<div class="empty-state"><h2>\u627E\u4E0D\u5230\u7B26\u5408\u7684\u7D50\u679C</h2><p>\u8A66\u8A66\u66F4\u77ED\u7684\u95DC\u9375\u5B57\uFF0C\u6216\u66F4\u63DB\u540C\u7FA9\u8A5E\u3002</p></div>` : results.map((item) => resultCard(item, showScores)).join("")}
  </section>
  `;
  return layout({ title: `\u641C\u5C0B\uFF1A${query}`, preferences, active: "/search", content });
}
__name(renderResults, "renderResults");

// src/views/safety.js
function renderSafety({
  query,
  safety,
  preferences = DEFAULT_PREFERENCES,
  acknowledged = false
}) {
  const labels = safety.categories.map((category) => category.label).join("\u3001");
  const content = `
  <section class="crisis">
    <div class="crisis-main">
      <p class="eyebrow">\u6211\u5011\u5728\u4E4E\u4F60</p>
      <h1>\u4F60\u4E0D\u9700\u8981\u4E00\u500B\u4EBA\u9762\u5C0D\u3002</h1>
      <p class="crisis-lead">\u4F60\u525B\u525B\u7684\u641C\u5C0B${labels ? `\u8207\u300C${esc(labels)}\u300D\u6709\u95DC` : "\u8B93\u6211\u5011\u60F3\u5148\u505C\u4E0B\u4F86\u95DC\u5FC3\u4F60"}\u3002\u7121\u8AD6\u4F60\u73FE\u5728\u7D93\u6B77\u4EC0\u9EBC\uFF0C\u4F60\u7684\u611F\u53D7\u90FD\u503C\u5F97\u88AB\u91CD\u8996\u3002</p>
      <p>\u5982\u679C\u6B64\u523B\u4F60\u6709\u50B7\u5BB3\u81EA\u5DF1\u7684\u5FF5\u982D\uFF0C\u8ACB\u5148\u8B93\u81EA\u5DF1\u96E2\u958B\u53EF\u80FD\u9020\u6210\u50B7\u5BB3\u7684\u7269\u54C1\u6216\u5834\u6240\uFF0C\u4E26\u806F\u7D61\u4E00\u4F4D\u4F60\u4FE1\u4EFB\u7684\u4EBA\u3002\u4F60\u4E5F\u53EF\u4EE5\u76F4\u63A5\u64A5\u6253\u4E0B\u9762\u7684\u5C08\u7DDA\uFF0C\u6703\u6709\u4EBA\u9858\u610F\u807D\u4F60\u8AAA\u3002</p>
      <div class="crisis-actions">
        <a class="btn btn-primary btn-lg" href="tel:1925">\u64A5\u6253 1925 \u5B89\u5FC3\u5C08\u7DDA</a>
        <a class="btn btn-ghost btn-lg" href="tel:1995">\u64A5\u6253 1995 \u751F\u547D\u7DDA</a>
      </div>
      <p class="emergency-note">${esc(EMERGENCY_NOTE)}</p>
    </div>
    <aside class="crisis-steps">
      <h2>\u73FE\u5728\u53EF\u4EE5\u505A\u7684\u4E8B</h2>
      <ol>${CARE_STEPS.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
    </aside>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>\u53EF\u4EE5\u7ACB\u5373\u806F\u7D61\u7684\u8CC7\u6E90</h2>
      <a href="/help">\u66F4\u591A\u6C42\u52A9\u8CC7\u8A0A</a>
    </div>
    ${hotlineCards()}
  </section>

  <section class="panel continue-panel">
    <h2>\u4F60\u4ECD\u7136\u53EF\u4EE5\u67E5\u770B\u641C\u5C0B\u7D50\u679C</h2>
    <p>\u6211\u5011\u4E0D\u6703\u963B\u6B62\u4F60\u53D6\u5F97\u8CC7\u8A0A\u3002\u82E5\u4F60\u73FE\u5728\u72C0\u6CC1\u7A69\u5B9A\uFF0C\u4E5F\u53EF\u4EE5\u7E7C\u7E8C\u67E5\u770B\u7D50\u679C\uFF1B\u9019\u9801\u7684\u6C42\u52A9\u8CC7\u6E90\u4ECD\u6703\u4FDD\u7559\u5728\u7D50\u679C\u9801\u4E0A\u65B9\u3002</p>
    <div class="crisis-actions">
      <a class="btn btn-ghost" href="/search?q=${encodeURIComponent(query)}&amp;ack=1">\u6211\u4E86\u89E3\uFF0C\u7E7C\u7E8C\u67E5\u770B\u7D50\u679C</a>
      <a class="btn btn-ghost" href="/">\u56DE\u5230\u9996\u9801</a>
    </div>
  </section>
  `;
  return layout({ title: "\u5148\u7167\u9867\u81EA\u5DF1", preferences, active: "/help", content });
}
__name(renderSafety, "renderSafety");

// src/routes/search.js
function publicResult(item) {
  const document = item.document;
  return {
    id: document.id,
    title: document.title,
    category: document.category,
    tags: document.tags,
    snippet: document.content.length > 180 ? `${document.content.slice(0, 180)}\u2026` : document.content,
    score: item.score,
    matchedTerms: item.matchedTerms
  };
}
__name(publicResult, "publicResult");
function readQuery(ctx) {
  return (ctx.url.searchParams.get("q") ?? "").trim();
}
__name(readQuery, "readQuery");
function registerSearchRoutes(router, deps) {
  router.get("/", (ctx) => {
    sendHtml(
      ctx.res,
      renderHome({ documents: deps.documents, preferences: ctx.preferences })
    );
  });
  router.get("/search", (ctx) => {
    const query = readQuery(ctx);
    if (!query) {
      redirect(ctx.res, "/");
      return;
    }
    const acknowledged = ctx.url.searchParams.get("ack") === "1";
    const safety = detectSafety(query);
    const blocked = safety.severity === "critical" && !acknowledged;
    const results = blocked ? [] : rankDocuments(query, deps.index);
    const html = blocked ? renderSafety({
      query,
      safety,
      preferences: ctx.preferences,
      acknowledged
    }) : renderResults({
      query,
      safety,
      results,
      preferences: ctx.preferences,
      acknowledged
    });
    sendHtml(ctx.res, html);
  });
  router.get("/api/search", (ctx) => {
    const query = readQuery(ctx);
    if (!query) {
      sendJson(ctx.res, 400, {
        error: "missing_query",
        message: "\u8ACB\u63D0\u4F9B q \u53C3\u6578\uFF0C\u4F8B\u5982 /api/search?q=\u8CC7\u6599\u5EAB\u3002"
      });
      return;
    }
    const acknowledged = ctx.url.searchParams.get("ack") === "1";
    const safety = detectSafety(query);
    const blocked = safety.severity === "critical" && !acknowledged;
    const results = blocked ? [] : rankDocuments(query, deps.index);
    sendJson(ctx.res, 200, {
      query,
      algorithm: ALGORITHM_VERSION,
      personalization: false,
      preferencesUsed: false,
      safety: {
        flagged: safety.flagged,
        severity: safety.severity,
        blocked,
        acknowledged,
        categories: safety.categories,
        matches: safety.matches
      },
      results: results.map(publicResult)
    });
  });
}
__name(registerSearchRoutes, "registerSearchRoutes");

// src/search/index.js
var FIELD_WEIGHTS = {
  title: 3,
  tags: 2,
  category: 2,
  content: 1
};
function fieldText(document, field) {
  const value = document[field];
  if (Array.isArray(value)) return value.join(" ");
  return String(value ?? "");
}
__name(fieldText, "fieldText");
function buildIndex(documents) {
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error("\u641C\u5C0B\u7D22\u5F15\u81F3\u5C11\u9700\u8981\u4E00\u7BC7\u6587\u4EF6");
  }
  const raw = documents.map((document) => {
    const counts = /* @__PURE__ */ new Map();
    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      for (const token of tokenize(fieldText(document, field))) {
        counts.set(token, (counts.get(token) ?? 0) + weight);
      }
    }
    return { document, counts };
  });
  const documentFrequency = /* @__PURE__ */ new Map();
  for (const entry of raw) {
    for (const token of entry.counts.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }
  const total = raw.length;
  const idf = /* @__PURE__ */ new Map();
  for (const [token, frequency] of documentFrequency) {
    idf.set(token, Math.log((total + 1) / (frequency + 1)) + 1);
  }
  const entries = raw.map(({ document, counts }) => {
    const vector = /* @__PURE__ */ new Map();
    let sumSquares = 0;
    for (const [token, termFrequency] of counts) {
      const weight = termFrequency * (idf.get(token) ?? 0);
      vector.set(token, weight);
      sumSquares += weight * weight;
    }
    return {
      document,
      vector,
      norm: Math.sqrt(sumSquares) || 1
    };
  });
  return { entries, idf, size: entries.length };
}
__name(buildIndex, "buildIndex");

// src/views/errors.js
function errorPage({ status, title: title2, message, preferences }) {
  return layout({
    title: `${status} ${title2}`,
    preferences,
    content: `<section class="panel error-panel">
      <p class="eyebrow">\u932F\u8AA4 ${status}</p>
      <h1>${title2}</h1>
      <p>${message}</p>
      <div class="crisis-actions">
        <a class="btn btn-primary" href="/">\u56DE\u5230\u9996\u9801</a>
        <a class="btn btn-ghost" href="/help">\u6C42\u52A9\u8CC7\u6E90</a>
      </div>
    </section>`
  });
}
__name(errorPage, "errorPage");

// src/app.js
function moduleBaseDir() {
  try {
    return path2.join(path2.dirname(fileURLToPath(import.meta.url)), "..");
  } catch {
    return process.cwd();
  }
}
__name(moduleBaseDir, "moduleBaseDir");
function createApp({ documents, documentsPath, publicDir } = {}) {
  const baseDir = moduleBaseDir();
  const resolvedPublicDir = publicDir ?? path2.join(baseDir, "public");
  const resolvedDocumentsPath = documentsPath ?? path2.join(baseDir, "data", "documents.json");
  const loadedDocuments = documents ?? JSON.parse(fs_default.readFileSync(resolvedDocumentsPath, "utf8"));
  if (!Array.isArray(loadedDocuments)) {
    throw new Error("documents \u5FC5\u9808\u662F\u9663\u5217");
  }
  const index = buildIndex(loadedDocuments);
  const router = createRouter();
  const deps = { index, documents: loadedDocuments, publicDir: resolvedPublicDir };
  registerSearchRoutes(router, deps);
  registerPageRoutes(router, deps);
  const server2 = http.createServer(async (req, res) => {
    let preferences = { ...parsePreferences("") };
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      if (url.pathname.startsWith("/static/")) {
        if (serveStatic(res, resolvedPublicDir, url.pathname)) return;
        sendHtml(
          res,
          errorPage({
            status: 404,
            title: "\u627E\u4E0D\u5230\u6A94\u6848",
            message: "\u60A8\u8981\u6C42\u7684\u975C\u614B\u8CC7\u6E90\u4E0D\u5B58\u5728\u3002",
            preferences
          }),
          404
        );
        return;
      }
      const cookies = parseCookies(req.headers.cookie ?? "");
      preferences = parsePreferences(cookies.prefs ?? "");
      const match = router.find(req.method, url.pathname);
      if (!match) {
        sendHtml(
          res,
          errorPage({
            status: 404,
            title: "\u627E\u4E0D\u5230\u9801\u9762",
            message: "\u60A8\u8981\u6C42\u7684\u9801\u9762\u4E0D\u5B58\u5728\u3002",
            preferences
          }),
          404
        );
        return;
      }
      if (match.methodNotAllowed) {
        sendHtml(
          res,
          errorPage({
            status: 405,
            title: "\u4E0D\u652F\u63F4\u7684\u8ACB\u6C42\u65B9\u6CD5",
            message: "\u9019\u500B\u9801\u9762\u4E0D\u652F\u63F4\u76EE\u524D\u7684 HTTP \u65B9\u6CD5\u3002",
            preferences
          }),
          405
        );
        return;
      }
      let body = new URLSearchParams();
      if (req.method === "POST") {
        const raw = await readBody(req, MAX_BODY_BYTES);
        body = new URLSearchParams(raw);
      }
      const ctx = {
        req,
        res,
        url,
        body,
        params: match.params,
        preferences,
        cookies,
        index,
        documents: loadedDocuments,
        ok: url.searchParams.get("ok") ?? "",
        err: url.searchParams.get("err") ?? ""
      };
      await match.handler(ctx);
    } catch (error3) {
      if (error3 instanceof HttpError) {
        if (!res.headersSent) {
          sendHtml(
            res,
            errorPage({
              status: error3.status,
              title: "\u8ACB\u6C42\u932F\u8AA4",
              message: error3.message,
              preferences
            }),
            error3.status
          );
        } else {
          res.end();
        }
        return;
      }
      console.error(error3);
      if (!res.headersSent) {
        sendHtml(
          res,
          errorPage({
            status: 500,
            title: "\u7CFB\u7D71\u932F\u8AA4",
            message: "\u7CFB\u7D71\u767C\u751F\u672A\u9810\u671F\u7684\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002",
            preferences
          }),
          500
        );
      } else {
        res.end();
      }
    }
  });
  return { server: server2, index, documents: loadedDocuments };
}
__name(createApp, "createApp");

// data/documents.json
var documents_default = [
  {
    id: "doc-001",
    title: "\u8CC7\u6599\u5EAB\u7CFB\u7D71\u5165\u9580",
    category: "\u79D1\u6280",
    tags: ["\u8CC7\u6599\u5EAB", "SQL", "\u7D22\u5F15", "\u6B63\u898F\u5316"],
    content: "\u8CC7\u6599\u5EAB\u7CFB\u7D71\u7528\u4F86\u6709\u7D44\u7E54\u5730\u5132\u5B58\u8207\u67E5\u8A62\u8CC7\u6599\u3002\u95DC\u806F\u5F0F\u8CC7\u6599\u5EAB\u4EE5\u8CC7\u6599\u8868\u3001\u4E3B\u9375\u8207\u5916\u9375\u63CF\u8FF0\u8CC7\u6599\u4E4B\u9593\u7684\u95DC\u4FC2\uFF0C\u4E26\u900F\u904E SQL \u9032\u884C\u65B0\u589E\u3001\u67E5\u8A62\u3001\u66F4\u65B0\u8207\u522A\u9664\u3002\u826F\u597D\u7684\u7D22\u5F15\u8A2D\u8A08\u53EF\u4EE5\u52A0\u5FEB\u67E5\u8A62\uFF0C\u4F46\u6703\u589E\u52A0\u5BEB\u5165\u6210\u672C\uFF1B\u6B63\u898F\u5316\u5247\u80FD\u6E1B\u5C11\u91CD\u8907\u8CC7\u6599\u8207\u66F4\u65B0\u7570\u5E38\u3002\u5B78\u7FD2\u8CC7\u6599\u5EAB\u6642\uFF0C\u5EFA\u8B70\u5148\u7406\u89E3\u8CC7\u6599\u6A21\u578B\uFF0C\u518D\u7DF4\u7FD2\u67E5\u8A62\u8207\u4EA4\u6613\u3002",
    updatedAt: "2026-09-02"
  },
  {
    id: "doc-002",
    title: "\u5F9E\u96F6\u958B\u59CB\u5B78\u7A0B\u5F0F\u8A2D\u8A08",
    category: "\u79D1\u6280",
    tags: ["\u7A0B\u5F0F\u8A2D\u8A08", "JavaScript", "\u8B8A\u6578", "\u8FF4\u5708"],
    content: "\u7A0B\u5F0F\u8A2D\u8A08\u662F\u628A\u554F\u984C\u62C6\u89E3\u6210\u53EF\u57F7\u884C\u6B65\u9A5F\u7684\u904E\u7A0B\u3002\u521D\u5B78\u8005\u53EF\u4EE5\u5F9E\u8B8A\u6578\u3001\u689D\u4EF6\u5224\u65B7\u3001\u8FF4\u5708\u8207\u51FD\u5F0F\u958B\u59CB\uFF0C\u4E26\u7528 JavaScript \u7DF4\u7FD2\u5C07\u60F3\u6CD5\u8F49\u6210\u7A0B\u5F0F\u3002\u9047\u5230\u932F\u8AA4\u6642\uFF0C\u5148\u95B1\u8B80\u932F\u8AA4\u8A0A\u606F\u3001\u7E2E\u5C0F\u554F\u984C\u7BC4\u570D\uFF0C\u518D\u9010\u6B65\u9A57\u8B49\u5047\u8A2D\u3002\u8CC7\u6599\u5EAB\u3001\u7DB2\u8DEF\u8207\u4ECB\u9762\u958B\u767C\u90FD\u53EF\u4EE5\u5728\u638C\u63E1\u57FA\u790E\u5F8C\u9010\u6B65\u5EF6\u4F38\u3002",
    updatedAt: "2026-09-05"
  },
  {
    id: "doc-003",
    title: "\u7DB2\u8DEF\u5B89\u5168\u7684\u57FA\u672C\u7FD2\u6163",
    category: "\u5B89\u5168",
    tags: ["\u7DB2\u8DEF\u5B89\u5168", "\u5BC6\u78BC", "\u91E3\u9B5A", "\u66F4\u65B0"],
    content: "\u7DB2\u8DEF\u5B89\u5168\u5F9E\u65E5\u5E38\u7FD2\u6163\u958B\u59CB\uFF1A\u70BA\u4E0D\u540C\u670D\u52D9\u4F7F\u7528\u4E0D\u540C\u7684\u5F37\u5BC6\u78BC\u3001\u555F\u7528\u5169\u6B65\u9A5F\u9A57\u8B49\u3001\u5B9A\u671F\u66F4\u65B0\u7CFB\u7D71\u8207\u700F\u89BD\u5668\uFF0C\u4E26\u5728\u9EDE\u64CA\u9023\u7D50\u524D\u78BA\u8A8D\u7DB2\u57DF\u662F\u5426\u6B63\u78BA\u3002\u6536\u5230\u8981\u6C42\u63D0\u4F9B\u5BC6\u78BC\u6216\u9A57\u8B49\u78BC\u7684\u8A0A\u606F\u6642\uFF0C\u5148\u900F\u904E\u5B98\u65B9\u7BA1\u9053\u67E5\u8B49\u3002\u5099\u4EFD\u91CD\u8981\u8CC7\u6599\uFF0C\u4E5F\u80FD\u964D\u4F4E\u52D2\u7D22\u8EDF\u9AD4\u6216\u88DD\u7F6E\u907A\u5931\u9020\u6210\u7684\u640D\u5931\u3002",
    updatedAt: "2026-09-08"
  },
  {
    id: "doc-004",
    title: "\u7761\u7720\u8207\u8EAB\u5FC3\u6062\u5FA9",
    category: "\u5065\u5EB7",
    tags: ["\u7761\u7720", "\u5931\u7720", "\u4F5C\u606F", "\u6062\u5FA9"],
    content: "\u7761\u7720\u662F\u8EAB\u5FC3\u6062\u5FA9\u7684\u91CD\u8981\u57FA\u790E\u3002\u56FA\u5B9A\u8D77\u5E8A\u6642\u9593\u3001\u7761\u524D\u6E1B\u5C11\u5F37\u5149\u8207\u87A2\u5E55\u523A\u6FC0\u3001\u907F\u514D\u4E0B\u5348\u5F8C\u651D\u53D6\u5496\u5561\u56E0\uFF0C\u90FD\u6709\u52A9\u65BC\u5EFA\u7ACB\u7A69\u5B9A\u7684\u751F\u7406\u6642\u9418\u3002\u5982\u679C\u5931\u7720\u6301\u7E8C\u6578\u9031\u4E26\u5F71\u97FF\u767D\u5929\u529F\u80FD\uFF0C\u5EFA\u8B70\u5C0B\u6C42\u91AB\u5E2B\u6216\u5FC3\u7406\u5C08\u696D\u5354\u52A9\uFF0C\u800C\u4E0D\u662F\u9577\u671F\u81EA\u884C\u4F9D\u8CF4\u52A9\u7720\u85E5\u7269\u3002",
    updatedAt: "2026-09-10"
  },
  {
    id: "doc-005",
    title: "\u58D3\u529B\u8ABF\u9069\u7684\u4E94\u500B\u65B9\u6CD5",
    category: "\u5FC3\u7406",
    tags: ["\u58D3\u529B", "\u547C\u5438", "\u6B63\u5FF5", "\u653E\u9B06"],
    content: "\u58D3\u529B\u662F\u8EAB\u9AD4\u9762\u5C0D\u6311\u6230\u6642\u7684\u81EA\u7136\u53CD\u61C9\uFF0C\u4F46\u9577\u671F\u58D3\u529B\u6703\u5F71\u97FF\u7761\u7720\u3001\u5C08\u6CE8\u8207\u60C5\u7DD2\u3002\u53EF\u4EE5\u5617\u8A66\u7DE9\u6162\u6DF1\u547C\u5438\u3001\u898F\u5F8B\u904B\u52D5\u3001\u628A\u5F85\u8FA6\u4E8B\u9805\u62C6\u6210\u5C0F\u6B65\u9A5F\u3001\u5B89\u6392\u77ED\u66AB\u4F11\u606F\uFF0C\u4EE5\u53CA\u548C\u4FE1\u4EFB\u7684\u4EBA\u8AC7\u8AC7\u3002\u82E5\u58D3\u529B\u5DF2\u9020\u6210\u6301\u7E8C\u7684\u7126\u616E\u3001\u5931\u7720\u6216\u8EAB\u9AD4\u4E0D\u9069\uFF0C\u5C0B\u6C42\u5FC3\u7406\u8AEE\u5546\u6216\u91AB\u7642\u5354\u52A9\u662F\u5408\u9069\u7684\u9078\u64C7\u3002",
    updatedAt: "2026-09-12"
  },
  {
    id: "doc-006",
    title: "\u5982\u4F55\u966A\u4F34\u60C5\u7DD2\u4F4E\u843D\u7684\u670B\u53CB",
    category: "\u5FC3\u7406",
    tags: ["\u966A\u4F34", "\u50BE\u807D", "\u6182\u9B31", "\u652F\u6301"],
    content: "\u966A\u4F34\u60C5\u7DD2\u4F4E\u843D\u7684\u670B\u53CB\u6642\uFF0C\u5148\u50BE\u807D\u800C\u4E0D\u662F\u6025\u8457\u7D66\u5EFA\u8B70\u3002\u53EF\u4EE5\u6EAB\u548C\u5730\u8A62\u554F\u5C0D\u65B9\u6700\u8FD1\u597D\u4E0D\u597D\uFF0C\u4E26\u8B93\u5C0D\u65B9\u77E5\u9053\u4F60\u5728\u4E4E\u3002\u907F\u514D\u8AAA\u300C\u60F3\u958B\u4E00\u9EDE\u300D\u6216\u300C\u4F60\u5DF2\u7D93\u5F88\u5E78\u798F\u4E86\u300D\u9019\u985E\u5426\u5B9A\u611F\u53D7\u7684\u8A71\u3002\u5982\u679C\u5C0D\u65B9\u8868\u9054\u7D55\u671B\u3001\u60F3\u6D88\u5931\u6216\u50B7\u5BB3\u81EA\u5DF1\u7684\u5FF5\u982D\uFF0C\u8ACB\u8A8D\u771F\u770B\u5F85\uFF0C\u966A\u540C\u5C0D\u65B9\u5C0B\u6C42\u5C08\u696D\u5354\u52A9\uFF0C\u5FC5\u8981\u6642\u64A5\u6253 1925 \u6216 1995\u3002",
    updatedAt: "2026-09-15"
  },
  {
    id: "doc-007",
    title: "\u6182\u9B31\u75C7\u8207\u6C42\u52A9\u7BA1\u9053",
    category: "\u5FC3\u7406",
    tags: ["\u6182\u9B31", "\u5FC3\u7406\u8AEE\u5546", "\u5C31\u91AB", "1925"],
    content: "\u6182\u9B31\u75C7\u4E0D\u53EA\u662F\u5FC3\u60C5\u4E0D\u597D\uFF0C\u53EF\u80FD\u4F34\u96A8\u6301\u7E8C\u4F4E\u843D\u3001\u5931\u53BB\u8208\u8DA3\u3001\u7761\u7720\u8207\u98DF\u617E\u6539\u8B8A\u3001\u5C08\u6CE8\u56F0\u96E3\u8207\u81EA\u8CAC\u3002\u5B83\u4E0D\u662F\u610F\u5FD7\u529B\u4E0D\u8DB3\uFF0C\u800C\u662F\u53EF\u4EE5\u6CBB\u7642\u7684\u75BE\u75C5\u3002\u82E5\u75C7\u72C0\u6301\u7E8C\u5169\u9031\u4EE5\u4E0A\u4E26\u5F71\u97FF\u751F\u6D3B\uFF0C\u5EFA\u8B70\u81F3\u8EAB\u5FC3\u79D1\u6216\u7CBE\u795E\u79D1\u8A55\u4F30\uFF0C\u4E5F\u53EF\u4EE5\u4F7F\u7528\u6821\u5712\u8AEE\u5546\u6216\u793E\u5340\u5FC3\u7406\u885B\u751F\u8CC7\u6E90\u3002\u9700\u8981\u6709\u4EBA\u966A\u4F34\u8AAA\u8A71\u6642\uFF0C\u53EF\u4EE5\u64A5\u6253 1925 \u5B89\u5FC3\u5C08\u7DDA\u6216 1995 \u751F\u547D\u7DDA\u3002",
    updatedAt: "2026-09-18"
  },
  {
    id: "doc-008",
    title: "\u81EA\u6211\u50B7\u5BB3\u7684\u8B66\u8A0A\u8207\u5354\u52A9",
    category: "\u5FC3\u7406",
    tags: ["\u81EA\u6211\u50B7\u5BB3", "\u6C42\u52A9", "\u5B89\u5168", "\u652F\u6301"],
    content: "\u81EA\u6211\u50B7\u5BB3\u53EF\u80FD\u662F\u9762\u5C0D\u5F37\u70C8\u60C5\u7DD2\u6642\u7684\u4E00\u7A2E\u56E0\u61C9\u65B9\u5F0F\uFF0C\u800C\u4E0D\u662F\u70BA\u4E86\u5F15\u8D77\u6CE8\u610F\u3002\u82E5\u4F60\u767C\u73FE\u81EA\u5DF1\u6709\u50B7\u5BB3\u81EA\u5DF1\u7684\u5FF5\u982D\u6216\u884C\u70BA\uFF0C\u8ACB\u5148\u9060\u96E2\u53EF\u80FD\u9020\u6210\u50B7\u5BB3\u7684\u7269\u54C1\uFF0C\u4E26\u544A\u8A34\u4E00\u4F4D\u4FE1\u4EFB\u7684\u4EBA\u3002\u5C0B\u6C42\u5FC3\u7406\u8AEE\u5546\u3001\u8EAB\u5FC3\u79D1\u6216\u6025\u8A3A\u5354\u52A9\u90FD\u80FD\u63D0\u4F9B\u5E6B\u52A9\uFF1B\u82E5\u6709\u7ACB\u5373\u5371\u96AA\uFF0C\u8ACB\u64A5\u6253 119 \u6216 110\u3002\u8EAB\u908A\u7684\u4EBA\u4E5F\u53EF\u4EE5\u6EAB\u548C\u8A62\u554F\u4E26\u966A\u4F34\u5C31\u91AB\u3002",
    updatedAt: "2026-09-20"
  },
  {
    id: "doc-009",
    title: "\u81EA\u6BBA\u9632\u6CBB\uFF1A\u4F60\u53EF\u4EE5\u505A\u7684\u4E8B",
    category: "\u5FC3\u7406",
    tags: ["\u81EA\u6BBA\u9632\u6CBB", "1925", "1995", "\u5371\u6A5F"],
    content: "\u81EA\u6BBA\u9632\u6CBB\u9700\u8981\u793E\u6703\u5171\u540C\u53C3\u8207\u3002\u82E5\u8EAB\u908A\u7684\u4EBA\u8AC7\u5230\u60F3\u6B7B\u3001\u6D3B\u4E0D\u4E0B\u53BB\u6216\u4EA4\u4EE3\u5F8C\u4E8B\uFF0C\u8ACB\u8A8D\u771F\u50BE\u807D\u4E26\u76F4\u63A5\u8A62\u554F\u662F\u5426\u6709\u50B7\u5BB3\u81EA\u5DF1\u7684\u5FF5\u982D\u3002\u4E0D\u8981\u627F\u8AFE\u4FDD\u5BC6\u5230\u5371\u53CA\u5B89\u5168\u7684\u7A0B\u5EA6\uFF0C\u61C9\u966A\u4F34\u5C0D\u65B9\u806F\u7D61 1925 \u5B89\u5FC3\u5C08\u7DDA\u30011995 \u751F\u547D\u7DDA\u6216\u966A\u540C\u5C31\u91AB\u3002\u82E5\u5C0D\u65B9\u6709\u7ACB\u5373\u5371\u96AA\uFF0C\u8ACB\u7559\u5728\u8EAB\u908A\u4E26\u64A5\u6253 119 \u6216 110\u3002",
    updatedAt: "2026-09-22"
  },
  {
    id: "doc-010",
    title: "\u5747\u8861\u98F2\u98DF\u8207\u65E5\u5E38\u71DF\u990A",
    category: "\u5065\u5EB7",
    tags: ["\u98F2\u98DF", "\u71DF\u990A", "\u5065\u5EB7", "\u6C34\u5206"],
    content: "\u5747\u8861\u98F2\u98DF\u5305\u542B\u8DB3\u5920\u7684\u852C\u83DC\u3001\u6C34\u679C\u3001\u5168\u7A40\u96DC\u7CE7\u3001\u86CB\u767D\u8CEA\u8207\u5065\u5EB7\u6CB9\u8102\u3002\u898F\u5F8B\u7528\u9910\u8207\u88DC\u5145\u8DB3\u5920\u6C34\u5206\uFF0C\u6709\u52A9\u65BC\u7DAD\u6301\u9AD4\u529B\u8207\u5C08\u6CE8\u3002\u6975\u7AEF\u7BC0\u98DF\u6216\u9577\u671F\u4E0D\u9032\u98DF\u53EF\u80FD\u9020\u6210\u8EAB\u9AD4\u50B7\u5BB3\uFF1B\u5982\u679C\u98DF\u617E\u6216\u9AD4\u91CD\u51FA\u73FE\u660E\u986F\u8B8A\u5316\uFF0C\u5EFA\u8B70\u5C0B\u6C42\u91AB\u5E2B\u6216\u71DF\u990A\u5E2B\u5354\u52A9\u3002",
    updatedAt: "2026-09-25"
  },
  {
    id: "doc-011",
    title: "\u898F\u5F8B\u904B\u52D5\u7684\u597D\u8655",
    category: "\u5065\u5EB7",
    tags: ["\u904B\u52D5", "\u5065\u5EB7", "\u9AD4\u529B", "\u5FC3\u60C5"],
    content: "\u898F\u5F8B\u904B\u52D5\u80FD\u6539\u5584\u5FC3\u80BA\u529F\u80FD\u3001\u808C\u529B\u8207\u7761\u7720\uFF0C\u4E5F\u6709\u52A9\u65BC\u8ABF\u7BC0\u58D3\u529B\u8207\u60C5\u7DD2\u3002\u521D\u5B78\u8005\u53EF\u4EE5\u5F9E\u6BCF\u9031\u6578\u6B21\u3001\u6BCF\u6B21\u4E8C\u5341\u5206\u9418\u7684\u5FEB\u8D70\u958B\u59CB\uFF0C\u9010\u6B65\u589E\u52A0\u5F37\u5EA6\u3002\u904B\u52D5\u524D\u5F8C\u8A18\u5F97\u6696\u8EAB\u8207\u6536\u64CD\uFF0C\u82E5\u6709\u6162\u6027\u75BE\u75C5\u6216\u8EAB\u9AD4\u4E0D\u9069\uFF0C\u5148\u8AEE\u8A62\u91AB\u5E2B\u518D\u5B89\u6392\u904B\u52D5\u8A08\u756B\u3002",
    updatedAt: "2026-09-27"
  },
  {
    id: "doc-012",
    title: "\u6642\u9593\u7BA1\u7406\u8207\u8B80\u66F8\u8A08\u756B",
    category: "\u5B78\u7FD2",
    tags: ["\u6642\u9593\u7BA1\u7406", "\u8B80\u66F8", "\u8A08\u756B", "\u5C08\u6CE8"],
    content: "\u6709\u6548\u7684\u6642\u9593\u7BA1\u7406\u4E0D\u662F\u628A\u884C\u7A0B\u585E\u6EFF\uFF0C\u800C\u662F\u5148\u78BA\u8A8D\u91CD\u8981\u76EE\u6A19\uFF0C\u518D\u628A\u5927\u4EFB\u52D9\u62C6\u6210\u53EF\u57F7\u884C\u7684\u5C0F\u6B65\u9A5F\u3002\u53EF\u4EE5\u4F7F\u7528\u756A\u8304\u9418\u3001\u5F85\u8FA6\u6E05\u55AE\u6216\u6BCF\u9031\u56DE\u9867\u4F86\u8FFD\u8E64\u9032\u5EA6\u3002\u5B89\u6392\u4F11\u606F\u8207\u7DE9\u885D\u6642\u9593\u540C\u6A23\u91CD\u8981\uFF0C\u907F\u514D\u9577\u671F\u71AC\u591C\u9020\u6210\u6548\u7387\u8207\u5065\u5EB7\u4E0B\u964D\u3002",
    updatedAt: "2026-09-28"
  },
  {
    id: "doc-013",
    title: "\u6709\u6548\u7387\u7684\u7B46\u8A18\u65B9\u6CD5",
    category: "\u5B78\u7FD2",
    tags: ["\u7B46\u8A18", "\u5B78\u7FD2", "\u8907\u7FD2", "\u6574\u7406"],
    content: "\u597D\u7684\u7B46\u8A18\u80FD\u5E6B\u52A9\u7406\u89E3\u8207\u8907\u7FD2\u3002\u4E0A\u8AB2\u6642\u5148\u8A18\u9304\u91CD\u9EDE\u8207\u81EA\u5DF1\u7684\u7591\u554F\uFF0C\u8AB2\u5F8C\u518D\u7528\u81EA\u5DF1\u7684\u8A71\u6574\u7406\uFF0C\u4E26\u5EFA\u7ACB\u6982\u5FF5\u4E4B\u9593\u7684\u9023\u7D50\u3002\u5361\u7247\u76D2\u7B46\u8A18\u3001\u5EB7\u4E43\u723E\u7B46\u8A18\u8207\u5FC3\u667A\u5716\u5404\u6709\u9069\u7528\u60C5\u5883\u3002\u5B9A\u671F\u56DE\u9867\u6BD4\u4E00\u6B21\u5BEB\u5F97\u5F88\u6F02\u4EAE\u66F4\u91CD\u8981\u3002",
    updatedAt: "2026-09-29"
  },
  {
    id: "doc-014",
    title: "\u4EBA\u5DE5\u667A\u6167\u8207\u6A5F\u5668\u5B78\u7FD2\u7C21\u4ECB",
    category: "\u79D1\u6280",
    tags: ["AI", "\u6A5F\u5668\u5B78\u7FD2", "\u8CC7\u6599", "\u6A21\u578B"],
    content: "\u6A5F\u5668\u5B78\u7FD2\u8B93\u96FB\u8166\u5F9E\u8CC7\u6599\u4E2D\u627E\u51FA\u6A21\u5F0F\uFF0C\u5E38\u898B\u65B9\u6CD5\u5305\u62EC\u76E3\u7763\u5F0F\u5B78\u7FD2\u3001\u975E\u76E3\u7763\u5F0F\u5B78\u7FD2\u8207\u5F37\u5316\u5B78\u7FD2\u3002\u6A21\u578B\u7684\u597D\u58DE\u53D6\u6C7A\u65BC\u8CC7\u6599\u54C1\u8CEA\u3001\u7279\u5FB5\u8A2D\u8A08\u8207\u8A55\u4F30\u65B9\u5F0F\u3002\u5BE6\u52D9\u4E0A\u9700\u8981\u7559\u610F\u504F\u5DEE\u3001\u96B1\u79C1\u8207\u53EF\u89E3\u91CB\u6027\uFF0C\u4E0D\u80FD\u53EA\u8FFD\u6C42\u6E96\u78BA\u7387\u3002\u8CC7\u6599\u5EAB\u8207\u8CC7\u6599\u6E05\u7406\u5F80\u5F80\u662F\u6A5F\u5668\u5B78\u7FD2\u6D41\u7A0B\u4E2D\u6700\u8017\u6642\u7684\u90E8\u5206\u3002",
    updatedAt: "2026-10-01"
  },
  {
    id: "doc-015",
    title: "\u6C23\u5019\u8B8A\u9077\u8207\u6C38\u7E8C\u751F\u6D3B",
    category: "\u74B0\u5883",
    tags: ["\u6C23\u5019", "\u6C38\u7E8C", "\u7BC0\u80FD", "\u74B0\u5883"],
    content: "\u6C23\u5019\u8B8A\u9077\u8207\u6EAB\u5BA4\u6C23\u9AD4\u6392\u653E\u5BC6\u5207\u76F8\u95DC\u3002\u65E5\u5E38\u751F\u6D3B\u4E2D\u53EF\u4EE5\u5F9E\u7BC0\u7D04\u80FD\u6E90\u3001\u6E1B\u5C11\u6D6A\u8CBB\u3001\u9078\u64C7\u5927\u773E\u904B\u8F38\u8207\u652F\u6301\u6C38\u7E8C\u7522\u54C1\u958B\u59CB\u3002\u500B\u4EBA\u884C\u52D5\u96D6\u7136\u6709\u9650\uFF0C\u4F46\u642D\u914D\u653F\u7B56\u8207\u4F01\u696D\u6539\u8B8A\uFF0C\u80FD\u7522\u751F\u66F4\u5927\u7684\u5F71\u97FF\u3002\u7406\u89E3\u8CC7\u6599\u8207\u79D1\u5B78\u8B49\u64DA\uFF0C\u6709\u52A9\u65BC\u505A\u51FA\u66F4\u5408\u9069\u7684\u9078\u64C7\u3002",
    updatedAt: "2026-10-03"
  },
  {
    id: "doc-016",
    title: "\u500B\u4EBA\u7406\u8CA1\u7684\u7B2C\u4E00\u6B65",
    category: "\u7406\u8CA1",
    tags: ["\u7406\u8CA1", "\u9810\u7B97", "\u5132\u84C4", "\u8A18\u5E33"],
    content: "\u500B\u4EBA\u7406\u8CA1\u53EF\u4EE5\u5F9E\u8A18\u5E33\u8207\u7DE8\u5217\u9810\u7B97\u958B\u59CB\u3002\u5148\u5340\u5206\u5FC5\u8981\u652F\u51FA\u8207\u60F3\u8981\u652F\u51FA\uFF0C\u518D\u8A2D\u5B9A\u77ED\u671F\u7DCA\u6025\u9810\u5099\u91D1\u8207\u9577\u671F\u5132\u84C4\u76EE\u6A19\u3002\u6295\u8CC7\u524D\u61C9\u5148\u4E86\u89E3\u98A8\u96AA\u8207\u81EA\u8EAB\u627F\u53D7\u80FD\u529B\uFF0C\u907F\u514D\u807D\u4FE1\u4FDD\u8B49\u7372\u5229\u7684\u8AAA\u6CD5\u3002\u5EFA\u7ACB\u7A69\u5B9A\u7684\u73FE\u91D1\u6D41\uFF0C\u6BD4\u8FFD\u6C42\u77ED\u671F\u9AD8\u5831\u916C\u66F4\u91CD\u8981\u3002",
    updatedAt: "2026-10-05"
  },
  {
    id: "doc-017",
    title: "\u6C96\u716E\u4E00\u676F\u597D\u5496\u5561",
    category: "\u751F\u6D3B",
    tags: ["\u5496\u5561", "\u6C96\u716E", "\u751F\u6D3B", "\u98A8\u5473"],
    content: "\u6C96\u716E\u5496\u5561\u6642\uFF0C\u6C34\u6EAB\u3001\u7814\u78E8\u7C97\u7D30\u3001\u7C89\u6C34\u6BD4\u4F8B\u8207\u6642\u9593\u90FD\u6703\u5F71\u97FF\u98A8\u5473\u3002\u521D\u5B78\u8005\u53EF\u4EE5\u5148\u56FA\u5B9A\u4E00\u500B\u914D\u65B9\uFF0C\u518D\u9010\u6B65\u8ABF\u6574\u55AE\u4E00\u8B8A\u56E0\u3002\u6DFA\u7119\u8C46\u901A\u5E38\u9069\u5408\u8F03\u9AD8\u6C34\u6EAB\u8207\u8F03\u7D30\u7814\u78E8\uFF0C\u6DF1\u7119\u8C46\u5247\u53EF\u964D\u4F4E\u6C34\u6EAB\u907F\u514D\u82E6\u5473\u3002\u8A18\u9304\u6BCF\u6B21\u6C96\u716E\u53C3\u6578\uFF0C\u80FD\u66F4\u5FEB\u627E\u5230\u81EA\u5DF1\u559C\u6B61\u7684\u5473\u9053\u3002",
    updatedAt: "2026-10-07"
  },
  {
    id: "doc-018",
    title: "\u53F0\u7063\u5C0F\u767E\u5CB3\u5165\u9580\u8DEF\u7DDA",
    category: "\u751F\u6D3B",
    tags: ["\u767B\u5C71", "\u6236\u5916", "\u5B89\u5168", "\u9AD4\u529B"],
    content: "\u767B\u5C71\u524D\u61C9\u78BA\u8A8D\u8DEF\u7DDA\u96E3\u5EA6\u3001\u5929\u6C23\u8207\u81EA\u8EAB\u9AD4\u529B\uFF0C\u4E26\u651C\u5E36\u8DB3\u5920\u98F2\u6C34\u3001\u884C\u52D5\u7CE7\u3001\u96E8\u5177\u8207\u982D\u71C8\u3002\u51FA\u767C\u524D\u544A\u77E5\u5BB6\u4EBA\u6216\u670B\u53CB\u884C\u7A0B\uFF0C\u907F\u514D\u7368\u81EA\u524D\u5F80\u4E0D\u719F\u6089\u7684\u5C71\u57DF\u3002\u82E5\u5929\u5019\u4E0D\u4F73\u6216\u8EAB\u9AD4\u4E0D\u9069\uFF0C\u61C9\u679C\u65B7\u6298\u8FD4\u3002\u5B89\u5168\u4E0B\u5C71\u6BD4\u653B\u9802\u66F4\u91CD\u8981\u3002",
    updatedAt: "2026-10-09"
  },
  {
    id: "doc-019",
    title: "\u6B63\u5FF5\u547C\u5438\u7DF4\u7FD2",
    category: "\u5FC3\u7406",
    tags: ["\u6B63\u5FF5", "\u547C\u5438", "\u653E\u9B06", "\u7576\u4E0B"],
    content: "\u6B63\u5FF5\u547C\u5438\u662F\u5C07\u6CE8\u610F\u529B\u5E36\u56DE\u7576\u4E0B\u7684\u4E00\u7A2E\u7DF4\u7FD2\u3002\u627E\u4E00\u500B\u5B89\u975C\u7684\u4F4D\u7F6E\u5750\u4E0B\uFF0C\u611F\u53D7\u7A7A\u6C23\u9032\u5165\u8207\u96E2\u958B\u8EAB\u9AD4\uFF0C\u4E0D\u9700\u8981\u523B\u610F\u63A7\u5236\u547C\u5438\u3002\u7576\u601D\u7DD2\u98C4\u8D70\u6642\uFF0C\u6EAB\u548C\u5730\u5C07\u6CE8\u610F\u529B\u5E36\u56DE\u547C\u5438\u5373\u53EF\u3002\u6BCF\u5929\u5E7E\u5206\u9418\u7684\u7DF4\u7FD2\uFF0C\u6709\u52A9\u65BC\u89BA\u5BDF\u58D3\u529B\u8207\u60C5\u7DD2\uFF0C\u4F46\u5B83\u4E0D\u80FD\u53D6\u4EE3\u5FC5\u8981\u7684\u91AB\u7642\u6216\u5FC3\u7406\u6CBB\u7642\u3002",
    updatedAt: "2026-10-11"
  },
  {
    id: "doc-020",
    title: "\u5931\u7720\u6642\u53EF\u4EE5\u505A\u7684\u4E8B",
    category: "\u5065\u5EB7",
    tags: ["\u5931\u7720", "\u7761\u7720", "\u653E\u9B06", "\u4F5C\u606F"],
    content: "\u7761\u4E0D\u8457\u6642\uFF0C\u8207\u5176\u8EBA\u5728\u5E8A\u4E0A\u5F37\u8FEB\u81EA\u5DF1\u5165\u7761\uFF0C\u4E0D\u5982\u5148\u96E2\u958B\u5E8A\u92EA\uFF0C\u5230\u5149\u7DDA\u67D4\u548C\u7684\u5730\u65B9\u505A\u5B89\u975C\u7684\u4E8B\uFF0C\u7B49\u6709\u7761\u610F\u518D\u56DE\u5E8A\u4E0A\u3002\u767D\u5929\u907F\u514D\u9577\u6642\u9593\u88DC\u7720\uFF0C\u4E26\u7DAD\u6301\u56FA\u5B9A\u8D77\u5E8A\u6642\u9593\u3002\u82E5\u5931\u7720\u6301\u7E8C\uFF0C\u5EFA\u8B70\u8A18\u9304\u7761\u7720\u65E5\u8A8C\u4E26\u5C0B\u6C42\u5C08\u696D\u5354\u52A9\u3002",
    updatedAt: "2026-10-13"
  },
  {
    id: "doc-021",
    title: "\u7126\u616E\u767C\u4F5C\u6642\u7684\u56E0\u61C9\u65B9\u5F0F",
    category: "\u5FC3\u7406",
    tags: ["\u7126\u616E", "\u6050\u614C", "\u547C\u5438", "\u56E0\u61C9"],
    content: "\u7126\u616E\u767C\u4F5C\u6642\uFF0C\u8EAB\u9AD4\u53EF\u80FD\u51FA\u73FE\u5FC3\u8DF3\u52A0\u5FEB\u3001\u547C\u5438\u6025\u4FC3\u3001\u982D\u6688\u6216\u51FA\u6C57\u3002\u53EF\u4EE5\u5148\u627E\u4E00\u500B\u5B89\u5168\u7684\u5730\u65B9\u5750\u4E0B\uFF0C\u6162\u6162\u5EF6\u9577\u5410\u6C23\uFF0C\u4E26\u63D0\u9192\u81EA\u5DF1\u9019\u4E9B\u611F\u53D7\u6703\u904E\u53BB\u3002\u628A\u6CE8\u610F\u529B\u653E\u5728\u7576\u4E0B\u53EF\u89C0\u5BDF\u7684\u4E8B\u7269\uFF0C\u4F8B\u5982\u89F8\u89BA\u6216\u8072\u97F3\u3002\u82E5\u7126\u616E\u53CD\u8986\u5F71\u97FF\u751F\u6D3B\uFF0C\u5EFA\u8B70\u5C0B\u6C42\u5FC3\u7406\u8AEE\u5546\u6216\u91AB\u7642\u8A55\u4F30\u3002",
    updatedAt: "2026-10-15"
  },
  {
    id: "doc-022",
    title: "\u7DB2\u8DEF\u6210\u766E\u8207\u6578\u4F4D\u6392\u6BD2",
    category: "\u5065\u5EB7",
    tags: ["\u7DB2\u8DEF\u6210\u766E", "\u6578\u4F4D\u6392\u6BD2", "\u4F5C\u606F", "\u5C08\u6CE8"],
    content: "\u7576\u4F7F\u7528\u7DB2\u8DEF\u6216\u793E\u7FA4\u5A92\u9AD4\u5F71\u97FF\u7761\u7720\u3001\u5B78\u696D\u3001\u5DE5\u4F5C\u8207\u4EBA\u969B\u95DC\u4FC2\u6642\uFF0C\u53EF\u80FD\u9700\u8981\u91CD\u65B0\u8ABF\u6574\u4F7F\u7528\u7FD2\u6163\u3002\u53EF\u4EE5\u8A2D\u5B9A\u56FA\u5B9A\u7684\u7121\u87A2\u5E55\u6642\u6BB5\u3001\u95DC\u9589\u4E0D\u5FC5\u8981\u7684\u901A\u77E5\u3001\u628A\u624B\u6A5F\u653E\u5728\u81E5\u5BA4\u5916\uFF0C\u4E26\u5B89\u6392\u5BE6\u9AD4\u6D3B\u52D5\u3002\u82E5\u51FA\u73FE\u5F37\u70C8\u7126\u616E\u6216\u5931\u63A7\u611F\uFF0C\u5EFA\u8B70\u5C0B\u6C42\u5FC3\u7406\u5C08\u696D\u5354\u52A9\u3002",
    updatedAt: "2026-10-17"
  },
  {
    id: "doc-023",
    title: "\u6821\u5712\u5FC3\u7406\u8AEE\u5546\u8CC7\u6E90",
    category: "\u5FC3\u7406",
    tags: ["\u6821\u5712", "\u8AEE\u5546", "\u652F\u6301", "\u5B78\u751F"],
    content: "\u5927\u5B78\u901A\u5E38\u8A2D\u6709\u5B78\u751F\u8F14\u5C0E\u6216\u5FC3\u7406\u8AEE\u5546\u4E2D\u5FC3\uFF0C\u63D0\u4F9B\u500B\u5225\u8AEE\u5546\u3001\u5718\u9AD4\u6D3B\u52D5\u8207\u5FC3\u7406\u5065\u5EB7\u8B1B\u5EA7\u3002\u8AEE\u5546\u5167\u5BB9\u539F\u5247\u4E0A\u4FDD\u5BC6\uFF0C\u4E26\u7531\u5C08\u696D\u4EBA\u54E1\u5354\u52A9\u4F60\u6574\u7406\u60C5\u7DD2\u3001\u4EBA\u969B\u6216\u751F\u6DAF\u8B70\u984C\u3002\u82E5\u4F60\u8EAB\u908A\u7684\u540C\u5B78\u9700\u8981\u5354\u52A9\uFF0C\u4E5F\u53EF\u4EE5\u966A\u540C\u5C0D\u65B9\u9810\u7D04\u6216\u5148\u5411\u5C0E\u5E2B\u53CD\u6620\u3002",
    updatedAt: "2026-10-19"
  },
  {
    id: "doc-024",
    title: "\u5982\u4F55\u5411\u8EAB\u908A\u7684\u4EBA\u6C42\u52A9",
    category: "\u5FC3\u7406",
    tags: ["\u6C42\u52A9", "\u652F\u6301", "\u6E9D\u901A", "\u966A\u4F34"],
    content: "\u6C42\u52A9\u53EF\u4EE5\u5F9E\u4E00\u53E5\u7C21\u55AE\u7684\u8A71\u958B\u59CB\uFF0C\u4F8B\u5982\u300C\u6211\u6700\u8FD1\u72C0\u6CC1\u4E0D\u592A\u597D\uFF0C\u53EF\u4EE5\u966A\u6211\u804A\u804A\u55CE\uFF1F\u300D\u9078\u64C7\u4F60\u4FE1\u4EFB\u4E14\u9858\u610F\u50BE\u807D\u7684\u4EBA\uFF0C\u4E26\u5728\u9700\u8981\u6642\u660E\u78BA\u8868\u9054\u4F60\u5E0C\u671B\u5C0D\u65B9\u600E\u9EBC\u5E6B\u5FD9\u3002\u82E5\u5C0D\u65B9\u7121\u6CD5\u63D0\u4F9B\u8DB3\u5920\u652F\u6301\uFF0C\u4E5F\u53EF\u4EE5\u806F\u7D61\u5C08\u7DDA\u6216\u5C08\u696D\u4EBA\u54E1\u3002\u6C42\u52A9\u4E0D\u662F\u9020\u6210\u5225\u4EBA\u8CA0\u64D4\uFF0C\u800C\u662F\u7167\u9867\u81EA\u5DF1\u7684\u91CD\u8981\u4E00\u6B65\u3002",
    updatedAt: "2026-10-21"
  }
];

// worker.js
import stylesheet from "./ce22636f611804a2116de360baedcc46deb3fcc6-style.css";
var PORT = 8080;
var { server } = createApp({ documents: documents_default });
server.listen(PORT);
var STATIC_HEADERS = {
  "Content-Type": "text/css; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  "X-Content-Type-Options": "nosniff"
};
var worker_default = {
  fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/static/style.css") {
      return new Response(stylesheet, { headers: STATIC_HEADERS });
    }
    return handleAsNodeRequest(PORT, request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ksov2t/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ksov2t/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
