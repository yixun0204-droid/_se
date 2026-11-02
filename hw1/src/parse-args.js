export const VERSION = '1.0.0';

const VALUE_OPTIONS = new Set([
  'method',
  'header',
  'data',
  'output',
  'user',
  'userAgent',
  'maxTime',
  'referer',
  'json',
]);

const ALIASES = {
  '-X': 'method',
  '--request': 'method',
  '-H': 'header',
  '--header': 'header',
  '-d': 'data',
  '--data': 'data',
  '--data-raw': 'data',
  '-j': 'json',
  '--json': 'json',
  '-o': 'output',
  '--output': 'output',
  '-i': 'include',
  '--include': 'include',
  '-I': 'head',
  '--head': 'head',
  '-L': 'location',
  '--location': 'location',
  '-v': 'verbose',
  '--verbose': 'verbose',
  '-s': 'silent',
  '--silent': 'silent',
  '-u': 'user',
  '--user': 'user',
  '-A': 'userAgent',
  '--user-agent': 'userAgent',
  '--referer': 'referer',
  '--max-time': 'maxTime',
  '-k': 'insecure',
  '--insecure': 'insecure',
  '-f': 'fail',
  '--fail': 'fail',
  '-h': 'help',
  '--help': 'help',
  '-V': 'version',
  '--version': 'version',
};

export class UsageError extends Error {}

function setValue(opts, key, value) {
  switch (key) {
    case 'header':
      opts.headers.push(value);
      break;
    case 'data':
      opts.dataParts.push(value);
      break;
    case 'json':
      opts.json = true;
      opts.dataParts.push(value);
      break;
    case 'output':
      opts.output = value;
      break;
    case 'method':
      opts.method = value;
      break;
    case 'user':
      opts.user = value;
      break;
    case 'userAgent':
      opts.userAgent = value;
      break;
    case 'referer':
      opts.referer = value;
      break;
    case 'maxTime': {
      const seconds = Number(value);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        throw new UsageError(`invalid value for --max-time: ${value}`);
      }
      opts.maxTime = seconds;
      break;
    }
    default:
      throw new UsageError(`unknown option: ${key}`);
  }
}

function setFlag(opts, key) {
  switch (key) {
    case 'include':
      opts.include = true;
      break;
    case 'head':
      opts.head = true;
      break;
    case 'location':
      opts.location = true;
      break;
    case 'verbose':
      opts.verbose = true;
      break;
    case 'silent':
      opts.silent = true;
      break;
    case 'insecure':
      opts.insecure = true;
      break;
    case 'fail':
      opts.fail = true;
      break;
    case 'help':
      opts.help = true;
      break;
    case 'version':
      opts.version = true;
      break;
    default:
      throw new UsageError(`unknown option: ${key}`);
  }
}

function setCombinedShortFlags(opts, chars) {
  for (const char of chars) {
    const key = ALIASES[`-${char}`];
    if (!key || VALUE_OPTIONS.has(key)) return false;
  }
  for (const char of chars) {
    setFlag(opts, ALIASES[`-${char}`]);
  }
  return true;
}

export function parseArgs(argv) {
  const opts = {
    method: null,
    headers: [],
    dataParts: [],
    output: null,
    include: false,
    head: false,
    location: false,
    verbose: false,
    silent: false,
    user: null,
    userAgent: null,
    referer: null,
    maxTime: null,
    insecure: false,
    fail: false,
    json: false,
    help: false,
    version: false,
    urls: [],
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--') {
      opts.urls.push(...argv.slice(i + 1));
      break;
    }

    if (!arg.startsWith('-') || arg === '-') {
      opts.urls.push(arg);
      i++;
      continue;
    }

    let name = arg;
    let inlineValue = null;

    if (arg.startsWith('--') && arg.includes('=')) {
      const eq = arg.indexOf('=');
      name = arg.slice(0, eq);
      inlineValue = arg.slice(eq + 1);
    }

    const key = ALIASES[name];

    if (!key) {
      if (!arg.startsWith('--') && arg.length > 2) {
        const shortKey = ALIASES[arg.slice(0, 2)];
        if (shortKey && VALUE_OPTIONS.has(shortKey)) {
          setValue(opts, shortKey, arg.slice(2));
          i++;
          continue;
        }
        if (setCombinedShortFlags(opts, arg.slice(1).split(''))) {
          i++;
          continue;
        }
      }
      throw new UsageError(`unknown option: ${arg}`);
    }

    if (VALUE_OPTIONS.has(key)) {
      let value = inlineValue;
      if (value === null) {
        value = argv[i + 1];
        if (value === undefined) {
          throw new UsageError(`option ${name} requires a value`);
        }
        i++;
      }
      setValue(opts, key, value);
    } else {
      if (inlineValue !== null) {
        throw new UsageError(`option ${name} does not take a value`);
      }
      setFlag(opts, key);
    }

    i++;
  }

  return opts;
}

export function helpText() {
  return `Usage: minicurl [options] <url>...

A small curl-like HTTP client built with Node.js built-in modules.

Options:
  -X, --request <method>    HTTP method (default: GET, or POST when data is sent)
  -H, --header <header>    Add a request header, e.g. -H "Accept: application/json"
  -d, --data <data>        Send a request body (repeatable, joined with '&')
      --data-raw <data>    Same as --data
  -j, --json <data>        Send a JSON body and set Content-Type: application/json
  -I, --head               Fetch headers only (HEAD request)
  -i, --include            Include response headers in the output
  -L, --location           Follow redirects (up to 10)
  -o, --output <file>      Write the response to a file
  -u, --user <user:pass>   Basic authentication
  -A, --user-agent <name>  Set the User-Agent header
      --referer <url>      Set the Referer header
      --max-time <seconds> Abort the request after this many seconds
  -k, --insecure           Allow insecure TLS connections
  -f, --fail               Fail on HTTP status >= 400 (exit code 22)
  -v, --verbose            Print request/response details to stderr
  -s, --silent             Suppress verbose and error messages
  -h, --help               Show this help
  -V, --version            Show version

Examples:
  minicurl https://example.com
  minicurl -i https://example.com
  minicurl -X POST -H "Content-Type: application/json" -d '{"a":1}' https://example.com/api
  minicurl --json '{"a":1}' https://example.com/api
  minicurl -L https://example.com/redirect
  minicurl -o page.html https://example.com
`;
}
