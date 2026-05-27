const PATH_PREFIX = '/projects/map/eldenring';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Strip the subpath prefix before forwarding to the Pages project.
    // /projects/map/eldenring/skyboxes/foo.png -> /skyboxes/foo.png
    // /projects/map/eldenring                  -> /
    const strippedPath = url.pathname.startsWith(PATH_PREFIX)
      ? url.pathname.slice(PATH_PREFIX.length) || '/'
      : '/';

    const target = new URL(strippedPath + url.search, env.PAGES_ORIGIN);

    // Forward all headers except host — fetch() sets that to the target host automatically.
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase() !== 'host') headers.set(key, value);
    }

    return fetch(target.toString(), {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });
  },
};
