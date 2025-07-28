package service

import (
	"errors"
	"fmt"

	"github.com/bwmarrin/discordgo"
)

type MessageService struct {
	DiscordSession *discordgo.Session
}

// MessageServiceを返す
func NewMessageService(discordSession *discordgo.Session) *MessageService {
	return &MessageService{
		DiscordSession: discordSession,
	}
}

// channelID ... 1329621965945700385

// 指定されたチャンネルにメッセージを送信する
func (s *MessageService) SendMessage(channelID, message string) error {
	if channelID == "" {
		return errors.New("チャンネルIDが指定されていません")
	}

	if message == "" {
		return errors.New("メッセージが指定されていません")
	}

	_, err := s.DiscordSession.ChannelMessageSend(channelID, message)
	if err != nil {
		return fmt.Errorf("メッセージ送信エラー: %v", err)
	}

	return nil
}

/* Copyright (c) 2025 古川幸樹, 宮浦悠月士 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
