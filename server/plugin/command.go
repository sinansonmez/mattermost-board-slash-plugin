package plugin

import (
	"fmt"
	"strings"
	"unicode"

	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
)


type CommandHandleFunc func(c *plugin.Context, args *model.CommandArgs, parameters []string) string

func (p *Plugin) getCommand(config *configuration) (*model.Command, error) {
	fmt.Println("getcommand is called")

	return &model.Command{
		Trigger:              "card",
		AutoComplete:         true,
		AutoCompleteDesc:     "Create a card in the current channel's boards",
		AutoCompleteHint:     "",
		// AutocompleteData:     getAutocompleteData(config),
	}, nil
}

func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	command, _, _ := parseCommand(args.Command)

	if command != "/card" {
		return &model.CommandResponse{}, nil
	}

	// config := p.getConfiguration()

	// if f, ok := p.CommandHandlers[action]; ok {
	if f, ok := p.CommandHandlers["card"]; ok {
		// message := f(c, args, parameters)
		fakeParameters := []string{"card", "create", "test"}
		message := f(c, args, fakeParameters)
		if message != "" {
			p.postCommandResponse(args, message)
		}
		return &model.CommandResponse{}, nil
	}

	p.postCommandResponse(args, fmt.Sprintf("Unknown action %v", "card")) // todo replace card with action
	return &model.CommandResponse{}, nil

}

func (p *Plugin) handleCreateCard(_ *plugin.Context, args *model.CommandArgs, parameters []string, ) string {
	if len(parameters) < 1 {
		return "You must specify a card name"
	}
	command := parameters[0]
	parameters = parameters[1:]

	switch command {
	case "card":
		p.openCardCreateModal(args.UserId, args.ChannelId , strings.Join(parameters, " "))
		return ""
	default:
		return fmt.Sprintf("Unknown subcommand %v", command)
	}
}

func (p *Plugin) postCommandResponse(args *model.CommandArgs, text string) {
	post := &model.Post{
		UserId:    p.BotUserID,
		ChannelId: args.ChannelId,
		RootId:    args.RootId,
		Message:   text,
	}
	_ = p.API.SendEphemeralPost(args.UserId, post)
}

// parseCommand parses the entire command input string and retrieves the command, action and parameters
func parseCommand(input string) (command, action string, parameters []string) {
	split := make([]string, 0)
	current := ""
	inQuotes := false

	for _, char := range input {
		if unicode.IsSpace(char) {
			// keep whitespaces that are inside double qoutes
			if inQuotes {
				current += " "
				continue
			}

			// ignore successive whitespaces that are outside of double quotes
			if len(current) == 0 && !inQuotes {
				continue
			}

			// append the current word to the list & move on to the next word/expression
			split = append(split, current)
			current = ""
			continue
		}

		// append the current character to the current word
		current += string(char)

		if char == '"' {
			inQuotes = !inQuotes
		}
	}

	// append the last word/expression to the list
	if len(current) > 0 {
		split = append(split, current)
	}

	command = split[0]

	if len(split) > 1 {
		action = split[1]
	}

	if len(split) > 2 {
		parameters = split[2:]
	}

	return command, action, parameters
}
