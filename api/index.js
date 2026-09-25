// src/index.ts
import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { WebStandardAdapter } from "elysia/adapter/web-standard";

// src/rdap.ts
var bootstrapMap = null;
var bootstrapFailed = false;
async function getBootstrap() {
  if (bootstrapMap)
    return bootstrapMap;
  if (bootstrapFailed)
    return new Map;
  try {
    const res = await fetch("https://data.iana.org/rdap/dns.json");
    if (!res.ok)
      throw new Error(`bootstrap fetch failed: ${res.status}`);
    const json = await res.json();
    bootstrapMap = new Map;
    for (const entry of json.services) {
      const url = entry.urls[0];
      for (const tld of entry.tlds) {
        if (!bootstrapMap.has(tld))
          bootstrapMap.set(tld, url);
      }
    }
    return bootstrapMap;
  } catch {
    bootstrapFailed = true;
    return new Map;
  }
}
async function resolveFetchUrl(domain) {
  const clean = domain.toLowerCase().replace(/^www\./, "");
  const tld = clean.split(".").pop() ?? "";
  try {
    const boot = await getBootstrap();
    const server = boot.get(tld);
    if (server)
      return { url: server.endsWith("/") ? server + "domain/" + clean : server + "/domain/" + clean, serverLabel: server };
  } catch {}
  return { url: "https://rdap.org/domain/" + clean, serverLabel: "rdap.org" };
}
function vcardProp(vcardArray, key) {
  if (!vcardArray || !Array.isArray(vcardArray[1]))
    return null;
  const prop = vcardArray[1].find((p) => p[0] === key);
  if (!prop || !prop[3])
    return null;
  if (Array.isArray(prop[3]))
    return prop[3][0] ?? null;
  return String(prop[3]);
}
async function fetchRdap(domain) {
  const clean = domain.toLowerCase().replace(/^www\./, "");
  const labels = clean.split(".");
  const tld = labels[labels.length - 1];
  if (!tld || labels.length < 2) {
    return { domain: clean, tld, rdapServer: null, handle: null, status: [], registrar: null, dnssec: "Unsigned", dates: { registration: null, expiration: null, lastChanged: null }, nameservers: [], entities: [], abuse: { email: null, phone: null }, found: false, error: "invalid domain" };
  }
  const { url, serverLabel } = await resolveFetchUrl(clean);
  const server = serverLabel ?? "rdap.org";
  let raw;
  try {
    const res = await fetch(url, { headers: { accept: "application/rdap+json", "user-agent": "retired-worker/1.0" } });
    if (res.status === 404) {
      return { domain: clean, tld, rdapServer: server, handle: null, status: [], registrar: null, dnssec: "Unsigned", dates: { registration: null, expiration: null, lastChanged: null }, nameservers: [], entities: [], abuse: { email: null, phone: null }, found: false, error: "domain not found" };
    }
    if (!res.ok)
      throw new Error(`rdap ${res.status}`);
    raw = await res.json();
  } catch (e) {
    return { domain: clean, tld, rdapServer: server, handle: null, status: [], registrar: null, dnssec: "Unsigned", dates: { registration: null, expiration: null, lastChanged: null }, nameservers: [], entities: [], abuse: { email: null, phone: null }, found: false, error: `rdap fetch failed: ${e instanceof Error ? e.message : String(e)}` };
  }
  const d = raw;
  const handle = d.handle ?? null;
  const statusArr = (d.status ?? []).map((s) => s.replace(/_/g, " "));
  const secure = d.secureDNS;
  const dnssec = secure && secure.delegationSigned ? "Signed" : "Unsigned";
  let registrarName = null;
  const entities = d.entities ?? [];
  const entityOut = entities.map((ent) => {
    const roles = ent.roles ?? [];
    const v = ent.vcardArray;
    const name = v ? vcardProp(v, "fn") : null;
    const email = v ? vcardProp(v, "email") : null;
    const phone = v ? vcardProp(v, "tel") : null;
    if (roles.includes("registrar") && name)
      registrarName = name;
    return { roles, name, emails: email ? [email] : [], phones: phone ? [phone] : [] };
  });
  let abuseEmail = null;
  let abusePhone = null;
  for (const ent of entities) {
    const roles = ent.roles ?? [];
    const v = ent.vcardArray;
    if (roles.includes("abuse")) {
      if (!abuseEmail && v)
        abuseEmail = vcardProp(v, "email");
      if (!abusePhone && v)
        abusePhone = vcardProp(v, "tel");
    }
  }
  const dates = { registration: null, expiration: null, lastChanged: null };
  for (const ev of d.events ?? []) {
    const action = ev.eventAction;
    const date = ev.eventDate;
    if (!date)
      continue;
    if (action === "registration")
      dates.registration = date;
    else if (action === "expiration")
      dates.expiration = date;
    else if (action === "last changed")
      dates.lastChanged = date;
  }
  const nameservers = (d.nameservers ?? []).map((ns) => ns.ldhName ?? "").filter(Boolean);
  return { domain: clean, tld, rdapServer: server, handle, status: statusArr, registrar: registrarName, dnssec, dates, nameservers, entities: entityOut, abuse: { email: abuseEmail, phone: abusePhone }, found: true, error: null };
}

