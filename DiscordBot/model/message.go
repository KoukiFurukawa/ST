package model

type MessageRequest struct {
	ChannelID string `json:"channel_id"`
	Message   string `json:"message"`
}

type MessageResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
