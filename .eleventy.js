const fs = require("fs");
const path = require("path");

function assetPath(publicPath) {
  const rel = String(publicPath || "").replace(/^\//, "");
  return path.join(__dirname, "src", rel);
}

function imageMeta(publicPath) {
  let buf;
  try {
    buf = fs.readFileSync(assetPath(publicPath));
  } catch (e) {
    return { mime: "", width: 0, height: 0 };
  }
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return {
      mime: "image/png",
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 8 < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return {
          mime: "image/jpeg",
          height: buf.readUInt16BE(i + 5),
          width: buf.readUInt16BE(i + 7),
        };
      }
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
    return { mime: "image/jpeg", width: 0, height: 0 };
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return { mime: "image/webp", width: 0, height: 0 };
  }
  return { mime: "", width: 0, height: 0 };
}

function countWords(value) {
  const text = String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{\{[\s\S]*?\}\}/g, " ")
    .replace(/[#>*_`\[\]()|]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

function isoDateTimeIran(dateObj) {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  if (Number.isNaN(d.getTime())) return "";
  const dateOnly =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0;
  if (dateOnly) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}T00:00:00+03:30`;
  }
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = {};
  for (const part of fmt.formatToParts(d)) parts[part.type] = part.value;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+03:30`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/703baeb9e91bd9016e3ee21c40255c59.txt");

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
    const skip = new Set(["/thanks/", "/lab/", "/glass/", "/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt"]);
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

  eleventyConfig.addFilter("isoDateTime", isoDateTimeIran);
  eleventyConfig.addFilter("jsonString", (value) => JSON.stringify(value == null ? "" : value));
  eleventyConfig.addFilter("imageMeta", imageMeta);
  eleventyConfig.addFilter("stripTags", (value) => String(value || "").replace(/<[^>]+>/g, ""));
  eleventyConfig.addFilter("postWordCount", (content, faqs) => {
    let total = countWords(content);
    for (const item of faqs || []) {
      total += countWords(item && item.q);
      total += countWords(item && item.a);
    }
    return total;
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