// src/views/RetiredPage.tsx
import { Html as Html12 } from "@elysiajs/html";

// src/components/Layout.tsx
import { Html } from "@elysiajs/html";
var Layout = ({ title, children }) => /* @__PURE__ */ Html.createElement("html", {
  lang: "en"
}, /* @__PURE__ */ Html.createElement("head", null, /* @__PURE__ */ Html.createElement("meta", {
  charset: "UTF-8"
}), /* @__PURE__ */ Html.createElement("meta", {
  name: "viewport",
  content: "width=device-width, initial-scale=1.0"
}), /* @__PURE__ */ Html.createElement("title", null, title), /* @__PURE__ */ Html.createElement("script", {
  src: "https://cdn.tailwindcss.com"
}), /* @__PURE__ */ Html.createElement("style", null, `
        :root {
          --color-background: #faf5f1;
          --color-surface: #ffffff;
          --color-surface-muted: #c8c4c1;
          --color-text-primary: #000000;
          --color-text-secondary: #0d061e;
          --color-text-muted: #4b4a48;
          --color-border: #ffffff;
          --color-primary: #150079;
          --color-secondary: #6e47ff;
          --color-accent: #ffc1a1;
          --color-primary-hover: #0e0052;
          --color-danger: #fe8fa1;
          --color-warning: #fff4a2;
          --color-success: #54c423;
          --color-info: #1264a3;
          --font-body: 'Gellix', ui-sans-serif, system-ui, sans-serif;
          --font-heading: 'UlmGrotesk', Gellix, ui-sans-serif, sans-serif;
        }
        .grad-1 { background: linear-gradient(180deg, var(--color-background), var(--color-surface)); }
        .grad-2 { background: radial-gradient(circle, var(--color-background), #FFE0D0, var(--color-secondary), var(--color-primary), var(--color-primary)); }
        .grad-3 { background: radial-gradient(circle, rgba(255, 187, 152, 0), rgba(255, 187, 152, 0.2), var(--color-primary), var(--color-secondary), #9E84FF); }
        .grad-4 { background: linear-gradient(180deg, var(--color-surface), var(--color-background)); }
        .grad-5 { background: radial-gradient(circle, #9E84FF, #8666FF, var(--color-secondary), #5835DE, #4224BC, #2B129B, var(--color-primary), rgba(255, 187, 152, 0.2), rgba(255, 187, 152, 0)); }
        body { background-color: var(--color-background); color: var(--color-text-primary); font-family: var(--font-body); }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `), /* @__PURE__ */ Html.createElement("script", null, `
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                background: 'var(--color-background)', surface: 'var(--color-surface)',
                'surface-muted': 'var(--color-surface-muted)', 'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)', 'text-muted': 'var(--color-text-muted)',
                border: 'var(--color-border)', primary: 'var(--color-primary)', secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)', 'primary-hover': 'var(--color-primary-hover)',
                danger: 'var(--color-danger)', warning: 'var(--color-warning)', success: 'var(--color-success)', info: 'var(--color-info)',
              },
              fontFamily: { body: ['Gellix','ui-sans-serif','system-ui','sans-serif'], heading: ['UlmGrotesk','Gellix','ui-sans-serif','sans-serif'] },
              spacing: { '3xs':'2px','2xs':'4px','xs':'6px','sm':'8px','md':'10px','lg':'12px','xl':'14px','2xl':'16px','3xl':'20px','4xl':'22px','5xl':'24px','section':'112px' },
              borderRadius: { 'xs':'2px','sm':'3px','md':'4px','lg':'7px','xl':'8px','2xl':'10px','3xl':'11px','full':'9999px','button':'14px','card':'26px' },
              boxShadow: { 'xs':'0px 0px 0px 0px rgba(0,0,0,0)','sm':'0px 0px 11px 0px rgba(46,30,107,0.04)','md':'0px 5px 10px 0px rgba(26,24,41,0.06)','lg':'0px 8px 24px 0px rgba(26,24,43,0.12)','xl':'0px 20px 48px 0px rgba(26,24,43,0.12)' }
            }
          }
        }
      `)), /* @__PURE__ */ Html.createElement("body", {
  class: "antialiased min-h-screen flex flex-col"
}, children));

