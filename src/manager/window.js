const { Gio, Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const { getCurrentExtension, getSettings } = imports.misc.extensionUtils;
const GioSSS = Gio.SettingsSchemaSource;
const Me = getCurrentExtension();

const { AppAutomove } = Me.imports.src.window.appAutomove;

class WindowKeybindingManager {
	constructor() {
		this.managed = [
            new AppAutomove(),
        ];

        for (const key in this.managed) {
            const managed = this.managed[key];

            for (const subKey in managed.keybindings) {
                const [keybinding, flag, mode, callback] = managed.keybindings[subKey];

                Main.wm.addKeybinding(keybinding, getSettings(), flag, mode, callback.bind(managed));
            }
        }
    }

	destroy() {
		for (const key in this.managed) {
            const managed = this.managed[key];

            for (const subKey in managed.keybindings) {
                const [keybinding] = managed.keybindings[subKey];
                
                Main.wm.removeKeybinding(keybinding);
            }

            managed.destroy();
        }
	}
}