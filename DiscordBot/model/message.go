package model

type MessageRequest struct {
	ChannelID string `json:"channel_id"`
	Message   string `json:"message"`
}

type MessageResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

/* Copyright (c) 2025 古川幸樹, 宮浦悠月士 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
