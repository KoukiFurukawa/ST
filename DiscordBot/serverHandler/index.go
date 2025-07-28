package serverHandler

import (
	"encoding/json"
	"log"
	"net/http"

	"main/model"
	"main/service"
)

type IndexHandler struct {
	svc *service.IndexService
}

// http.HandlerをベースにしたIndexHandlerを返す
func NewIndexHandler(svc *service.IndexService) *IndexHandler {
	return &IndexHandler{
		svc: svc,
	}
}

func (h *IndexHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := json.NewEncoder(w).Encode(&model.IndexResponse{
		Message: h.svc.DiscordSession.State.User.Username + " is running",
	})
	if err != nil {
		log.Println(err)
	}
}

// MIT License
// Copyright (c) 2024 Haruki Sasaki
