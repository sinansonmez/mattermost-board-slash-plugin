export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType)
    registerRootComponent(component: JSX.Element)
    registerMainMenuAction(message: string, action: MainMenuAction, icon: JSX.Element)

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
