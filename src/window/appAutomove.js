const { Gio, Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const GioSSS = Gio.SettingsSchemaSource;

const AUTO_MOVE_SCHEMA = 'org.gnome.shell.extensions.auto-move-windows';
const AUTO_MOVE_KEY = 'application-list';

class AppAutomove {
	constructor() {
        this.keybindings =  [
            ['assign-app-automove', Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL, this.assignApp],
            ['remove-app-automove', Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL, this.removeApp],
        ];
    }

    destroy() {
        
    }
    
    getSettings() {
        const schemaSource = GioSSS.get_default();
        const schemaObj = schemaSource.lookup(AUTO_MOVE_SCHEMA, true);
        
        return new Gio.Settings({ settings_schema: schemaObj });
    }

    getActiveAppDesktops() {
        const focusedMetaWindow = global.display.get_focus_window();

        return Shell.AppSystem.search(focusedMetaWindow.wm_class)[0];
    }

    assignApp() {
        const settings = this.getSettings();
        const configs = settings.get_strv(AUTO_MOVE_KEY);
        const configsLength = configs.length;
        const desktops = this.getActiveAppDesktops();
        const activeWsIndex = global.workspace_manager.get_active_workspace_index() + 1;

        for (const configKey in configs) {
            const config = configs[configKey];
            const [desktopConfig, wsIndex] = config.split(':');

            for (const desktopKey in desktops) {
                const desktop = desktops[desktopKey];
                
                if (desktop === desktopConfig) {
                    if (wsIndex === activeWsIndex) {
                        desktops.splice(desktopKey, 1);
                    } else {
                        configs.splice(configKey, 1);
                    }

                    break;
                }
            }
        }

        for (const desktopKey in desktops) {
            const desktop = desktops[desktopKey];

            configs.push(desktop + ':' + activeWsIndex);
        }

        if (configsLength !== configs.length) {
            const focusedMetaWindow = global.display.get_focus_window();
            Main.osdWindowManager.show(-1, new Gio.ThemedIcon ({name: "dialog-information"}), 'App ' + focusedMetaWindow.wm_class + ' assigned to WS ' + activeWsIndex);
        }

        settings.set_strv(AUTO_MOVE_KEY, configs);
    }

    removeApp() {
        const settings = this.getSettings();
        const configs = settings.get_strv(AUTO_MOVE_KEY);
        const desktops = this.getActiveAppDesktops();
        var oldWsIndex = null;

        for (const configKey in configs) {
            const config = configs[configKey];
            const [desktopConfig, wsIndex] = config.split(':');

            for (const desktopKey in desktops) {
                const desktop = desktops[desktopKey];
                
                if (desktop === desktopConfig) {
                    configs.splice(configKey, 1);
                    oldWsIndex = wsIndex;

                    break;
                }
            }
        }

        if (oldWsIndex !== null) {
            const focusedMetaWindow = global.display.get_focus_window();
            Main.osdWindowManager.show(-1, new Gio.ThemedIcon ({name: "dialog-information"}), 'App ' + focusedMetaWindow.wm_class + ' unassigned to WS ' + oldWsIndex);
        }

        settings.set_strv(AUTO_MOVE_KEY, configs);
    }
}