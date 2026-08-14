"""Add a vintage badge to every embedded dashboard.

One badge, one implementation, eight files. The pages are static snapshots and
none of them said so; the badge is the cheap fix the audit asked for before the
expensive one (generating the embedded data at build time).
"""
import os
import sys

BASE = '/Users/matthiasalma/Downloads/nock_agent_export/investment-dashboard/public/dashboards'

# date, human label, whether the date is an approximation the page does not
# state itself. Every label echoes what the page already claims in its kicker.
VINTAGES = {
    'agentic.html': ('2026-07-09', 'source note dated 9 July 2026', False),
    'crypto-vc.html': ('2026-08-13', 'database built 13 August 2026', False),
    'crypto.html': ('2026-08-12', 'market data 12 August 2026', False),
    'defense.html': ('2026-08-11', 'market data 11 August 2026', False),
    'digital-biology.html': ('2026-07-07', 'Q1 2026 reporting cycle, transcribed early July 2026', True),
    'photonics.html': ('2026-08-07', 'market data 7 August 2026 close', False),
    'quantum.html': ('2026-07-15', 'company and federal disclosures, mid-July 2026', True),
    'robotics.html': ('2026-07-09', 'Q1 2026 reporting cycle, transcribed early July 2026', True),
}

CSS = """
  /* ---------- vintage badge ----------
     Every page in this set is a frozen snapshot and none of them said so. The
     date below is the page's own claim about itself; the age is computed
     against the reader's clock, so the badge cannot go quietly out of date the
     way a hardcoded "recent" would. */
  .vintage{border-bottom:1px solid var(--line); background:var(--panel)}
  .vintage .wrap{display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 14px; padding:9px 0; font-family:var(--mono); font-size:.7rem; letter-spacing:.04em}
  .vintage .lbl{color:var(--ink-3); text-transform:uppercase; letter-spacing:.14em}
  .vintage .src{color:var(--ink-2)}
  .vintage .age{color:var(--ink-2)}
  .vintage.stale{border-bottom-color:#fb8b1e}
  .vintage.stale .age{color:#fb8b1e; font-weight:600}
"""

MARKUP = """
<div class="vintage" id="vintageBadge" data-vintage="{date}" data-label="{label}"{approx}>
  <div class="wrap">
    <span class="lbl">Data vintage</span>
    <span class="src"></span>
    <span class="age"></span>
  </div>
</div>
"""

SCRIPT = """
<script>
/* The one thing on this page that knows what today is. Fourteen days is the
   threshold because it is roughly one reporting cycle: past it, a price here is
   decoration and the reader should be told so rather than left to check the
   footer. */
(function(){
  var el = document.getElementById('vintageBadge');
  if(!el) return;
  var approx = el.getAttribute('data-approx') === '1';
  var days = Math.floor((Date.now() - Date.parse(el.getAttribute('data-vintage') + 'T00:00:00Z')) / 86400000);
  el.querySelector('.src').textContent = (approx ? '\\u2248 ' : '') + el.getAttribute('data-label');
  var age = el.querySelector('.age');
  if(!isFinite(days) || days < 0){ age.textContent = ''; return; }
  age.textContent = '\\u00b7 ' + days + ' day' + (days === 1 ? '' : 's') + ' old' + (days > 14 ? ' \\u00b7 treat as stale' : '');
  if(days > 14) el.classList.add('stale');
})();
</script>
"""


def main():
    for name, (date, label, approx) in sorted(VINTAGES.items()):
        path = os.path.join(BASE, name)
        s = open(path).read()
        if 'vintageBadge' in s:
            print('skip (already has badge):', name)
            continue

        assert s.count('</style>') == 1, name
        s = s.replace('</style>', CSS + '</style>', 1)

        markup = MARKUP.format(date=date, label=label, approx=' data-approx="1"' if approx else '')
        assert s.count('</nav>') >= 1, name
        s = s.replace('</nav>', '</nav>\n' + markup, 1)

        assert s.count('</body>') == 1, name
        s = s.replace('</body>', SCRIPT + '\n</body>', 1)

        open(path, 'w').write(s)
        print('badged:', name, date, 'approx' if approx else '')


if __name__ == '__main__':
    sys.exit(main())
