package plugin

import (
	"fmt"
	"time"
	"context"
	"net/http"
	"runtime/debug"
	"encoding/json"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-plugin-api/experimental/bot/logger"
	// "github.com/mattermost/mattermost-server/v6/model"
)

// ResponseType indicates type of response returned by api
type ResponseType string

// HTTPHandlerFuncWithUserContext is http.HandleFunc but with a UserContext attached
type HTTPHandlerFuncWithUserContext func(c *UserContext, w http.ResponseWriter, r *http.Request)

type APIErrorResponse struct {
	ID         string `json:"id"`
	Message    string `json:"message"`
	StatusCode int    `json:"status_code"`
}

type Context struct {
	Ctx    context.Context
	UserID string
	Log    logger.Logger
}

type UserContext struct {
	Context
}

const (
	// ResponseTypeJSON indicates that response type is json
	ResponseTypeJSON ResponseType = "JSON_RESPONSE"
	// ResponseTypePlain indicates that response type is text plain
	ResponseTypePlain ResponseType = "TEXT_RESPONSE"

	requestTimeout = 5 * time.Second
)

func (p *Plugin) initializeAPI() {
	p.router = mux.NewRouter()
	p.router.Use(p.withRecovery)

	// oauthRouter := p.router.PathPrefix("/oauth").Subrouter()
	apiRouter := p.router.PathPrefix("/api/v1").Subrouter()
	fmt.Println("----------------------------")
	fmt.Println("router: ", apiRouter)
	fmt.Println("----------------------------")
	apiRouter.Use(p.checkConfigured)

	// apiRouter.HandleFunc("/createissue", p.checkAuth(p.attachUserContext(p.createIssue), ResponseTypePlain)).Methods(http.MethodPost)
	apiRouter.HandleFunc("/createcard", p.attachUserContext(p.createCard)).Methods(http.MethodPost)
}

func (p *Plugin) withRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if x := recover(); x != nil {
				p.API.LogError("Recovered from a panic",
					"url", r.URL.String(),
					"error", x,
					"stack", string(debug.Stack()))
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func (p *Plugin) checkAuth(handler http.HandlerFunc, responseType ResponseType) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get("Mattermost-User-ID")
		if userID == "" {
			switch responseType {
			case ResponseTypeJSON:
				p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Not authorized.", StatusCode: http.StatusUnauthorized})
			case ResponseTypePlain:
				http.Error(w, "Not authorized", http.StatusUnauthorized)
			default:
				p.API.LogError("Unknown ResponseType detected")
			}
			return
		}

		handler(w, r)
	}
}

