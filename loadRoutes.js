import fs from 'fs';

export async function loadRoutes(app) {
  // read subdirectories of routes (get, post, put)
  const routeDirs = fs.readdirSync('./routes', { withFileTypes: true }).filter(d => d.isDirectory());

  for (const dir of routeDirs) {
    const method = dir.name; // directory name MUST correspond to method
    const files = fs.readdirSync(`./routes/${method}`).filter(f => f.endsWith('.js'));

    // load each route handler
    for (const file of files) {
      const mod = await import(`./routes/${dir.name}/${file}`);

      const path = mod.path;
      const handler = mod.handler;
      const middleware = mod.middleware ?? []; // middleware is optional

      app[method](path, ...middleware, handler);
      console.log(`Loaded ${method} ${path}`);
    }
  }
}