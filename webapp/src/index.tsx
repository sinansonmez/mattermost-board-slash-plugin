import manifest from './manifest';
// eslint-disable-next-line import/no-unresolved
import Plugin from './Plugin';

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());
