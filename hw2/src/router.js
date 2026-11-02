function splitPath(pathname) {
  return pathname.split('/').filter(Boolean);
}

function matchSegments(pattern, pathname) {
  const expected = splitPath(pattern);
  const actual = splitPath(pathname);
  if (expected.length !== actual.length) return null;

  const params = {};
  for (let i = 0; i < expected.length; i++) {
    const part = expected[i];
    if (part.startsWith(':')) {
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

export function createRouter() {
  const routes = [];

  function add(method, pattern, handler) {
    routes.push({ method, pattern, handler });
  }

  return {
    get: (pattern, handler) => add('GET', pattern, handler),
    post: (pattern, handler) => add('POST', pattern, handler),
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
    },
  };
}