func (p *Plugin) writeAPIError(w http.ResponseWriter, apiErr *APIErrorResponse) {
	b, err := json.Marshal(apiErr)
	if err != nil {
		p.API.LogWarn("Failed to marshal API error", "error", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(apiErr.StatusCode)

	_, err = w.Write(b)
	if err != nil {
		p.API.LogWarn("Failed to write JSON response", "error", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (p *Plugin) createCard(c *UserContext, w http.ResponseWriter, r *http.Request) {
	fmt.Println("--------------------------------------------")
	fmt.Println("createCard is called")
	fmt.Println("--------------------------------------------")
	// type IssueRequest struct {
	// 	Title     string   `json:"title"`
	// 	Body      string   `json:"body"`
	// 	Repo      string   `json:"repo"`
	// 	PostID    string   `json:"post_id"`
	// 	ChannelID string   `json:"channel_id"`
	// 	Labels    []string `json:"labels"`
	// 	Assignees []string `json:"assignees"`
	// 	Milestone int      `json:"milestone"`
	// }

	// // get data for the issue from the request body and fill IssueRequest object
	// issue := &IssueRequest{}
	// if err := json.NewDecoder(r.Body).Decode(&issue); err != nil {
	// 	c.Log.WithError(err).Warnf("Error decoding JSON body")
	// 	p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Please provide a JSON object.", StatusCode: http.StatusBadRequest})
	// 	return
	// }

	// if issue.Title == "" {
	// 	p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Please provide a valid issue title.", StatusCode: http.StatusBadRequest})
	// 	return
	// }

	// if issue.Repo == "" {
	// 	p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Please provide a valid repo name.", StatusCode: http.StatusBadRequest})
	// 	return
	// }

	// if issue.PostID == "" && issue.ChannelID == "" {
	// 	p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Please provide either a postID or a channelID", StatusCode: http.StatusBadRequest})
	// 	return
	// }

	// mmMessage := ""
	// var post *model.Post
	// permalink := ""
	// if issue.PostID != "" {
	// 	var appErr *model.AppError
	// 	post, appErr = p.API.GetPost(issue.PostID)
	// 	if appErr != nil {
	// 		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "failed to load post " + issue.PostID, StatusCode: http.StatusInternalServerError})
	// 		return
	// 	}
	// 	if post == nil {
	// 		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "failed to load post " + issue.PostID + ": not found", StatusCode: http.StatusNotFound})
	// 		return
	// 	}

	// 	username, err := p.getUsername(post.UserId)
	// 	if err != nil {
	// 		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "failed to get username", StatusCode: http.StatusInternalServerError})
	// 		return
	// 	}

	// 	permalink = p.getPermaLink(issue.PostID)

	// 	mmMessage = fmt.Sprintf("_Issue created from a [Mattermost message](%v) *by %s*._", permalink, username)
	// }

	// ghIssue := &github.IssueRequest{
	// 	Title:     &issue.Title,
	// 	Body:      &issue.Body,
	// 	Labels:    &issue.Labels,
	// 	Assignees: &issue.Assignees,
	// }

	// // submitting the request with an invalid milestone ID results in a 422 error
	// // we make sure it's not zero here, because the webapp client might have left this field empty
	// if issue.Milestone > 0 {
	// 	ghIssue.Milestone = &issue.Milestone
	// }

	// if ghIssue.GetBody() != "" && mmMessage != "" {
	// 	mmMessage = "\n\n" + mmMessage
	// }
	// *ghIssue.Body = ghIssue.GetBody() + mmMessage

	// currentUser, appErr := p.API.GetUser(c.UserID)
	// if appErr != nil {
	// 	p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "failed to load current user", StatusCode: http.StatusInternalServerError})
	// 	return
	// }

	// splittedRepo := strings.Split(issue.Repo, "/")
	// owner := splittedRepo[0]
	// repoName := splittedRepo[1]

	// githubClient := p.githubConnectUser(c.Context.Ctx, c.GHInfo)
	// result, resp, err := githubClient.Issues.Create(c.Ctx, owner, repoName, ghIssue)
	// if err != nil {
	// 	if resp != nil && resp.Response.StatusCode == http.StatusGone {
	// 		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Issues are disabled on this repository.", StatusCode: http.StatusMethodNotAllowed})
	// 		return
	// 	}

	// 	c.Log.WithError(err).Warnf("Failed to create issue")
	// 	p.writeAPIError(w,
	// 		&APIErrorResponse{
	// 			ID: "",
	// 			Message: "failed to create issue: " + getFailReason(resp.StatusCode,
	// 				issue.Repo,
	// 				currentUser.Username,
	// 			),
	// 			StatusCode: resp.StatusCode,
	// 		})
	// 	return
	// }

	// rootID := issue.PostID
	// channelID := issue.ChannelID
	// message := fmt.Sprintf("Created GitHub issue [#%v](%v)", result.GetNumber(), result.GetHTMLURL())
	// if post != nil {
	// 	if post.RootId != "" {
	// 		rootID = post.RootId
	// 	}
	// 	channelID = post.ChannelId
	// 	message += fmt.Sprintf(" from a [message](%s)", permalink)
	// }

	// reply := &model.Post{
	// 	Message:   message,
	// 	ChannelId: channelID,
	// 	RootId:    rootID,
	// 	UserId:    c.UserID,
	// }

	// if post != nil {
	// 	_, appErr = p.API.CreatePost(reply)
	// } else {
	// 	p.API.SendEphemeralPost(c.UserID, reply)
	// }
	// if appErr != nil {
	// 	c.Log.WithError(appErr).Warnf("failed to create notification post")
	// 	p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "failed to create notification post, postID: " + issue.PostID + ", channelID: " + channelID, StatusCode: http.StatusInternalServerError})
	// 	return
	// }

	// p.writeJSON(w, result)
}

func (p *Plugin) attachUserContext(handler HTTPHandlerFuncWithUserContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		context, cancel := p.createContext(w, r)
		defer cancel()

		// info, apiErr := p.getGitHubUserInfo(context.UserID)
		// if apiErr != nil {
		// 	p.writeAPIError(w, apiErr)
		// 	return
		// }

		// context.Log = context.Log.With(logger.LogContext{
		// 	"github username": info.GitHubUsername,
		// })

		userContext := &UserContext{
			Context: *context,
			// GHInfo:  info,
		}

		handler(userContext, w, r)
	}
}

func (p *Plugin) createContext(_ http.ResponseWriter, r *http.Request) (*Context, context.CancelFunc) {
	userID := r.Header.Get("Mattermost-User-ID")

	logger := logger.New(p.API).With(logger.LogContext{
		"userid": userID,
	})

	ctx, cancel := context.WithTimeout(context.Background(), requestTimeout)

	context := &Context{
		Ctx:    ctx,
		UserID: userID,
		Log:    logger,
	}

	return context, cancel
}

func (p *Plugin) checkConfigured(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		config := p.getConfiguration()

		if err := config.IsValid(); err != nil {
			http.Error(w, "This plugin is not configured.", http.StatusNotImplemented)
			return
		}

		next.ServeHTTP(w, r)
	})
}