package main

import (
	"fmt"
	"net/http"
	"sync"
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
)

const (
	wsEventCreateCard = "card"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration

	CommandHandlers map[string]CommandHandleFunc
	BotUserID   string
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello, world!")
}

func NewPlugin() *Plugin {
	fmt.Println("new plugin is called")
	p := &Plugin{}

	p.CommandHandlers = map[string]CommandHandleFunc{
		"card": p.handleCreateCard,
	}
	return p
}

func createCardCommand() *model.Command {
	fmt.Println("createCardCommand is called")
	return &model.Command{
		Trigger:          wsEventCreateCard,
		AutoComplete:     true,
		AutoCompleteDesc: "Renders custom memes so you can express yourself with culture.",
	}
}

func (p *Plugin) openCardCreateModal(userID string, channelID string, title string) {
	fmt.Println("Opening card create modal")
	p.API.PublishWebSocketEvent(
		wsEventCreateCard,
		map[string]interface{}{
			"title":      title,
			"channel_id": channelID,
		},
		&model.WebsocketBroadcast{UserId: userID},
	)
}
