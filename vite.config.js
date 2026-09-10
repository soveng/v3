import { defineConfig } from "vite";
import { renderTestimonials } from "./scripts/generate-projects.js";
import { generatePages } from "./scripts/generate-pages.js";

const pages = generatePages();
const routes = new Set(pages.map(path => "/" + path.replace(/\/index\.html$/, "")));
function canonicalRoutes(server) {
  server.middlewares.use((request, response, next) => {
    const url = new URL(request.url, "http://localhost");
    if (!routes.has(url.pathname)) return next();
    response.writeHead(308, { Location: url.pathname + "/" + url.search });
    response.end();
  });
}

export default defineConfig({
  appType: "mpa",
  plugins: [{
    name: "canonical-content-routes",
    transformIndexHtml: html => html.replace("<!-- TESTIMONIALS -->", renderTestimonials()),
    configureServer: canonicalRoutes,
    configurePreviewServer: canonicalRoutes,
  }],
  build: { rollupOptions: { input: ["index.html", ...pages] } },
});
