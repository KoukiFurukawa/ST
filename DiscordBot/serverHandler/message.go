package serverHandler

import (
	"encoding/json"
	"log"
	"net/http"

	"main/model"
	"main/service"
)

type MessageHandler struct {
	svc *service.MessageService
}

// MessageHandlerを返す
func NewMessageHandler(svc *service.MessageService) *MessageHandler {
	return &MessageHandler{
		svc: svc,
	}
}

func (h *MessageHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// GETリクエストの場合、案内を表示
	if r.Method != http.MethodPost {
		http.Error(w, "POSTだけが利用できます。", http.StatusMethodNotAllowed)
		return
	}

	// POSTリクエストのみ受け付ける
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// リクエストボディからデータを読み取る
	var req model.MessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("JSONデコードエラー: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// メッセージをDiscordに送信
	err := h.svc.SendMessage(req.ChannelID, req.Message)
	if err != nil {
		log.Printf("メッセージ送信エラー: %v", err)

		// エラーレスポンスを返す
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(&model.MessageResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// 成功レスポンスを返す
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&model.MessageResponse{
		Success: true,
		Message: "メッセージを送信しました",
	})
}
