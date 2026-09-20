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

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

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
