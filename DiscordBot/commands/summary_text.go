package commands

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"main/botHandler/botRouter"
	"net/http"

	"github.com/bwmarrin/discordgo"
)

const fastAPIURL = "https://st-kdaz.onrender.com/items/"

// 命名を変更
func SummariesCommand() *botRouter.Command {
	return &botRouter.Command{
		Name:        "summary",
		Description: "このチャンネルまたはスレッドの会話全体をFastAPIサーバに送信して要約を受け取ります",
		Executor:    handleSummaries,
	}
}

// 命名を変更
func handleSummaries(s *discordgo.Session, i *discordgo.InteractionCreate) {
	channelID := i.ChannelID

	// 3秒以内に一時応答を返す
	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
	})
	if err != nil {
		log.Printf("初期応答失敗: %v\n", err)
		return
	}

	// 全メッセージ取得（100件ずつ繰り返し）
	messages, err := fetchAllMessages(s, channelID)
	if err != nil {
		log.Printf("メッセージ取得失敗: %v\n", err)
		editWithError(s, i, "メッセージの取得に失敗しました。")
		return
	}

	// 古い順に並べ替え
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	// ユーザーメッセージのみ抽出
	var buffer bytes.Buffer
	for _, msg := range messages {
		if msg.Author.Bot {
			continue
		}
		buffer.WriteString(fmt.Sprintf("%s: %s\n", msg.Author.Username, msg.Content))
	}

	if buffer.Len() == 0 {
		log.Println("ユーザーのメッセージが見つかりませんでした。")
		editWithError(s, i, "要約するためのメッセージが見つかりませんでした。")
		return
	}

	// FastAPIに送信するJSON
	payload := map[string]string{"description": buffer.String()}
	log.Printf("FastAPIに送信するJSON内容: %v\n", payload["description"])

	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Printf("JSONエンコード失敗: %v\n", err)
		editWithError(s, i, "要約リクエストの準備に失敗しました。")
		return
	}

	// FastAPIへPOSTリクエスト
	resp, err := http.Post(fastAPIURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("FastAPIへのリクエスト失敗: %v\n", err)
		editWithError(s, i, "FastAPIとの通信に失敗しました。")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("FastAPIから異常なステータスコード: %d\n", resp.StatusCode)
		editWithError(s, i, "FastAPIからの応答に問題がありました。")
		return
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("レスポンス読み込み失敗: %v\n", err)
		editWithError(s, i, "FastAPIの応答を受信できませんでした。")
		return
	}
	summary := string(bodyBytes)

	log.Printf("FastAPIからの返り値（要約結果）:\n%s\n", summary)

	// 結果を送信
	_, err = s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: &summary,
	})
	if err != nil {
		log.Printf("編集応答送信失敗: %v\n", err)
	}
}

// エラーメッセージを編集して送信
func editWithError(s *discordgo.Session, i *discordgo.InteractionCreate, message string) {
	_, err := s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: &message,
	})
	if err != nil {
		log.Printf("エラーメッセージ送信失敗: %v\n", err)
	}
}

// 追記項目全件取得関数
func fetchAllMessages(s *discordgo.Session, channelID string) ([]*discordgo.Message, error) {
	var allMessages []*discordgo.Message
	var lastMessageID string

	for {
		messages, err := s.ChannelMessages(channelID, 100, lastMessageID, "", "")
		if err != nil {
			return nil, err
		}
		if len(messages) == 0 {
			break
		}

		allMessages = append(allMessages, messages...)
		lastMessageID = messages[len(messages)-1].ID

		if len(messages) < 100 {
			break
		}
	}

	log.Printf("合計 %d 件のメッセージを取得しました。\n", len(allMessages))
	return allMessages, nil
}

/* Copyright (c) 2025 古川幸樹, 宮浦悠月士 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
