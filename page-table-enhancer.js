// ==UserScript==
// @name         DP: Page Table Enhancer
// @namespace    dp-tools
// @version      2026-07-28
// @description  Show/hide round column groups and/or tweak table to improve readability/width
// @author       parchmentglow@github
// @match        https://www.pgdp.net/c/tools/project_manager/page_detail.php?project=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(function() {
    "use strict";

    // CONFIGURATION
    // ================================================================
    // Change these values to customize appearance.

    const CONFIG = {
        // Master styling switch
        stylingEnabled: true,
        textTransforms: { // operating on innerHTML of a given <td>. The goal is always to reduce the visual load: information that is known in context and/or overly verbose ("P3_page.")
            "Image": function(text) { // remove extension; it is always a .png!
                return text.replace(/\.png(?=<)/, "")
            },
            "Page State": function(text) { // everything before underscore
                return text
                    .replace(/^.+_/, "")
            },
            "User": function(text) {
                // move user's page-count to detail; move wordcheck symbol before the detail (always visible), with no space/line break opp.; remove break opp from usernames to keep rows consistent height
                return text.replace("&nbsp;", "").replace(/>\s*(\(\d+\))\s*(<span.+span>)/, '>$2 <span class="tm-detail">$1</span>').replace(/(?<=<a .+?)[ ](?=[^<]*?<\/a>)/g, "&nbsp;")
            },
            "Date": function(text) { // remove first two digits of year, add detail to time
                return text.replace(/\d\d(\d\d-\d\d-\d\d)\s*(\d\d:\d\d)/, '$1 <span class="tm-detail">$2</span>')
            },
            "Diff": function(text) { // simplify no-diff display (reduce text load); add formatting-relevant argument to diff for a formatting round (!!!)
                return text.replace(/No\sdiff/, '<span class="nodiff" title="none">◌</span>').replace(/R_round=F1/, "R_round=F1&format=keep" )
            },
        },
        hiddenRoles: [ // Columns always hidden
            // "Page State" //
        ],
        // Initial visibility
        defaultVisible: true,
        customCSS:
`
#page_table {
     border-collapse: collapse;
     font-family: "Open Sans", Lato, Roboto, sans-serif;
}

#page_table td, #page_table th {
     border: none;
     font-size: 0.8em;
}

#page_table th {
	background-color: #f1f3f8 !important;
	color: #0c0c0c !important;
	font-weight: bold !important;
}

td :is(.tm-role-image, .tm-role-text, .tm-role-date) { /* monospace for digits */
    font-family: "Lucida Console", Consolas, "DejaVu Sans Mono", monospace;
}
.tm-role-image {
    text-align:left !important;
}

.tm-role-header.tm-role-i {
    text-align:right !important;
}

.tm-hidden-role { display: none !important; }

.tm-selected-user  {
	box-shadow: inset 0px 0px 3px 5px #aab;
	outline: 2px solid #aaa;
}

.nodiff { opacity: 40%; }
.diff   { }

/* there is no value in differentiating prev/current-round "done" */
.done_current, .done_previous { background-color: #404658 !important; color: #fff; }
.done_current a, .done_previous a, .in_progress a { color: #fff !important; }

/* reiterate this default, given other background declarations */
.in_progress { background-color: #ffcc66 !important}

#page_table a {
    text-decoration: none !important;
}

#page_table th,
#page_table td {
    padding: 4px 5px;
}

.tm-role-image.tm-role-header { font-size: 50% !important; } /* the only heading that is wider than its contents; reduces table width */

/* change one of the two alternating row backgrounds to some gray, modified below with round-color and opacity */
#page_table tr:nth-child(2n+1) {
	background-color: #ddd;
}

/* define colors to separate rounds; roughly copying table color backgrounds in those rounds, but P1 and P2 are same */
:root {
    --round-p1-color: #fed8d8;
    --round-p2-color: #d1ebbc;
    --round-p3-color: #d3e2ff;
    --round-f1-color: #fed8d8;
    --round-f2-color: #d3e2ff;
}

/* add border separator to the last column of the round; combine with color differences below */
.tm-role-text.tm-round, .tm-role-page-state {
    border-right-width: 2px !important;
    border-right-style: solid !important;
}

/* assign colors to the long borders of rounds  */
.tm-role-page-state       { border-right-color: #AAA !important; }
.tm-role-text.tm-round-p1 { border-right-color: color-mix(in srgb, var(--round-p1-color) 80%, black 20%) !important; }
.tm-role-text.tm-round-p2 { border-right-color: color-mix(in srgb, var(--round-p2-color) 80%, black 20%) !important; }
.tm-role-text.tm-round-p3 { border-right-color: color-mix(in srgb, var(--round-p3-color) 80%, black 20%) !important; }
.tm-role-text.tm-round-f1 { border-right-color: color-mix(in srgb, var(--round-f1-color) 80%, black 20%) !important; }
.tm-role-text.tm-round-f2 { border-right-color: color-mix(in srgb, var(--round-f2-color) 80%, black 20%) !important; }

/* assign borders to the "round" cells at top */
.tm-round-p1.tm-group-header {
border-right: 2px solid color-mix(in srgb, var(--round-p1-color) 80%, black 20%) !important;
border-left: 2px solid color-mix(in srgb, var(--round-p1-color) 80%, black 20%) !important;
border-bottom: 2px solid color-mix(in srgb, var(--round-p1-color) 80%, black 20%) !important;
}
.tm-round-p2.tm-group-header {
border-right: 2px solid color-mix(in srgb, var(--round-p2-color) 80%, black 20%) !important;
border-left: 2px solid color-mix(in srgb, var(--round-p2-color) 80%, black 20%) !important;
border-bottom: 2px solid color-mix(in srgb, var(--round-p2-color) 80%, black 20%) !important;
}
.tm-round-p3.tm-group-header {
border-right: 1px solid color-mix(in srgb, var(--round-p3-color) 80%, black 20%) !important;
border-left: 1px solid color-mix(in srgb, var(--round-p3-color) 80%, black 20%) !important;
border-bottom: 3px solid color-mix(in srgb, var(--round-p3-color) 80%, black 20%) !important;
}
.tm-round-f1.tm-group-header {
border-right: 1px solid color-mix(in srgb, var(--round-f1-color) 80%, black 20%) !important;
border-left: 1px solid color-mix(in srgb, var(--round-f1-color) 80%, black 20%) !important;
border-bottom: 3px solid color-mix(in srgb, var(--round-f1-color) 80%, black 20%) !important;
}
.tm-round-f2.tm-group-header {
border-left: 1px solid color-mix(in srgb, var(--round-f2-color) 80%, black 20%) !important;
border-bottom: 3px solid color-mix(in srgb, var(--round-f2-color) 80%, black 20%) !important;
} /* hacks for under-specified first three cells: */
tr:first-child > td:nth-child(3) {
border-right: 2px solid #AAA !important;
}
tr:first-child > :is(td:nth-child(1), td:nth-child(2), td:nth-child(3)) {
border-bottom: 2px solid #AAA !important;
}

.tm-round { position: relative; } /* this is required for background alterations below */

td.tm-round-p1 {
  background-color: color-mix(in srgb, var(--round-p1-color) 15%, transparent);
}
td.tm-round-p2 {
  background-color: color-mix(in srgb, var(--round-p2-color) 15%, transparent);
}
td.tm-round-p3 {
  background-color: color-mix(in srgb, var(--round-p3-color) 15%, transparent);
}
td.tm-round-f1 {
  background-color: color-mix(in srgb, var(--round-f1-color) 15%, transparent);
}
td.tm-round-f2 {
  background-color: color-mix(in srgb, var(--round-f2-color) 15%, transparent);
}

/* used to show and hide "details" */
.tm-detail {
    display: none;
}
.tm-detail-visible .tm-detail {
    display: inline;
}

td.tm-role-user a, td.tm-role-diff a { /* captures user name and diff */
    font-weight: bold;
}
td.tm-role-user span[title] { /* captures wordcheck symbols */
    opacity: 70%;
    font-size: 0.7em;
    font-style: italic;
}
`,
    };

    // GLOBAL STATE
    // ================================================================

    const STATE = {
        table: null,
        model: {
            // Example:
            //
            // rounds: [
            //     {
            //         name: "P1",
            //         columns: [
            //             {
            //                 index: 4,
            //                 role: "Diff"
            //             }
            //         ]
            //     }
            // ]
            rounds: [],
            columns: [],
            headerRows: {
                group: null,
                role: null
            }
        },
        stylesheet: null,
        permanentStylesheet: null,
        toolbar: null,
        highlightedUser: null,
        showDetail: false,
    };

    // STARTUP
    // ================================================================

    const thatTable = document.getElementById("page_table");
    if (thatTable) { thatTable.style.visibility = "hidden"; } // prevent flashing of old table
    unsafeWindow.tmstate = STATE; // debugging method for the console
    initialize();

    function initialize() {
        waitForTable()
            .then(table => {
            STATE.table = table;
            buildModel();
            annotateCells();

            // keep the detail style separate of styling yes/no (removes all CSS) for the 'detail' option
            const style = document.createElement("style");
            style.textContent = `.tm-detail { display: none; } .tm-detail-visible .tm-detail { display: inline; }`;
            document.head.appendChild(style);
            STATE.permanentStylesheet = style;

            if (CONFIG.stylingEnabled) installStyles();
            buildToolbar();
            applyStoredVisibility();
            STATE.table.style.visibility = "visible";
            applyDetailVisibility();
            installUserClickHandler();
        });
    }

    // WAIT FOR TABLE
    // ================================================================
    //
    // We've hid the original table elsewhere; don't start until the
    // page is finished or the script may not change all the table
    // rows. But we want immediate @run-at to hide the original table
    // as early as possible, to prevent flashing of before/after.

    function waitForTable() {
        return new Promise(resolve => {
            function check() {
                const table = document.querySelector("#page_table");
                if (!table)
                    return false;
                if (document.readyState === "loading")
                    return false;
                resolve(table);
                return true;
            }
            if (check())
                return;

            document.addEventListener("readystatechange", function onReady() {
                if (check()) {
                    document.removeEventListener("readystatechange", onReady);
                }
            });
        });
    }

    // BUILD SEMANTIC MODEL
    // ================================================================

    function buildModel() {

        const table = STATE.table;
        const rows = table.rows;
        if (rows.length < 2) return;
        const groupHeader = rows[0];
        const roleHeader = rows[1];
        STATE.model.headerRows.group = groupHeader;
        STATE.model.headerRows.role = roleHeader;
        discoverRounds(groupHeader);
        discoverRoles(roleHeader);
    }

    // DISCOVER ROUND GROUPS
    // ================================================================

    function discoverRounds(row) {
        let logicalColumn = 0;
        for (const cell of row.cells) {
            const label = cell.textContent.trim();
            const span = cell.colSpan || 1;
            if (label && label !== "Upload") {
                const columns = [];
                for (let i = 0; i < span; i++) {
                    columns.push(logicalColumn + i);
                }
                STATE.model.rounds.push({
                    name: label,
                    columns: columns,
                    headerCell: cell
                });
            }
            logicalColumn += span;
        }
    }

    // DISCOVER COLUMN ROLES
    // ================================================================

    function discoverRoles(row) {
        let logicalColumn = 0;
        for (const cell of row.cells) {
            const role = cell.textContent.trim();
            STATE.model.columns.push({
                index: logicalColumn,
                role: role
            });
            logicalColumn++;
        }
    }

    // Part 2: Semantic DOM Annotation
    // ================================================================
    //
    // This section adds meaningful classes to cells.
    // CSS will work with these classes instead of column numbers.

    function annotateCells() {
        const table = STATE.table;
        const roundLookup = {};
        const roleLookup = {};
        for (const round of STATE.model.rounds) {
            for (const column of round.columns) {
                roundLookup[column] = round.name;
            }
        }
        for (const column of STATE.model.columns) {
            roleLookup[column.index] = column.role;
        }
        for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
            const row = table.rows[rowIndex];
            let logicalColumn = 0;
            for (const cell of row.cells) {
                const span = cell.colSpan || 1;
                for (let i = 0; i < span; i++) {
                    const columnIndex = logicalColumn + i;
                    applyCellClasses(
                        cell,
                        columnIndex,
                        rowIndex,
                        roundLookup,
                        roleLookup
                    );
                }
                logicalColumn += span;
            }
        }
    }

    // APPLY SEMANTIC CLASSES
    // ================================================================
    function applyCellClasses(cell, columnIndex, rowIndex, roundLookup, roleLookup) {
        const round = roundLookup[columnIndex];
        const role = roleLookup[columnIndex];
        if (round) {
            cell.classList.add("tm-round","tm-round-" + safeClass(round));
        }
        if (role && rowIndex !== 0) {
            cell.classList.add("tm-role", "tm-role-" + safeClass(role));
        }
        if (rowIndex === 0) {
            cell.classList.add("tm-group-header");
        }
        if (rowIndex === 1) {
            cell.classList.add("tm-role-header");
        }
        if ( CONFIG.hiddenRoles.includes(role) ) {
            cell.classList.add("tm-hidden-role");
        }
        applyTextTransform(cell, role);
    }

    function applyTextTransform(cell, role) {
        const transform = CONFIG.textTransforms?.[role];
        if (!transform) return;
        cell.innerHTML = transform(cell.innerHTML.trim());
    }

    // CLASS NAME SAFETY
    // ================================================================
    function safeClass(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    // Part 3: Generated Stylesheet
    // ================================================================
    //
    // Creates CSS from CONFIG.
    // No column numbers are used here.
    function installStyles() {
        if (STATE.stylesheet) return;
        const style = document.createElement("style");
        style.id = "table-enhancer-style";
        style.textContent = CONFIG.customCSS;
        document.head.appendChild(style);
        STATE.stylesheet = style;
    }

    function removeStyles() {
        if (!STATE.stylesheet) return;
        STATE.stylesheet.remove();
        STATE.stylesheet = null;
    }

    // Toggle styling on/off
    // ================================================================
    function setStyling(enabled) {
        CONFIG.stylingEnabled = enabled;
        if (enabled) installStyles();
        else removeStyles();
    }

    // Part 4: Toolbar, Persistence, Visibility
    // ================================================================
    function buildToolbar() {
        const toolbar = document.createElement("div");
        toolbar.id = "tm-toolbar";
        toolbar.style.display = "flex";
        toolbar.style.flexWrap = "wrap";
        toolbar.style.alignItems = "center";
        toolbar.style.gap = "14px";
        toolbar.style.padding = "6px 8px";
        toolbar.style.marginBottom = "10px";
        toolbar.style.border = "1px solid #aaa";
        toolbar.style.background = "#f8f8f8";
        for (const round of STATE.model.rounds) {
            toolbar.appendChild(createRoundCheckbox(round.name));
        }
        toolbar.appendChild(createStyleCheckbox());
        toolbar.appendChild(createDetailCheckbox());
        STATE.table.parentNode.insertBefore(toolbar, STATE.table);
        STATE.toolbar = toolbar;
    }

    // Round checkbox
    // ================================================================
    function createRoundCheckbox(roundName) {
        const label = document.createElement("label");
        label.style.whiteSpace = "nowrap";
        label.style.cursor = "pointer";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        const key = storageKey("round", roundName);
        checkbox.checked = GM_getValue(key, CONFIG.defaultVisible);
        checkbox.addEventListener("change", () => {
            GM_setValue(key, checkbox.checked);
            setRoundVisibility(roundName, checkbox.checked);
        });
        label.appendChild(checkbox);
        label.append(" " + roundName);
        return label;
    }

    // Style checkbox
    // ================================================================
    function createStyleCheckbox() {

        const label = document.createElement("label");
        label.style.whiteSpace = "nowrap";
        label.style.cursor = "pointer";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = GM_getValue("tm-style-enabled", CONFIG.stylingEnabled);
        checkbox.addEventListener("change", () => {
            GM_setValue("tm-style-enabled", checkbox.checked);
            setStyling(checkbox.checked);
        });
        label.appendChild(checkbox);
        label.append(" Styling");
        return label;
    }

    function createDetailCheckbox() {
        const label = document.createElement("label");
        label.style.whiteSpace = "nowrap";
        label.style.cursor = "pointer";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = GM_getValue("tm-show-detail", false);
        STATE.showDetail = checkbox.checked;
        checkbox.addEventListener("change", () => {
            STATE.showDetail = checkbox.checked;
            GM_setValue("tm-show-detail", checkbox.checked);
            applyDetailVisibility();
        });
        label.appendChild(checkbox);
        const span = document.createElement("span");
        span.title = "time and page count";
        span.textContent = " Detail";
        label.appendChild(span);
        return label;
    }

    // Apply stored visibility
    // ================================================================
    function applyStoredVisibility() {
        for (const round of STATE.model.rounds) {
            const visible = GM_getValue(storageKey("round", round.name), CONFIG.defaultVisible);
            setRoundVisibility(round.name, visible);
        }
    }

    function applyDetailVisibility() {
        STATE.table.classList.toggle("tm-detail-visible", STATE.showDetail);
    }

    // Show/hide round
    // ================================================================
    function setRoundVisibility(roundName, visible) {
        const className = ".tm-round-" + safeClass(roundName);
        const cells = STATE.table.querySelectorAll(className);
        for (const cell of cells) {
            cell.style.display = visible ? "" : "none";
        }
        forceTableResize();
    }

    // Force table recalculation
    // ================================================================
    function forceTableResize() {
        const table = STATE.table;
        const oldWidth = table.style.width;
        table.style.width = "1px";
        requestAnimationFrame( () => {
            table.style.width = oldWidth || "min-content";
        });
    }

    // User click support
    // ================================================================
    function installUserClickHandler() {
        STATE.table.addEventListener("click", handleUserClick);
    }

    // Handle click on User cell: assign a class to all User cells
    // that have the same username. Or remove it.
    // ================================================================

    function handleUserClick(event) {
        const cell = event.target.closest(".tm-role-user");
        if (!cell) return;
        const user = cell.querySelector("a")?.textContent.trim();
        // Remove any previous highlight
        if (STATE.highlightedUser !== null) {
            STATE.table.querySelectorAll(".tm-selected-user")
                .forEach(cell => cell.classList.remove("tm-selected-user"));
            // Toggle off if clicking the same user again, i.e. exit without doing any more
            if (user === STATE.highlightedUser) {
                STATE.highlightedUser = null;
                return;
            }
        }
        // Highlight all matching users
        STATE.highlightedUser = user;
        STATE.table.querySelectorAll(".tm-role-user a").forEach(link => {
            if (link.textContent.trim() === user) {
                link.closest(".tm-role-user").classList.add("tm-selected-user");
            }
        });
    }

    // Storage keys
    // ================================================================
    function storageKey(type, value) {
        return ("tm-table-" + type + "-" + safeClass(value));
    }
})();
