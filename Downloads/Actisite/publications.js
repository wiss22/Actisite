(function () {
  "use strict";

  function getConfig() {
    var cfg = window.ACTINUANCE_SANITY_CONFIG || {};
    return {
      projectId: cfg.projectId || "",
      dataset: cfg.dataset || "production",
      apiVersion: cfg.apiVersion || "2024-10-01",
      useCdn: cfg.useCdn !== false,
      maxItems: Number(cfg.maxItems || 24)
    };
  }

  function isConfigured(cfg) {
    return !!cfg.projectId && cfg.projectId !== "YOUR_SANITY_PROJECT_ID";
  }

  function safeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildUrl(cfg, query) {
    var host = cfg.useCdn ? "apicdn.sanity.io" : "api.sanity.io";
    return "https://" + cfg.projectId + "." + host + "/v" + cfg.apiVersion + "/data/query/" + cfg.dataset + "?query=" + encodeURIComponent(query);
  }

  function normalizeItems(result) {
    if (!result || !Array.isArray(result.result)) return [];
    return result.result.map(function (item) {
      var category = item.category || item.publicationType || item.type || item._type || "Article";
      var image = item.coverImageUrl || item.mainImageUrl || item.imageUrl || "";
      var excerpt = item.excerpt || item.summary || item.description || "";
      var slug = item.slug || "";
      var link = item.externalUrl || item.url || (slug ? ("/publications/" + slug) : "#");
      return {
        title: item.title || "Publication",
        category: String(category),
        excerpt: String(excerpt),
        link: String(link),
        image: String(image),
        publishedAt: item.publishedAt || item._createdAt || null,
        rawType: String(item._type || "")
      };
    });
  }

  function inferKind(item) {
    var source = (item.category + " " + item.rawType).toLowerCase();
    if (source.indexOf("innovation") !== -1 || source.indexOf("r&d") !== -1 || source.indexOf("lab") !== -1) {
      return "innovation";
    }
    return "article";
  }

  function renderCard(item, featured) {
    var tag = safeText(item.category || "Publication");
    var title = safeText(item.title);
    var text = safeText(item.excerpt);
    var link = safeText(item.link || "#");
    var target = link.indexOf("http") === 0 ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "";

    return "\n      <article class=\"ressource-card" + (featured ? " big" : "") + " reveal\">\n        <div class=\"ressource-tag\">" + tag + "</div>\n        <h3>" + title + "</h3>\n        " + (text ? ("<p>" + text + "</p>") : "") + "\n        <a href=\"" + link + "\" class=\"card-link\"" + target + ">Lire →</a>\n      </article>\n    ";
  }

  function renderList(container, items) {
    if (!container || !items.length) return;
    container.innerHTML = items
      .map(function (item, idx) { return renderCard(item, idx === 0); })
      .join("");
  }

  function queryPublications(cfg) {
    var groq = "*[_type in [\"publication\",\"post\",\"article\",\"innovation\"] && defined(title)]"
      + " | order(coalesce(publishedAt, _createdAt) desc)[0..." + cfg.maxItems + "]"
      + "{title, excerpt, summary, description, externalUrl, url, publishedAt, _createdAt, _type,"
      + "\"slug\": coalesce(slug.current, slug),"
      + "\"category\": coalesce(category->title, category, publicationType, type),"
      + "\"coverImageUrl\": coalesce(coverImage.asset->url, mainImage.asset->url, image.asset->url)}";

    return fetch(buildUrl(cfg, groq), {
      method: "GET",
      headers: { "Accept": "application/json" }
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Sanity query failed: " + res.status);
      }
      return res.json();
    }).then(normalizeItems);
  }

  function initHome(items) {
    var homeGrid = document.querySelector("[data-publications-home]");
    if (!homeGrid) return;
    renderList(homeGrid, items.slice(0, 3));
  }

  function initArticlesPage(items) {
    var grid = document.querySelector("[data-publications=\"articles\"]");
    if (!grid) return;
    var filtered = items.filter(function (item) { return inferKind(item) === "article"; });
    renderList(grid, filtered.slice(0, 9));
  }

  function initInnovationPage(items) {
    var grid = document.querySelector("[data-publications=\"innovation\"]");
    if (!grid) return;
    var filtered = items.filter(function (item) { return inferKind(item) === "innovation"; });
    renderList(grid, filtered.slice(0, 9));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cfg = getConfig();
    if (!isConfigured(cfg)) return;

    queryPublications(cfg)
      .then(function (items) {
        if (!items.length) return;
        initHome(items);
        initArticlesPage(items);
        initInnovationPage(items);
      })
      .catch(function () {
        // Keep static fallback content when API is unavailable.
      });
  });
})();
