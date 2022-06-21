package plugin

import (
	"fmt"
	"net/http"
	"sync"
	
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
	pluginapi "github.com/mattermost/mattermost-plugin-api"
	root "github.com/sinansonmez/mattermost-board-slash-plugin"
	"github.com/pkg/errors"
	"github.com/gorilla/mux"
)

const (
	wsEventCreateCard = "cardCreate"
)

var (
	Manifest model.Manifest = root.Manifest
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin
	client *pluginapi.Client

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration

	router *mux.Router
	chimeraURL string
	CommandHandlers map[string]CommandHandleFunc
	BotUserID   string
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello, world!")
}

func (p *Plugin) OnActivate() error {
	p.client = pluginapi.NewClient(p.API, p.Driver)
	
	siteURL := p.API.GetConfig().ServiceSettings.SiteURL
	if siteURL == nil || *siteURL == "" {
		return errors.New("siteURL is not set. Please set it and restart the plugin")
	}

	p.registerChimeraURL()
	p.CommandHandlers = map[string]CommandHandleFunc{
		"card": p.handleCreateCard,
	}

	p.initializeAPI()
	return nil
}

func createCardCommand() *model.Command {
	return &model.Command{
		Trigger:          wsEventCreateCard,
		AutoComplete:     true,
		AutoCompleteDesc: "Renders custom memes so you can express yourself with culture.",
	}
}

func (p *Plugin) openCardCreateModal(userID string, channelID string, title string) {
	p.API.PublishWebSocketEvent(
		wsEventCreateCard,
		map[string]interface{}{
			"title":      title,
			"channel_id": channelID,
		},
		&model.WebsocketBroadcast{UserId: userID},
	)
}

// registerChimeraURL fetches the Chimera URL from server settings or env var and sets it in the plugin object.
func (p *Plugin) registerChimeraURL() {
	chimeraURLSetting := p.API.GetConfig().PluginSettings.ChimeraOAuthProxyURL
	if chimeraURLSetting != nil {
		p.chimeraURL = *chimeraURLSetting
	}
}