// src/components/Header.tsx
import { Html as Html2 } from "@elysiajs/html";
var Header = ({ domain }) => /* @__PURE__ */ Html2.createElement("header", {
  class: "h-[65px] w-full flex items-center justify-center px-[32px] bg-transparent text-text-primary shrink-0 relative z-10 border-b border-border"
}, /* @__PURE__ */ Html2.createElement("div", {
  class: "max-w-[1280px] w-full flex justify-between items-center h-full"
}, /* @__PURE__ */ Html2.createElement("span", {
  class: "text-[18px] font-[500] leading-[28px] font-heading",
  id: "nav-domain-name"
}, domain), /* @__PURE__ */ Html2.createElement("nav", {
  class: "hidden md:flex gap-5xl"
}, /* @__PURE__ */ Html2.createElement("a", {
  href: "#status",
  class: "text-[14px] font-[500] hover:text-primary transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]"
}, "Status"), /* @__PURE__ */ Html2.createElement("a", {
  href: "#rdap",
  class: "text-[14px] font-[500] hover:text-primary transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]"
}, "RDAP Data"), /* @__PURE__ */ Html2.createElement("a", {
  href: "#faq",
  class: "text-[14px] font-[500] hover:text-primary transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]"
}, "FAQ"))));

// src/components/Hero.tsx
import { Html as Html3 } from "@elysiajs/html";
var Hero = ({ domain }) => /* @__PURE__ */ Html3.createElement("section", {
  class: "py-0 relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] grad-1"
}, /* @__PURE__ */ Html3.createElement("div", {
  class: "absolute inset-0 opacity-10 grad-3 mix-blend-multiply pointer-events-none"
}), /* @__PURE__ */ Html3.createElement("div", {
  class: "max-w-[1280px] w-full px-[32px] flex flex-col items-center text-center gap-5xl relative z-10"
}, /* @__PURE__ */ Html3.createElement("span", {
  class: "inline-flex items-center justify-center px-[12px] py-[6px] rounded-full bg-[#F1EDFF] text-secondary text-[12px] font-[600] uppercase tracking-wider"
}, "Service Notice"), /* @__PURE__ */ Html3.createElement("h1", {
  class: "text-[64px] md:text-[80px] font-[400] leading-[1.1] tracking-[-4.8px] font-heading max-w-[800px]"
}, "This domain has been ", /* @__PURE__ */ Html3.createElement("span", {
  class: "text-primary"
}, "retired"), "."), /* @__PURE__ */ Html3.createElement("p", {
  class: "text-[18px] font-[500] leading-[28px] font-body text-text-muted max-w-[600px]"
}, "The domain ", /* @__PURE__ */ Html3.createElement("strong", {
  id: "hero-domain-name",
  class: "text-text-primary"
}, domain), " is no longer in active service and will not be renewed. Registration data is provided below for administrative transparency."), /* @__PURE__ */ Html3.createElement("div", {
  class: "flex gap-2xl mt-3xl"
}, /* @__PURE__ */ Html3.createElement("a", {
  href: "#rdap",
  class: "inline-flex items-center justify-center h-[56px] px-[40px] rounded-full bg-text-primary text-surface border border-border text-[14px] font-[500] hover:bg-primary-hover transition-colors duration-280 ease-[cubic-bezier(0.4,0,0.2,1)]"
}, "View Registry Data"))));

// src/components/StatusSection.tsx
import { Html as Html4 } from "@elysiajs/html";
var StatusSection = () => /* @__PURE__ */ Html4.createElement("section", {
  id: "status",
  class: "py-section flex flex-col items-center"
}, /* @__PURE__ */ Html4.createElement("div", {
  class: "max-w-[1280px] w-full px-[32px] flex flex-col items-center text-center gap-2xl"
}, /* @__PURE__ */ Html4.createElement("h2", {
  class: "text-[48px] font-[400] leading-[53px] tracking-[-2.88px] font-heading"
}, "End of Lifecycle."), /* @__PURE__ */ Html4.createElement("p", {
  class: "text-[24px] font-[400] leading-[26.5px] tracking-[-1.44px] font-heading text-text-muted max-w-[700px]"
}, "Following the conclusion of its intended project scope, this digital property is entering its grace period before returning to public availability.")));

