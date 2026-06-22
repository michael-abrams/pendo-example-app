// Shadow DOM repro harness for APP-158449
// Builds OPEN shadow roots containing taggable elements so the Designer's
// feature-tagging selector suggestions can be exercised across shadow boundaries.
// The Designer should recommend a rule using `::shadow`; the bug is that it does not.
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

        // Minimal styling so the shadow content is visible inside the encapsulated tree.
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

    document.addEventListener('DOMContentLoaded', function () {
        // --- Case 1: single open shadow root ---------------------------------
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

        // --- Case 2: nested open shadow roots (host -> shadow -> host -> shadow)
        // Mirrors multi-level shadow trees (e.g. web-component frameworks) where
        // the selector must cross more than one boundary.
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
    });
})();
