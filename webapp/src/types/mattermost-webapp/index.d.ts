import React from 'react';

export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType)
    registerRootComponent(component: React.ElementType)
    registerMainMenuAction(message: string, action: MainMenuAction, icon: JSX.Element)
    registerReducer(reducer: Reducer)
    registerWebSocketEventHandler(event: string, handler: WebSocketEventHandler)

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