// src/components/RdapSection.tsx
import { Html as Html5 } from "@elysiajs/html";
var RdapSection = ({ data }) => {
  const isFound = data.found;
  const handle = isFound ? data.handle || "Unknown" : "Data Unavailable";
  const registrar = isFound ? data.registrar || "Unknown" : "N/A";
  const dnssec = isFound ? data.dnssec || "Unsigned" : "N/A";
  return /* @__PURE__ */ Html5.createElement("section", {
    id: "rdap",
    class: "py-section flex flex-col items-center bg-surface"
  }, /* @__PURE__ */ Html5.createElement("div", {
    class: "max-w-[1280px] w-full px-[32px] flex flex-col gap-5xl"
  }, /* @__PURE__ */ Html5.createElement("div", {
    class: "flex flex-col gap-sm"
  }, /* @__PURE__ */ Html5.createElement("h5", {
    class: "text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading"
  }, "Registration Output"), /* @__PURE__ */ Html5.createElement("p", {
    class: "text-[14px] font-[500] font-body text-text-muted"
  }, "Live query results from authoritative RDAP servers.")), /* @__PURE__ */ Html5.createElement("div", {
    class: "bg-surface border border-border rounded-card shadow-xl p-[32px] flex flex-col gap-5xl"
  }, /* @__PURE__ */ Html5.createElement("div", {
    class: "flex flex-wrap items-center justify-between gap-2xl border-b border-surface-muted pb-[24px]"
  }, /* @__PURE__ */ Html5.createElement("div", {
    class: "min-w-0 max-w-full"
  }, /* @__PURE__ */ Html5.createElement("span", {
    class: "text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] uppercase text-text-muted"
  }, "Handle"), /* @__PURE__ */ Html5.createElement("h3", {
    id: "rdap-handle",
    class: "text-[20px] sm:text-[28px] font-[400] leading-tight font-heading mt-2xs break-all"
  }, handle)), /* @__PURE__ */ Html5.createElement("div", {
    class: "flex flex-wrap gap-sm",
    id: "rdap-status-container"
  }, !isFound ? /* @__PURE__ */ Html5.createElement("span", {
    class: "inline-flex items-center justify-center px-[8px] py-[4px] rounded-full bg-danger text-surface text-[11px] font-[500]"
  }, "Lookup Failed") : data.status && data.status.length > 0 ? data.status.map((s) => /* @__PURE__ */ Html5.createElement("span", {
    class: "inline-flex items-center justify-center px-[8px] py-[4px] rounded-full bg-background text-text-primary border border-border text-[11px] font-[500] capitalize"
  }, s)) : /* @__PURE__ */ Html5.createElement("span", {
    class: "inline-flex items-center justify-center px-[8px] py-[4px] rounded-full bg-surface text-text-primary border border-border text-[11px] font-[500]"
  }, "Unknown"))), /* @__PURE__ */ Html5.createElement("div", {
    class: "grid grid-cols-1 md:grid-cols-2 gap-5xl"
  }, /* @__PURE__ */ Html5.createElement("div", {
    class: "flex flex-col gap-xs"
  }, /* @__PURE__ */ Html5.createElement("span", {
    class: "text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] uppercase text-text-muted"
  }, "Registrar"), /* @__PURE__ */ Html5.createElement("p", {
    id: "rdap-registrar",
    class: "text-[18px] font-[500] leading-[28px] font-heading"
  }, registrar)), /* @__PURE__ */ Html5.createElement("div", {
    class: "flex flex-col gap-xs"
  }, /* @__PURE__ */ Html5.createElement("span", {
    class: "text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] uppercase text-text-muted"
  }, "DNSSEC"), /* @__PURE__ */ Html5.createElement("p", {
    id: "rdap-dnssec",
    class: "text-[18px] font-[500] leading-[28px] font-heading"
  }, dnssec))))));
};

