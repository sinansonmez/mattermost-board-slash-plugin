package main

import (
	mmtp "github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/sinansonmez/mattermost-board-slash-plugin/server/plugin"
)

func main() {
	mmtp.ClientMain(&plugin.Plugin{})
}
