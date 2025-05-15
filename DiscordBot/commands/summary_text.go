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

func PostTextCommand() *botRouter.Command {
	return &botRouter.Command{
		Name:        "summary",
		Description: "このチャンネルまたはスレッドの会話全体をFastAPIサーバに送信して要約を受け取ります",
		Executor:    handlePostText,
	}
}

func handlePostText(s *discordgo.Session, i *discordgo.InteractionCreate) {
	channelID := i.ChannelID

	// 3秒以内に一時応答を返す
	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
	})
	if err != nil {
		log.Printf("初期応答失敗: %v\n", err)
		return
	}

	// メッセージ取得
	messages, err := s.ChannelMessages(channelID, 100, "", "", "")
	if err != nil {
		log.Printf("メッセージ取得失敗: %v\n", err)
		editWithError(s, i, "メッセージの取得に失敗しました。")
		return
	}

	// 古い順に並び替え
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

	// レスポンスを取得
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("レスポンス読み込み失敗: %v\n", err)
		editWithError(s, i, "FastAPIの応答を受信できませんでした。")
		return
	}
	summary := string(bodyBytes)

	log.Printf("FastAPIからの返り値（要約結果）:\n%s\n", summary)

	// 最後に編集して結果を送信
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
