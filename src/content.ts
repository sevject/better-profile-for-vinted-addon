// On your own Vinted profile, the two description lines under each item
// (brand, then size · condition) are replaced by views and favourites.
// This script loads your wardrobe from Vinted's API and adds title, brand,
// size and condition above the stats, each on its own line.

interface WardrobeItem {
  id: number;
  title?: string;
  can_edit?: boolean;
  brand?: string | null;
  size?: string | null;
  status?: string | null;
}

interface WardrobeResponse {
  items: WardrobeItem[];
  pagination: { current_page: number; total_pages: number };
}

interface Wardrobe {
  userId: string;
  // Description lines per item id, or null for items you don't own.
  lines: Map<string, string[] | null>;
  nextPage: number;
  totalPages: number;
  loading: boolean;
}

const PER_PAGE = 96;
const INJECTED_ATTR = 'data-better-profile';
const DESCRIPTION_ID = /^product-item-id-(\d+)--description$/;

// Firefox's content.fetch sends the request as the page itself, with your
// Vinted login cookies, so no extra permissions are needed.
declare const content: { fetch: typeof fetch } | undefined;
const pageFetch: typeof fetch =
  typeof content !== 'undefined' && content?.fetch ? content.fetch.bind(content) : fetch;

let wardrobe: Wardrobe | null = null;

function currentUserId(): string | null {
  return location.pathname.match(/^\/member\/(\d+)/)?.[1] ?? null;
}

function descriptionLines(item: WardrobeItem): string[] {
  // Title, brand, size and condition, each on its own line; empty values are skipped.
  // Vinted sometimes words sizes differently ("EU 36" instead of "S / 36 / 8");
  // the API only has the long form, so that one is used.
  return [item.title, item.brand, item.size, item.status].filter(
    (line): line is string => !!line,
  );
}

async function loadNextPage(w: Wardrobe): Promise<void> {
  w.loading = true;
  try {
    const url = `/api/v2/wardrobe/${w.userId}/items?page=${w.nextPage}&per_page=${PER_PAGE}`;
    const response = await pageFetch(url, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: WardrobeResponse = await response.json();

    for (const item of data.items) {
      w.lines.set(String(item.id), item.can_edit ? descriptionLines(item) : null);
    }
    // Someone else's profile: nothing to add, so don't load further pages.
    const isOwnWardrobe = data.items.some((item) => item.can_edit);
    w.totalPages = isOwnWardrobe ? data.pagination.total_pages : 0;
    w.nextPage++;
  } catch (error) {
    console.warn('[Better Profile for Vinted] Could not load wardrobe:', error);
    w.totalPages = 0; // stop paging until the next profile visit
  } finally {
    w.loading = false;
  }
}

function inject(container: Element, itemId: string, lines: string[]): void {
  const existing = new Set(
    Array.from(container.querySelectorAll('p'), (p) => p.textContent?.trim()),
  );
  const missing = lines.filter((line) => !existing.has(line));

  // Reuse the subtitle's font classes so the lines match Vinted's styling.
  const subtitle = container.querySelector(
    `[data-testid="product-item-id-${itemId}--description-subtitle"]`,
  );

  const block = document.createElement('div');
  block.setAttribute(INJECTED_ATTR, '');
  block.style.cssText = 'display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px;';
  for (const line of missing) {
    const row = document.createElement('p');
    if (subtitle) row.className = subtitle.className;
    // Vinted truncates description lines to one line with "…"; wrap instead.
    row.style.cssText =
      'margin: 0; white-space: normal; overflow: visible; text-overflow: clip; overflow-wrap: anywhere;';
    row.textContent = line;
    block.append(row);
  }
  container.prepend(block);

  // On your own profile the description area is a row, which would put the
  // stats beside the new lines. Stack them so every line gets the full width.
  const style = (container as HTMLElement).style;
  style.display = 'flex';
  style.flexDirection = 'column';
  style.alignItems = 'stretch';
}

function scan(): void {
  const userId = currentUserId();
  if (!userId) return;
  if (wardrobe?.userId !== userId) {
    wardrobe = { userId, lines: new Map(), nextPage: 1, totalPages: 1, loading: false };
  }
  const w = wardrobe;

  let hasUnknownItems = false;
  document.querySelectorAll('[data-testid$="--description"]').forEach((container) => {
    const itemId = container.getAttribute('data-testid')?.match(DESCRIPTION_ID)?.[1];
    if (!itemId || container.querySelector(`[${INJECTED_ATTR}]`)) return;

    if (!w.lines.has(itemId)) hasUnknownItems = true;
    const lines = w.lines.get(itemId);
    if (lines) inject(container, itemId, lines);
  });

  // Cards appear as you scroll, so load more of the wardrobe only when needed.
  if (hasUnknownItems && !w.loading && w.nextPage <= w.totalPages) {
    loadNextPage(w).then(scan);
  }
}

let scheduled = false;
function scheduleScan(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    scan();
  });
}

// Vinted is a single-page app: it re-renders cards and changes the URL
// without reloading, so watch the page instead of running once.
new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
scan();
