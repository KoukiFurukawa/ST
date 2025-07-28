package botRouter

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

type Handler struct {
	session  *discordgo.Session
	commands map[string]*Command
	guild    string
}

// ハンドラーの登録（未使用部分）
func RegisterHandlers(s *discordgo.Session) {
	fmt.Println(s.State.User.Username + "としてログインしました")
	// s.AddHandler(botHandler.OnMessageCreate)
	// s.AddHandler(botHandler.OnVoiceStateUpdate)
}

// スラッシュコマンドの作成
func NewCommandHandler(session *discordgo.Session, guildID string) *Handler {
	return &Handler{
		session:  session,
		commands: make(map[string]*Command),
		guild:    guildID,
	}
}

// スラッシュコマンドの登録
func (h *Handler) CommandRegister(command *Command) error {
	if _, exists := h.commands[command.Name]; exists {
		return fmt.Errorf("command with name `%s` already exists", command.Name)
	}

	appCmd, err := h.session.ApplicationCommandCreate(
		h.session.State.User.ID,
		h.guild,
		&discordgo.ApplicationCommand{
			ApplicationID: h.session.State.User.ID,
			Name:          command.Name,
			Description:   command.Description,
			Options:       command.Options,
		},
	)
	if err != nil {
		return err
	}

	command.AddApplicationCommand(appCmd)
	h.commands[command.Name] = command

	// ✅ 修正点: コマンド名でExecutorをフィルタリング
	h.session.AddHandler(
		func(s *discordgo.Session, i *discordgo.InteractionCreate) {
			if i.Type == discordgo.InteractionApplicationCommand &&
				i.ApplicationCommandData().Name == command.Name {
				command.Executor(s, i)
			}
		},
	)

	return nil
}

// スラッシュコマンドの削除
func (h *Handler) CommandRemove(command *Command) error {
	err := h.session.ApplicationCommandDelete(h.session.State.User.ID, h.guild, command.AppCommand.ID)
	if err != nil {
		return fmt.Errorf("error while deleting application command: %v", err)
	}
	delete(h.commands, command.Name)
	return nil
}

// スラッシュコマンドの取得
func (h *Handler) GetCommands() []*Command {
	var commands []*Command
	for _, v := range h.commands {
		commands = append(commands, v)
	}
	return commands
}

// MIT License
// Copyright (c) 2024 Haruki Sasaki

/* Copyright (c) 2025 古川幸樹, 宮浦悠月士 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
