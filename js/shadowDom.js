// Shadow DOM repro harness for APP-158449
// Builds taggable elements inside OPEN shadow roots so the Designer's
// feature-tagging selector suggestions can be exercised across shadow boundaries.
// Expected: the Designer recommends a rule using `::shadow`. The customer
// (Thomson Reuters, sub "Thomson_Reuters_Communit") sees plain selectors that
// cross the boundary WITHOUT `::shadow`, so the rule matches nothing.
//
// Per the bug-ticket screenshots, the customer site uses "Saffron" (SAF) web
// components (<saf-menu-item>, <saf-anchor>) with NATIVE open shadow roots and
// <slot>s. Cases 1-2 are simple controls; Case 3 faithfully mirrors the SAF
// structure (custom elements + slots) that actually reproduced the bug.
(function () {
    function buildShadowContent(root, opts) {
        var card = document.createElement('div');
        card.className = 'shadow-card';
        card.id = opts.cardId;

        var heading = document.createElement('h3');
        heading.className = 'shadow-card__title';
        heading.textContent = opts.title;

        var saveBtn = document.createElement('button');
        saveBtn.className = 'shadow-card__action btn-save';
        saveBtn.id = opts.saveId;
        saveBtn.textContent = 'Save Report';

        var exportBtn = document.createElement('button');
        exportBtn.className = 'shadow-card__action btn-export';
        exportBtn.id = opts.exportId;
        exportBtn.textContent = 'Export Data';

        var style = document.createElement('style');
        style.textContent =
            '.shadow-card{border:2px dashed #007bff;border-radius:8px;padding:16px;margin:8px 0;background:#f4f8ff;}' +
            '.shadow-card__title{margin:0 0 12px;font-size:16px;color:#0b3d91;}' +
            '.shadow-card__action{margin-right:8px;padding:8px 14px;border:0;border-radius:4px;' +
            'background:#007bff;color:#fff;font-weight:bold;cursor:pointer;}';

        card.appendChild(heading);
        card.appendChild(saveBtn);
        card.appendChild(exportBtn);
        root.appendChild(style);
        root.appendChild(card);
        return card;
    }

    // --- Saffron-style custom elements (native open shadow + slots) ----------

    // Mirrors <saf-anchor>: a link wrapper whose icon + label live INSIDE its
    // open shadow root. Tagging the inner "View API" element must cross the
    // shadow boundary -> the suggestion should use `::shadow`.
    if (!customElements.get('saf-anchor-demo')) {
        customElements.define(
            'saf-anchor-demo',
            class extends HTMLElement {
                connectedCallback() {
                    if (this.shadowRoot) {
                        return;
                    }
                    var root = this.attachShadow({ mode: 'open' });
                    var style = document.createElement('style');
                    style.textContent =
                        '.devex-card__link--icon{display:inline-flex;align-items:center;gap:6px;' +
                        'color:#007bff;font-weight:bold;cursor:pointer;}';
                    var iconWrap = document.createElement('div');
                    iconWrap.className = 'devex-card__link--icon';
                    // The element the customer tagged: a div inside the shadow root.
                    var label = document.createElement('div');
                    label.textContent = this.getAttribute('label') || 'View API';
                    iconWrap.appendChild(label);
                    root.appendChild(style);
                    root.appendChild(iconWrap);
                }
            }
        );
    }

    // Mirrors <saf-menu-item id="App management">: shadow root with a <slot>,
    // and a LIGHT-DOM label projected into it. Tagging the slotted label tends
    // to fall back to the host id selector (`#App management`) -- which is
    // invalid CSS because the id contains a space -> "Target element not found".
    if (!customElements.get('saf-menu-item-demo')) {
        customElements.define(
            'saf-menu-item-demo',
            class extends HTMLElement {
                connectedCallback() {
                    if (this.shadowRoot) {
                        return;
                    }
                    var root = this.attachShadow({ mode: 'open' });
                    var rootDiv = document.createElement('div');
                    rootDiv.className = 'root';
                    rootDiv.setAttribute('part', 'root');
                    var startSlot = document.createElement('slot');
                    startSlot.setAttribute('name', 'start');
                    var content = document.createElement('span');
                    content.className = 'content';
                    content.setAttribute('part', 'content');
                    content.appendChild(document.createElement('slot')); // default slot
                    rootDiv.appendChild(startSlot);
                    rootDiv.appendChild(content);
                    root.appendChild(rootDiv);
                }
            }
        );
    }

    document.addEventListener('DOMContentLoaded', function () {
        // --- Case 1: single open shadow root (control) -----------------------
        var host = document.getElementById('shadow-host');
        if (host) {
            var shadow = host.attachShadow({ mode: 'open' });
            buildShadowContent(shadow, {
                cardId: 'reports-card',
                title: 'Reports (inside open shadow DOM)',
                saveId: 'shadow-save',
                exportId: 'shadow-export'
            });
        }

        // --- Case 2: nested open shadow roots (control) ----------------------
        var outerHost = document.getElementById('shadow-host-nested');
        if (outerHost) {
            var outerShadow = outerHost.attachShadow({ mode: 'open' });
            var innerHost = document.createElement('div');
            innerHost.id = 'inner-shadow-host';
            innerHost.className = 'outer-shadow-wrapper';
            outerShadow.appendChild(innerHost);
            var innerShadow = innerHost.attachShadow({ mode: 'open' });
            buildShadowContent(innerShadow, {
                cardId: 'settings-card',
                title: 'Settings (inside nested open shadow DOM)',
                saveId: 'nested-save',
                exportId: 'nested-export'
            });
        }

        // --- Case 3: Saffron-style web components (the real customer pattern) -
        var safMount = document.getElementById('saf-components-mount');
        if (safMount) {
            // 3a: card link with the tagged element INSIDE saf-anchor's shadow.
            var container = document.createElement('div');
            container.className = 'devex-card__container';
            var cardDiv = document.createElement('div');
            cardDiv.className = 'devex-card';
            var controls = document.createElement('div');
            controls.className = 'devex-card__controls';
            var link = document.createElement('a');
            link.className = 'devex-card__link';
            link.href = '#api-catalog';
            var safAnchor = document.createElement('saf-anchor-demo');
            safAnchor.setAttribute('label', 'View API');
            link.appendChild(safAnchor);
            controls.appendChild(link);
            cardDiv.appendChild(controls);
            container.appendChild(cardDiv);
            safMount.appendChild(container);

            // 3b: menu item with a LIGHT-DOM label slotted into the shadow root,
            // and an id containing a space (reproduces the `#App management` case).
            var menuItem = document.createElement('saf-menu-item-demo');
            menuItem.id = 'App management';
            menuItem.setAttribute('url', '/app-management');
            var menuLabel = document.createElement('span');
            menuLabel.setAttribute('aria-label', 'App management');
            menuLabel.textContent = 'App management';
            menuItem.appendChild(menuLabel); // projected into the default <slot>
            safMount.appendChild(menuItem);
        }
    });
})();
