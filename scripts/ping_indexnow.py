#!/usr/bin/env python3
"""
Small helper run by Netlify to ping Bing's IndexNow endpoint after each deploy.
It pulls every <loc> entry from sitemap.xml to avoid hard-coding URLs.
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
SITEMAP_PATH = ROOT_DIR / "sitemap.xml"
HOST = "elevenlabs-avis.com"
INDEXNOW_ENDPOINT = "https://www.bing.com/indexnow"
KEY = "86d6de34443f43b0b86d521ae8e4d4f9"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
SITEMAP_NS = {
    "sm": "http://www.sitemaps.org/schemas/sitemap/0.9",
    "xhtml": "http://www.w3.org/1999/xhtml",
}


def load_urls_from_sitemap() -> list[str]:
    if not SITEMAP_PATH.exists():
        print(f"[IndexNow] sitemap missing at {SITEMAP_PATH}, skipping ping.")
        return []

    tree = ET.parse(SITEMAP_PATH)
    urls: list[str] = []
    seen: set[str] = set()

    for loc in tree.findall(".//sm:loc", namespaces=SITEMAP_NS):
        if loc.text:
            url = loc.text.strip()
            if url and url not in seen:
                urls.append(url)
                seen.add(url)

    # Include hreflang alternates so new languages are also pinged.
    for link in tree.findall(".//xhtml:link", namespaces=SITEMAP_NS):
        href = link.attrib.get("href", "").strip()
        if href and href not in seen:
            urls.append(href)
            seen.add(href)

    if not urls:
        print("[IndexNow] No <loc> entries found in sitemap, nothing to ping.")

    return urls


def ping_indexnow(urls: list[str]) -> None:
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }

    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read().decode("utf-8", errors="ignore")
        print(f"[IndexNow] Bing responded with HTTP {response.status}: {body or 'No body'}")


def main() -> int:
    urls = load_urls_from_sitemap()
    if not urls:
        return 0

    try:
        ping_indexnow(urls)
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", errors="ignore")
        print(f"[IndexNow] HTTPError {err.code}: {detail}")
    except urllib.error.URLError as err:
        print(f"[IndexNow] URLError: {err.reason}")
    except Exception as exc:  # pragma: no cover (defensive)
        print(f"[IndexNow] Unexpected error: {exc}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
