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
	fb_model "github.com/mattermost/focalboard/server/model"
	fb_utils "github.com/mattermost/focalboard/server/utils"
	mm_model "github.com/mattermost/mattermost-server/v6/model"
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

	apiRouter := p.router.PathPrefix("/api/v1").Subrouter()
	apiRouter.Use(p.checkConfigured)

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
	initialCard := &fb_model.Block{
		ID: fb_utils.NewID(fb_utils.IDTypeCard),
		CreatedBy:   "c.User.Id",
		ModifiedBy:  "info.User.Id",
		Schema:      1,
		Type:        fb_model.TypeCard,
		Fields:      make(map[string]interface{}),
		CreateAt:    mm_model.GetMillis(),
		UpdateAt:    mm_model.GetMillis(),
	}

	// get data for the card from the request body and fill initialCard object
	if err := json.NewDecoder(r.Body).Decode(&initialCard); err != nil {
		c.Log.WithError(err).Warnf("Error decoding JSON body")
		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Please provide a JSON object.", StatusCode: http.StatusBadRequest})
		return
	}

	if initialCard.Title == "" {
		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Please provide a valid issue title.", StatusCode: http.StatusBadRequest})
		return
	}

	if initialCard.RootID == "" {
		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Please provide a valid board.", StatusCode: http.StatusBadRequest})
		return
	}

	initialCard.ParentID = initialCard.RootID

	client, err := NewClient("https://8065-mattermost-mattermostgi-cf4j2retku7.ws-eu47.gitpod.io", "sysadmin", "Sys@dmin-sample1")

	if err != nil {
		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "Error creating client:", StatusCode: http.StatusBadRequest})
	}

	_, resp := insertBlock(client, initialCard.WorkspaceID, initialCard)

	if resp.Error != nil {
		p.writeAPIError(w, &APIErrorResponse{ID: "", Message: "cannot insert block in the board", StatusCode: http.StatusBadRequest})
	}
	
	return
}

func insertBlock(client *Client, workspaceID string, block *fb_model.Block) (*fb_model.Block, *Response) {
	blocks := []*fb_model.Block{block}
	b, _ := json.Marshal(blocks)
	r, err := client.FBclient.DoAPIPost(fmt.Sprintf("/workspaces/%s/blocks", workspaceID), string(b))
	if err != nil {
		return nil, BuildErrorResponse(r, err)
	}
	defer closeBody(r)

	blocksNew := fb_model.BlocksFromJSON(r.Body)
	return &blocksNew[0], BuildResponse(r)
}

func (p *Plugin) attachUserContext(handler HTTPHandlerFuncWithUserContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		context, cancel := p.createContext(w, r)
		defer cancel()

		userContext := &UserContext{
			Context: *context,
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