// src/components/DatesSection.tsx
import { Html as Html6 } from "@elysiajs/html";
function formatDate(isoDate) {
  if (!isoDate)
    return "N/A";
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime()))
      return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "N/A";
  }
}
var DatesSection = ({ dates, isFound }) => {
  const regDate = isFound ? formatDate(dates?.registration) : "N/A";
  const changedDate = isFound ? formatDate(dates?.lastChanged) : "N/A";
  const expDate = isFound ? formatDate(dates?.expiration) : "N/A";
  return /* @__PURE__ */ Html6.createElement("section", {
    class: "py-section flex flex-col items-center"
  }, /* @__PURE__ */ Html6.createElement("div", {
    class: "max-w-[1280px] w-full px-[32px]"
  }, /* @__PURE__ */ Html6.createElement("h5", {
    class: "text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading mb-5xl text-center md:text-left"
  }, "Critical Dates"), /* @__PURE__ */ Html6.createElement("div", {
    class: "grid grid-cols-1 md:grid-cols-3 gap-5xl"
  }, /* @__PURE__ */ Html6.createElement("article", {
    class: "bg-surface rounded-[20px] p-[24px] flex flex-col gap-md shadow-sm border border-[#D3CFE5] hover:shadow-md transition-shadow duration-280"
  }, /* @__PURE__ */ Html6.createElement("svg", {
    class: "w-[24px] h-[24px] text-secondary",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ Html6.createElement("path", {
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "2",
    d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
  })), /* @__PURE__ */ Html6.createElement("h4", {
    class: "text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading"
  }, "Registration"), /* @__PURE__ */ Html6.createElement("p", {
    id: "rdap-date-reg",
    class: "text-[16px] font-[400] text-text-primary"
  }, regDate)), /* @__PURE__ */ Html6.createElement("article", {
    class: "bg-surface rounded-[20px] p-[24px] flex flex-col gap-md shadow-sm border border-[#D3CFE5] hover:shadow-md transition-shadow duration-280"
  }, /* @__PURE__ */ Html6.createElement("svg", {
    class: "w-[24px] h-[24px] text-primary",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ Html6.createElement("path", {
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "2",
    d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
  })), /* @__PURE__ */ Html6.createElement("h4", {
    class: "text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading"
  }, "Last Changed"), /* @__PURE__ */ Html6.createElement("p", {
    id: "rdap-date-changed",
    class: "text-[16px] font-[400] text-text-primary"
  }, changedDate)), /* @__PURE__ */ Html6.createElement("article", {
    class: "bg-surface rounded-[20px] p-[24px] flex flex-col gap-md shadow-sm border border-[#D3CFE5] hover:shadow-md transition-shadow duration-280"
  }, /* @__PURE__ */ Html6.createElement("svg", {
    class: "w-[24px] h-[24px] text-danger",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ Html6.createElement("path", {
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "2",
    d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  })), /* @__PURE__ */ Html6.createElement("h4", {
    class: "text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading"
  }, "Expiration"), /* @__PURE__ */ Html6.createElement("p", {
    id: "rdap-date-exp",
    class: "text-[16px] font-[400] text-text-primary"
  }, expDate)))));
};

// src/components/PolicySection.tsx
import { Html as Html7 } from "@elysiajs/html";
var PolicySection = () => /* @__PURE__ */ Html7.createElement("section", {
  class: "py-section flex flex-col items-center grad-4"
}, /* @__PURE__ */ Html7.createElement("div", {
  class: "max-w-[1280px] w-full px-[32px] flex flex-col items-center text-center gap-2xl"
}, /* @__PURE__ */ Html7.createElement("h3", {
  class: "text-[28px] font-[400] leading-[28px] font-heading"
}, "Transfer & Release Policy"), /* @__PURE__ */ Html7.createElement("p", {
  class: "text-[16px] font-[400] font-body text-text-muted max-w-[800px]"
}, "This domain is currently locked to prevent unauthorized transfers during its retirement phase. Upon reaching the expiration date, it will enter the standard registry redemption and pending delete phases before becoming available for public registration through standard registrars. We do not facilitate direct private sales or early transfers.")));

// src/components/InfrastructureSection.tsx
import { Html as Html8 } from "@elysiajs/html";
var InfrastructureSection = ({ nameservers, entities, isFound }) => {
  const roles = new Set;
  for (const ent of entities || []) {
    for (const role of ent.roles || []) {
      roles.add(role);
    }
  }
  return /* @__PURE__ */ Html8.createElement("section", {
    class: "py-section flex flex-col items-center bg-surface border-t border-border"
  }, /* @__PURE__ */ Html8.createElement("div", {
    class: "max-w-[1280px] w-full px-[32px]"
  }, /* @__PURE__ */ Html8.createElement("h5", {
    class: "text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading mb-5xl"
  }, "Network Infrastructure"), /* @__PURE__ */ Html8.createElement("div", {
    class: "grid grid-cols-1 md:grid-cols-3 gap-5xl"
  }, /* @__PURE__ */ Html8.createElement("div", {
    class: "col-span-1 md:col-span-2 flex flex-col gap-md"
  }, /* @__PURE__ */ Html8.createElement("h6", {
    class: "text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading text-secondary"
  }, "Authoritative Nameservers"), /* @__PURE__ */ Html8.createElement("ul", {
    id: "rdap-nameservers",
    class: "flex flex-col gap-sm mt-sm"
  }, !isFound ? /* @__PURE__ */ Html8.createElement("li", {
    class: "text-[14px] text-text-muted"
  }, "Query failed or data restricted.") : nameservers && nameservers.length > 0 ? nameservers.map((ns) => /* @__PURE__ */ Html8.createElement("li", {
    class: "text-[14px] font-[500] text-text-primary flex items-center gap-sm"
  }, /* @__PURE__ */ Html8.createElement("svg", {
    class: "w-[16px] h-[16px] text-secondary",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, /* @__PURE__ */ Html8.createElement("path", {
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "2",
    d: "M5 12h14M12 5l7 7-7 7"
  })), " ", ns)) : /* @__PURE__ */ Html8.createElement("li", {
    class: "text-[14px] text-text-muted"
  }, "No nameservers found."))), /* @__PURE__ */ Html8.createElement("div", {
    class: "flex flex-col gap-md"
  }, /* @__PURE__ */ Html8.createElement("h6", {
    class: "text-[19.5px] font-[700] leading-[21.5px] tracking-[-0.58px] font-heading text-secondary"
  }, "Contact Roles"), /* @__PURE__ */ Html8.createElement("div", {
    id: "rdap-entities",
    class: "flex flex-col gap-sm mt-sm"
  }, !isFound ? /* @__PURE__ */ Html8.createElement("span", {
    class: "text-[14px] text-text-muted"
  }, "Query failed.") : roles.size > 0 ? Array.from(roles).map((r) => /* @__PURE__ */ Html8.createElement("span", {
    class: "inline-flex self-start items-center px-[8px] py-[4px] rounded-full bg-surface-muted text-text-primary text-[11px] font-[500] capitalize"
  }, r)) : /* @__PURE__ */ Html8.createElement("span", {
    class: "text-[14px] text-text-muted"
  }, "No entities found."))))));
};

// src/components/AbuseSection.tsx
import { Html as Html9 } from "@elysiajs/html";
var AbuseSection = ({ abuse, isFound }) => {
  const email = isFound ? abuse?.email || "Not available" : "Not available";
  const phone = isFound ? abuse?.phone || "Not available" : "Not available";
  return /* @__PURE__ */ Html9.createElement("section", {
    class: "py-section flex flex-col items-center"
  }, /* @__PURE__ */ Html9.createElement("div", {
    class: "max-w-[1280px] w-full px-[32px]"
  }, /* @__PURE__ */ Html9.createElement("div", {
    class: "grid grid-cols-1 md:grid-cols-2 gap-[64px]"
  }, /* @__PURE__ */ Html9.createElement("div", {
    class: "flex flex-col gap-2xl justify-center"
  }, /* @__PURE__ */ Html9.createElement("h3", {
    class: "text-[28px] font-[400] leading-[28px] font-heading"
  }, "Abuse Reporting"), /* @__PURE__ */ Html9.createElement("p", {
    class: "text-[16px] font-[400] text-text-muted"
  }, "If this domain is currently involved in abusive practices, spam, or malicious activity despite being retired, please direct reports to the designated registrar abuse contact provided in the RDAP payload.")), /* @__PURE__ */ Html9.createElement("div", {
    class: "bg-surface rounded-[16px] p-[32px] border border-[#D3CFE5] flex flex-col gap-md shadow-sm"
  }, /* @__PURE__ */ Html9.createElement("span", {
    class: "text-[11.5px] font-[500] uppercase text-text-muted tracking-[0.12px]"
  }, "Registrar Abuse Contact"), /* @__PURE__ */ Html9.createElement("p", {
    id: "rdap-abuse-email",
    class: "text-[18px] font-[500] font-heading truncate text-text-primary"
  }, email), /* @__PURE__ */ Html9.createElement("p", {
    id: "rdap-abuse-phone",
    class: "text-[14px] font-[400] text-text-primary"
  }, phone)))));
};

// src/components/FaqSection.tsx
import { Html as Html10 } from "@elysiajs/html";
var FaqSection = () => /* @__PURE__ */ Html10.createElement(Html10.Fragment, null, /* @__PURE__ */ Html10.createElement("section", {
  class: "py-0 h-[300px] md:h-[400px] w-full grad-2 relative overflow-hidden flex items-center justify-center"
}, /* @__PURE__ */ Html10.createElement("div", {
  class: "absolute inset-0 bg-primary opacity-20 mix-blend-multiply"
}), /* @__PURE__ */ Html10.createElement("h2", {
  class: "relative z-10 text-[48px] font-[400] leading-[53px] tracking-[-2.88px] font-heading text-surface drop-shadow-lg text-center px-[32px]"
}, "End of Transmission.")), /* @__PURE__ */ Html10.createElement("section", {
  id: "faq",
  class: "py-[40px] flex flex-col items-center bg-surface"
}, /* @__PURE__ */ Html10.createElement("div", {
  class: "max-w-[1280px] w-full px-[32px] flex flex-col gap-5xl"
}, /* @__PURE__ */ Html10.createElement("h4", {
  class: "text-[24px] font-[400] leading-[26.5px] tracking-[-1.44px] font-heading text-center"
}, "Frequently Asked Questions"), /* @__PURE__ */ Html10.createElement("div", {
  class: "flex flex-col gap-[10px] max-w-[800px] mx-auto w-full"
}, /* @__PURE__ */ Html10.createElement("details", {
  class: "group bg-surface hover:bg-background border border-[#D3CFE5] rounded-[14px] overflow-hidden shadow-sm transition-colors duration-150"
}, /* @__PURE__ */ Html10.createElement("summary", {
  class: "cursor-pointer text-[18px] font-[500] font-heading text-secondary px-[24px] py-[16px] flex justify-between items-center outline-none"
}, "Can I buy this domain right now?", /* @__PURE__ */ Html10.createElement("svg", {
  class: "w-5 h-5 text-text-primary transition-transform duration-280 group-open:rotate-180",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor"
}, /* @__PURE__ */ Html10.createElement("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M19 9l-7 7-7-7"
}))), /* @__PURE__ */ Html10.createElement("div", {
  class: "px-[24px] pb-[24px] pt-[16px] text-[14px] font-[400] text-text-primary border-t border-[#D3CFE5] bg-surface"
}, "No. This domain is running through its natural lifecycle and will eventually drop back to the public pool via standard registry processes. We do not entertain private offers.")), /* @__PURE__ */ Html10.createElement("details", {
  class: "group bg-surface hover:bg-background border border-[#D3CFE5] rounded-[14px] overflow-hidden shadow-sm transition-colors duration-150"
}, /* @__PURE__ */ Html10.createElement("summary", {
  class: "cursor-pointer text-[18px] font-[500] font-heading text-secondary px-[24px] py-[16px] flex justify-between items-center outline-none"
}, "When will it be available for registration?", /* @__PURE__ */ Html10.createElement("svg", {
  class: "w-5 h-5 text-text-primary transition-transform duration-280 group-open:rotate-180",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor"
}, /* @__PURE__ */ Html10.createElement("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M19 9l-7 7-7-7"
}))), /* @__PURE__ */ Html10.createElement("div", {
  class: "px-[24px] pb-[24px] pt-[16px] text-[14px] font-[400] text-text-primary border-t border-[#D3CFE5] bg-surface"
}, 'Refer to the "Expiration" date in the Critical Dates section above. Typically, a domain becomes available 30 to 75 days after expiration, depending on the specific Top-Level Domain (TLD) grace period policies.')), /* @__PURE__ */ Html10.createElement("details", {
  class: "group bg-surface hover:bg-background border border-[#D3CFE5] rounded-[14px] overflow-hidden shadow-sm transition-colors duration-150"
}, /* @__PURE__ */ Html10.createElement("summary", {
  class: "cursor-pointer text-[18px] font-[500] font-heading text-secondary px-[24px] py-[16px] flex justify-between items-center outline-none"
}, "Why is this page showing RDAP data?", /* @__PURE__ */ Html10.createElement("svg", {
  class: "w-5 h-5 text-text-primary transition-transform duration-280 group-open:rotate-180",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor"
}, /* @__PURE__ */ Html10.createElement("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M19 9l-7 7-7-7"
}))), /* @__PURE__ */ Html10.createElement("div", {
  class: "px-[24px] pb-[24px] pt-[16px] text-[14px] font-[400] text-text-primary border-t border-[#D3CFE5] bg-surface"
}, "Registration Data Access Protocol (RDAP) is the successor to WHOIS. We display this data to provide clear, immediate transparency about the domain's current status and authoritative registrar contacts without requiring third-party lookup tools."))))), /* @__PURE__ */ Html10.createElement("div", {
  class: "py-[40px] flex flex-col items-center text-center px-[32px]"
}, /* @__PURE__ */ Html10.createElement("p", {
  class: "text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] font-body text-text-muted max-w-[600px]"
}, "The information provided on this page is retrieved live from public RDAP servers. We do not guarantee the accuracy, completeness, or timeliness of the registry data. Use of this domain is subject to ICANN policies.")));

// src/components/Footer.tsx
import { Html as Html11 } from "@elysiajs/html";
var Footer = ({ domain }) => /* @__PURE__ */ Html11.createElement("footer", {
  class: "py-[80px] md:py-[120px] w-full flex flex-col items-center justify-center grad-5 text-surface relative overflow-hidden"
}, /* @__PURE__ */ Html11.createElement("div", {
  class: "absolute inset-0 bg-text-primary opacity-90 mix-blend-multiply"
}), /* @__PURE__ */ Html11.createElement("div", {
  class: "max-w-[1280px] w-full px-[32px] relative z-10 flex flex-col gap-[64px] items-center text-center"
}, /* @__PURE__ */ Html11.createElement("div", {
  class: "flex flex-col gap-2xl items-center"
}, /* @__PURE__ */ Html11.createElement("span", {
  class: "text-[32px] font-[400] leading-[38.5px] tracking-[-1.92px] font-heading text-surface"
}, "Status: Inactive"), /* @__PURE__ */ Html11.createElement("p", {
  class: "text-[16px] font-[400] text-surface max-w-[400px] opacity-90"
}, "This page serves as a final placeholder. No further updates will be made.")), /* @__PURE__ */ Html11.createElement("div", {
  class: "w-full h-px bg-surface opacity-20"
}), /* @__PURE__ */ Html11.createElement("div", {
  class: "flex flex-col md:flex-row justify-between w-full items-center gap-2xl"
}, /* @__PURE__ */ Html11.createElement("span", {
  class: "text-[14px] font-[500] text-surface font-heading",
  id: "footer-domain-name"
}, domain), /* @__PURE__ */ Html11.createElement("span", {
  class: "text-[11.5px] font-[500] leading-[19.5px] tracking-[0.12px] text-surface opacity-90"
}, "Generated automatically upon retirement."))));

// src/views/RetiredPage.tsx
var RetiredPage = ({ domain, data }) => /* @__PURE__ */ Html12.createElement(Layout, {
  title: `${domain} - Domain Retired`
}, /* @__PURE__ */ Html12.createElement(Header, {
  domain
}), /* @__PURE__ */ Html12.createElement("main", {
  class: "flex-grow"
}, /* @__PURE__ */ Html12.createElement(Hero, {
  domain
}), /* @__PURE__ */ Html12.createElement(StatusSection, null), /* @__PURE__ */ Html12.createElement(RdapSection, {
  data
}), /* @__PURE__ */ Html12.createElement(DatesSection, {
  dates: data.dates,
  isFound: data.found
}), /* @__PURE__ */ Html12.createElement(PolicySection, null), /* @__PURE__ */ Html12.createElement(InfrastructureSection, {
  nameservers: data.nameservers,
  entities: data.entities,
  isFound: data.found
}), /* @__PURE__ */ Html12.createElement(AbuseSection, {
  abuse: data.abuse,
  isFound: data.found
}), /* @__PURE__ */ Html12.createElement(FaqSection, null)), /* @__PURE__ */ Html12.createElement(Footer, {
  domain
}));

// src/template.ts
function renderHtml(domain, data) {
  return "<!DOCTYPE html>" + RetiredPage({ domain, data }).toString();
}

// src/index.ts
function extractDomain(request, queryDomain) {
  if (queryDomain && queryDomain.trim()) {
    return queryDomain.trim().toLowerCase().replace(/^www\./, "").split(":")[0];
  }
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).hostname;
  return host.toLowerCase().replace(/^www\./, "").split(":")[0];
}
function invalidDomainResult(domain) {
  return {
    domain,
    tld: "",
    rdapServer: null,
    handle: null,
    status: [],
    registrar: null,
    dnssec: "Unsigned",
    dates: { registration: null, expiration: null, lastChanged: null },
    nameservers: [],
    entities: [],
    abuse: { email: null, phone: null },
    found: false,
    error: "invalid domain"
  };
}
var app = new Elysia({ adapter: WebStandardAdapter }).use(html()).get("/api/rdap", async ({ request, query }) => {
  const domain = extractDomain(request, query.domain);
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain)) {
    return invalidDomainResult(domain);
  }
  return fetchRdap(domain);
}).get("/", async ({ request, query }) => {
  const domain = extractDomain(request, query.domain);
  let rdap;
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain)) {
    rdap = invalidDomainResult(domain);
  } else {
    rdap = await fetchRdap(domain);
  }
  return new Response(renderHtml(domain, rdap), {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}).compile();
var src_default = (req) => app.fetch(req);
export {
  app,
  src_default as default
};
