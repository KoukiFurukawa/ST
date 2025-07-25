package commands

import (
	"github.com/bwmarrin/discordgo"

	"main/botHandler/botRouter"
)

func DisconnectCommand() *botRouter.Command {
	/*
		disconnectコマンドの定義

		コマンド名: disconnect
		説明: 接続中のボイスチャンネルから切断します
		オプション: なし
	*/
	return &botRouter.Command{
		Name:        "disconnect",
		Description: "接続中のボイスチャンネルから切断します",
		Options:     []*discordgo.ApplicationCommandOption{},
		Executor:    disconnectVoiceChannel,
	}
}

func disconnectVoiceChannel(s *discordgo.Session, i *discordgo.InteractionCreate) {
	/*
		test_disconnectコマンドの実行

		コマンドの実行結果を返す
	*/
	if i.Interaction.ApplicationCommandData().Name == "disconnect" {
		if len(s.VoiceConnections) == 0 {
			responseText(s, i, "ボイスチャンネルに接続していません")
			return
		}
		if s.VoiceConnections[i.GuildID] == nil {
			responseText(s, i, "ボイスチャンネルに接続していません")
			return
		}
		// 接続中のボイスチャンネルから切断する
		err := s.VoiceConnections[i.GuildID].Disconnect()
		if err != nil {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "切断に失敗しました",
				},
			})
			return
		}
		responseText(s, i, "切断しました")
	}
}
