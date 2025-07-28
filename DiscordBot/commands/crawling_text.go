package commands

import (
	"fmt"
	"log"
	"main/botHandler/botRouter"
	"os"
	"regexp"

	"github.com/bwmarrin/discordgo"
)

func CrawlingTextCommand() *botRouter.Command {
	/*
		コマンド名: crawling
		説明: メッセージを取得して .txt ファイルに保存します
		オプション: なし
	*/
	return &botRouter.Command{
		Name:        "crawling",
		Description: "メッセージを取得して .txt ファイルに保存します",
		Options:     []*discordgo.ApplicationCommandOption{},
		Executor:    handleCrawlingText,
	}
}

func handleCrawlingText(s *discordgo.Session, i *discordgo.InteractionCreate) {
	/*
		crawlingコマンドの実行

		コマンドの実行結果を返す
	*/
	if i.Interaction.ApplicationCommandData().Name != "crawling" {
		return
	}
	if i.Interaction.GuildID != i.GuildID {
		return
	}

	const limit = 100
	var beforeId string
	var messages []*discordgo.Message

	for {
		c, err := s.ChannelMessages(i.ChannelID, limit, beforeId, "", "")
		if err != nil {
			log.Fatal(err)
		}

		for _, m := range c {
			if m.Author.ID == i.Member.User.ID {
				messages = append(messages, m)
			}
		}

		if len(c) != limit {
			break
		}

		beforeId = c[len(c)-1].ID
	}

	var fileName string = i.Member.User.Username + ".txt"

	file, err := os.Create(fileName)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	urlRegex := regexp.MustCompile(`https?://[^\s]+`)

	for _, m := range messages {
		content := m.Content
		content = urlRegex.ReplaceAllString(content, "")
		if content == "" {
			continue
		}

		_, err := file.WriteString(m.Content + "\n")
		if err != nil {
			log.Fatal(err)
		}
	}

	file, err = os.Open(fileName)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	_, err = s.ChannelMessageSendComplex(i.ChannelID, &discordgo.MessageSend{
		Content: "取得したメッセージをファイルに出力しました。",
		Files: []*discordgo.File{
			{
				Name:   fileName,
				Reader: file,
			},
		},
	})

	if err != nil {
		log.Fatal(err)
	}

	err = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "メッセージを取得し、ファイルを送信しました。",
		},
	})

	if err != nil {
		fmt.Printf("error responding to ping command: %v\n", err)
	}
}

/* Copyright (c) 2025 古川幸樹, 宮浦悠月士 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
