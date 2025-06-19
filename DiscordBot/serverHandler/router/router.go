package router

import (
	"net/http"

	"main/serverHandler"
	"main/service"

	"github.com/bwmarrin/discordgo"
)

func NewRouter(discordSession *discordgo.Session) *http.ServeMux {
	// *service.IndexService型変数を作成する。
	var indexService = service.NewIndexService(discordSession)
	var messageService = service.NewMessageService(discordSession)

	// register routes
	mux := http.NewServeMux()
	mux.HandleFunc("/", serverHandler.NewIndexHandler(indexService).ServeHTTP)
	mux.HandleFunc("/message", serverHandler.NewMessageHandler(messageService).ServeHTTP)
	return mux
}
