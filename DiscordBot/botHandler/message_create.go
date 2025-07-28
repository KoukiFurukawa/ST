// messageCreate.go
package botHandler

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

func OnMessageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
	// メッセージが作成されたときに実行する処理
	//u := m.Author

	fmt.Println(m.Content)

	if !m.Author.Bot {
		s.ChannelMessageSend(m.ChannelID, m.Content)
	}
}

/* Copyright (c) 2025 古川幸樹 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
