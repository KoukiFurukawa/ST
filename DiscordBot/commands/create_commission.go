package commands

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"main/botHandler/botRouter"

	"github.com/google/uuid"

	"github.com/bwmarrin/discordgo"
)

func CreateCommissionCommand() *botRouter.Command {
	/*
		create_commission コマンドの定義

		コマンド名: create_commission
		説明: 委任状を作成します
		オプション: なし
	*/
	return &botRouter.Command{
		Name:        "create_commission",
		Description: "委任状を作成するコマンド",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "title",
				Description: "タイトル",
				Required:    true,
			},
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "description",
				Description: "説明",
				Required:    true,
			},
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "recipient_name",
				Description: "受取人の名前",
				Required:    true,
			},
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "recipient_address",
				Description: "受取人の住所",
				Required:    true,
			},
		},
		Executor: handleCreateCommission,
	}
}

func handleCreateCommission(s *discordgo.Session, i *discordgo.InteractionCreate) {
	/*
		create_commissionコマンドの実行

		コマンドの実行結果を返す
	*/
	if i.Interaction.ApplicationCommandData().Name != "create_commission" {
		return
	}

	// 3秒以内に一時応答を返す
	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
	})
	if err != nil {
		log.Printf("初期応答失敗: %v\n", err)
		return
	}

	options := i.ApplicationCommandData().Options
	var title, description, recipientName, recipientAddress string
	for _, opt := range options {
		switch opt.Name {
		case "title":
			title = opt.StringValue()
		case "description":
			description = opt.StringValue()
		case "recipient_name":
			recipientName = opt.StringValue()
		case "recipient_address":
			recipientAddress = opt.StringValue()
		}
	}

	commission := map[string]interface{}{
		"id":               uuid.New().String(),
		"title":            title,
		"description":      description,
		"recipientName":    recipientName,
		"recipientAddress": recipientAddress,
		"created_at":       time.Now().UnixMilli(),
		"open":             false,
	}

	body, err := json.Marshal(commission)
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "データの作成に失敗しました。",
			},
		})
		return
	}

	resp, err := http.Post("http://localhost:3000/api/submit/", "application/json", bytes.NewBuffer(body))
	if err != nil || resp.StatusCode != http.StatusOK {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "APIへの送信に失敗しました。",
			},
		})
		return
	}

	msg := "委任状を作成し、APIに送信しました。"
	s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: &msg,
	})
}
