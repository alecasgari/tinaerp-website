module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  eleventyConfig.addCollection("blog", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/content/blog/*.md")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("news", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/content/news/*.md")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("sitemap", (collectionApi) => {
    const skip = new Set(["/thanks/", "/lab/", "/glass/", "/robots.txt", "/sitemap.xml", "/llms.txt"]);
    return collectionApi
      .getAll()
      .filter((item) => {
        const u = item.url || "";
        if (!u || skip.has(u)) return false;
        if (u.endsWith(".txt") || u.endsWith(".xml")) return false;
        return true;
      })
      .sort((a, b) => (a.url > b.url ? 1 : -1));
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    try {
      return new Date(dateObj).toISOString().slice(0, 10);
    } catch (e) {
      return "";
    }
  });

  eleventyConfig.addFilter("sitemapPriority", (url) => {
    if (url === "/") return "1.0";
    if (["/features/", "/pricing/", "/demo/"].includes(url)) return "0.9";
    if (["/contact/", "/docs/", "/about/"].includes(url)) return "0.8";
    if ((url || "").startsWith("/blog/") || (url || "").startsWith("/news/")) return "0.7";
    return "0.6";
  });

  eleventyConfig.addFilter("sitemapChangefreq", (url) => {
    if (url === "/") return "weekly";
    if ((url || "").startsWith("/blog/") || (url || "").startsWith("/news/")) return "weekly";
    return "monthly";
  });

  eleventyConfig.addFilter("startsWith", (str, prefix) =>
    typeof str === "string" && typeof prefix === "string" ? str.startsWith(prefix) : false
  );

  eleventyConfig.addFilter("contains", (str, needle) =>
    typeof str === "string" && typeof needle === "string" ? str.includes(needle) : false
  );

  // Project Pages: set pathPrefix in src/_data/site.json when needed
  const site = require("./src/_data/site.json");

  return {
    pathPrefix: site.pathPrefix || "",
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
