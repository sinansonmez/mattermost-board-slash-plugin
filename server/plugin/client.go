package plugin

import (
	"net/http"
	"net/url"
	"strings"
	"io"
	"io/ioutil"
	"path"
	"fmt"

	mm_model "github.com/mattermost/mattermost-server/v6/model"
	fb_model "github.com/mattermost/focalboard/server/model"
)

const (
	APIURLSuffix = "/api/v1"
)

type FocalboardClient struct {
	URL        string
	APIURL     string
	HTTPClient *http.Client
	HTTPHeader map[string]string
	// Token if token is empty indicate client is not login yet
	Token string
}

type Client struct {
	FBclient *FocalboardClient
	MMclient *mm_model.Client4

	user *mm_model.User
}

type Response struct {
	StatusCode int
	Error      error
	Header     http.Header
}

type requestOption func(r *http.Request)

type RequestReaderError struct {
	buf []byte
}

func (rre RequestReaderError) Error() string {
	return "payload: " + string(rre.buf)
}

func NewClient(siteURL string, username string, password string) (*Client, error) {
	mmclient := mm_model.NewAPIv4Client(siteURL)

	user, _, err := mmclient.Login(username, password)
	if err != nil {
		return nil, err
	}

	fbclient := FocalboardNewClient(siteURL, mmclient.AuthToken)
	u, err := url.Parse(siteURL)
	if err != nil {
		return nil, fmt.Errorf("Invalid site URL: %w", err)
	}
	u.Path = path.Join("/plugins/focalboard/", APIURLSuffix)
	fbclient.APIURL = u.String()

	fmt.Println("Focalboard API URL:", fbclient.APIURL)
	fmt.Println("Focalboard site URL:", u)

	me2, resp := fbclient.GetMe()
	if resp.Error != nil {
		return nil, fmt.Errorf("cannot fetch FocalBoard user %s: %w", username, resp.Error)
	}

	if me2.ID != user.Id {
		return nil, fmt.Errorf("user ids don't match %s != %s: %w", user.Id, me2.ID, err)
	}

	return &Client{
		FBclient: fbclient,
		MMclient: mmclient,
		user:     user,
	}, nil
}

func BuildErrorResponse(r *http.Response, err error) *Response {
	statusCode := 0
	header := make(http.Header)
	if r != nil {
		statusCode = r.StatusCode
		header = r.Header
	}

	return &Response{
		StatusCode: statusCode,
		Error:      err,
		Header:     header,
	}
}

func closeBody(r *http.Response) {
	if r.Body != nil {
		_, _ = io.Copy(ioutil.Discard, r.Body)
		_ = r.Body.Close()
	}
}

func FocalboardNewClient(url, sessionToken string) *FocalboardClient {
	url = strings.TrimRight(url, "/")

	headers := map[string]string{
		"X-Requested-With": "XMLHttpRequest",
	}

	return &FocalboardClient{url, url + APIURLSuffix, &http.Client{}, headers, sessionToken}
}

func (c *FocalboardClient) GetMeRoute() string {
	return "/users/me"
}

// curl -i -H "X-Requested-With: XMLHttpRequest" -H 'Authorization: Bearer q6ksmp44j3rf3gn4sugw887y3a' https://8065-mattermost-mattermostgi-cf4j2retku7.ws-eu47.gitpod.io/plugins/focalboard/api/v2/workspaces

func (c *FocalboardClient) GetMe() (*fb_model.User, *Response) {
	r, err := c.DoAPIGet(c.GetMeRoute(), "")
	fmt.Println("GetMe:", r, err)
	if err != nil {
		return nil, BuildErrorResponse(r, err)
	}
	defer closeBody(r)

	me, err := fb_model.UserFromJSON(r.Body)
	if err != nil {
		return nil, BuildErrorResponse(r, err)
	}
	return me, BuildResponse(r)
}

func (c *FocalboardClient) DoAPIGet(url, etag string) (*http.Response, error) {
	return c.DoAPIRequest(http.MethodGet, c.APIURL+url, "", etag)
}

func (c *FocalboardClient) DoAPIPost(url, data string) (*http.Response, error) {
	return c.DoAPIRequest(http.MethodPost, c.APIURL+url, data, "")
}

func (c *FocalboardClient) DoAPIRequest(method, url, data, etag string) (*http.Response, error) {
	return c.doAPIRequestReader(method, url, strings.NewReader(data), etag)
}

func (c *FocalboardClient) doAPIRequestReader(method, url string, data io.Reader, _ /* etag */ string, opts ...requestOption) (*http.Response, error) {
	rq, err := http.NewRequest(method, url, data)
	if err != nil {
		return nil, err
	}

	for _, opt := range opts {
		opt(rq)
	}

	if c.HTTPHeader != nil && len(c.HTTPHeader) > 0 {
		for k, v := range c.HTTPHeader {
			rq.Header.Set(k, v)
		}
	}

	if c.Token != "" {
		rq.Header.Set("Authorization", "Bearer "+c.Token)
	}

	rp, err := c.HTTPClient.Do(rq)
	if err != nil || rp == nil {
		return nil, err
	}

	if rp.StatusCode == http.StatusNotModified {
		return rp, nil
	}

	if rp.StatusCode >= http.StatusMultipleChoices {
		defer closeBody(rp)
		b, err := ioutil.ReadAll(rp.Body)
		if err != nil {
			return rp, fmt.Errorf("error when parsing response with code %d: %w", rp.StatusCode, err)
		}
		return rp, RequestReaderError{b}
	}

	return rp, nil
}

func BuildResponse(r *http.Response) *Response {
	return &Response{
		StatusCode: r.StatusCode,
		Header:     r.Header,
	}
}