// SPDX-FileCopyrightText: 2023 XWiki CryptPad Team <contact@cryptpad.org> and contributors
//
// SPDX-License-Identifier: AGPL-3.0-or-later

define([
    'jquery',
    '/components/nthen/index.js',
    '/common/common-interface.js',
    '/common/common-ui-elements.js',
    '/common/common-util.js',
    '/common/common-hash.js',
    '/customize/messages.js',
    '/common/hyperscript.js',
], function(
    $,
    nThen,
    UI,
    UIElements,
    Util,
    Hash,
    Messages,
    h,
) {
    const Sidebar = {};


    Sidebar.create = function (common, app, $leftside, $rightside) {
        const sidebar = {};
        const items = {};

        let blocks = sidebar.blocks = {};
        blocks.labelledInput = (label, input) => {
            let uid = Util.uid();
            let id = `cp-${app}-item-${uid}`;
            input.setAttribute('id', id);
            return [
                h('label', { for: id }, label),
                input,
            ];
        };
        blocks.button = (type, icon, text) => {
            type = type || 'primary';
            if (icon && icon.indexOf('-') !== -1) {
                let prefix = icon.slice(0, icon.indexOf('-'));
                icon = `${prefix} ${icon}`;
            }
            return h(`button.btn.btn-${type}`, [
                icon ? h('i', { 'class': icon }) : undefined,
                h('span', text)
            ]);
        }
        blocks.nav = (buttons) => {
            return h('nav', buttons);
        };
        blocks.form = (content, nav) => {
            return h('div.cp-sidebar-form', [content, nav]);
        };


        sidebar.addItem = (key, get) => {
            const safeKey = key.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
            get((content, config) => {
                config = config || {};
                const title = h('label.cp-item-label',
                    Messages[`${app}_${safeKey}Title`] || key);
                const hint = h('span.cp-sidebarlayout-description',
                    Messages[`${app}_+${safeKey}Hint`] || 'Coming soon...');
                //const div = h(`div.cp-sidebarlayout-element.cp-${app}-${key}`, {
                const div = h(`div.cp-sidebarlayout-element`, {
                    'data-item': key,
                    style: 'display:none;'
                }, [
                    !config.noTitle ? title : undefined,
                    !config.noHint ? hint : undefined,
                    content
                ]);
                items[key] = div;
                $rightside.append(div);
            });
        };

        var hideCategories = function () {
            Object.keys(items).forEach(key => { $(items[key]).hide(); });
        };
        var showCategories = function (cat) {
            if (!cat || !Array.isArray(cat.content)) {
                console.error("Invalid category", cat);
                return UI.warn(Messages.error);
            }
            hideCategories();
            cat.content.forEach(function (c) { $(items[c]).show(); });
        };
        /*
        categories = {
            key1: {
                icon: 'fa fa-user',
                content: [ 'item1', 'item2' ]
            }
            key2: {
                icon: 'fa fa-bell',
                onClick: function () {}
            }
        }
        */
        sidebar.makeLeftside = (categories) => {
            $leftside.html('');
            let container = h('div.cp-sidebarlayout-categories', { role: 'menu' });
            var metadataMgr = common.getMetadataMgr();
            var privateData = metadataMgr.getPrivateData();
            var active = privateData.category || '';
            if (active.indexOf('-') !== -1) { active = active.split('-')[0]; }

            Object.keys(categories).forEach(function (key, i) {
                if (!active && !i) { active = key; }
                var category = categories[key];
                var icon;
                if (category.icon) { icon = h('span', { class: category.icon }); }
                var isActive = key === active ? '.cp-leftside-active' : '';
                var item = h('li.cp-sidebarlayout-category'+isActive, {
                    'role': 'menuitem',
                    'tabindex': 0
                }, [
                    icon,
                    Messages[`${app}_cat_${key}`] || key,
                ]);
                var $item = $(item).appendTo(container);

                Util.onClickEnter($item, function () {
                    if (!Array.isArray(category.content) && category.onClick) {
                        category.onClick();
                        return;
                    }
                    active = key;
                    common.setHash(key);
                    $(container).find('.cp-leftside-active').removeClass('cp-leftside-active');
                    $(item).addClass('cp-leftside-active');
                    showCategories(category);
                });

            });
            showCategories(categories[active]);
            $leftside.append(container);
        };

        sidebar.disableItem = (key) => {
            $(items[key]).remove();
            delete items[key];
        };

        return sidebar;
    };

    return Sidebar;
});
