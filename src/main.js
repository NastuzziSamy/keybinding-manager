const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { WindowKeybindingManager } = Me.imports.src.manager.window;

class Extension {
    enable() {
        this.windowKM = new WindowKeybindingManager();
    }

    disable() {
        this.windowKM.destroy();
    }
}