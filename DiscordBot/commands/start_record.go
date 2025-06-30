package commands

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/google/uuid"

	"main/botHandler/botRouter"
	"main/service"

	"github.com/pion/rtp"
	"github.com/pion/webrtc/v3/pkg/media"
	"github.com/pion/webrtc/v3/pkg/media/oggwriter"
)

func RecordCommand() *botRouter.Command {
	return &botRouter.Command{
		Name:        "start_record",
		Description: "録音を開始します",
		Options:     []*discordgo.ApplicationCommandOption{},
		Executor:    recordVoice,
	}
}

func createPionRTPPacket(p *discordgo.Packet) *rtp.Packet {
	return &rtp.Packet{
		Header: rtp.Header{
			Version:        2,
			PayloadType:    0x78,
			SequenceNumber: p.Sequence,
			Timestamp:      p.Timestamp,
			SSRC:           p.SSRC,
		},
		Payload: p.Opus,
	}
}

func handleVoice(c chan *discordgo.Packet) string {
	files := make(map[uint32]media.Writer)
	filePaths := make(map[uint32]string)

	// 相対パスに変更
	storageDir := filepath.Join("commands", "vc_storage")

	// ディレクトリが存在しなければ作成
	if _, err := os.Stat(storageDir); os.IsNotExist(err) {
		if err := os.MkdirAll(storageDir, os.ModePerm); err != nil {
			fmt.Printf("failed to create vc_storage directory: %v\n", err)
			return ""
		}
	}

	for p := range c {
		file, ok := files[p.SSRC]
		if !ok {
			id := uuid.New()
			fileName := filepath.Join(storageDir, fmt.Sprintf("%s.ogg", id.String()))

			var err error
			file, err = oggwriter.New(fileName, 48000, 2)
			if err != nil {
				fmt.Printf("failed to create file %s, giving up on recording: %v\n", fileName, err)
				return ""
			}
			files[p.SSRC] = file
			filePaths[p.SSRC] = fileName
			fmt.Printf("recording started: %s\n", fileName)
		}

		rtp := createPionRTPPacket(p)
		err := file.WriteRTP(rtp)
		if err != nil {
			fmt.Printf("failed to write to file for SSRC %d: %v\n", p.SSRC, err)
		}
	}

	for ssrc, f := range files {
		f.Close()
		filePath := filePaths[ssrc]
		return transcribeAudio(filePath)
	}
	return ""
}

func transcribeAudio(filePath string) string {
	// Pythonとtranscribe.pyの絶対パスを指定
	scriptPath, _ := filepath.Abs("./scripts/dist/transcribe.exe")

	fmt.Printf("Running transcription on: %s\n", filePath)

	cmd := exec.Command(scriptPath, filePath)
	out, err := cmd.CombinedOutput()

	fmt.Printf("---- Transcribe Output ----\n%s\n", string(out))
	if err != nil {
		fmt.Printf("transcription error: %v\n", err)
	}

	return string(out)
}

func recordVoice(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Interaction.ApplicationCommandData().Name == "start_record" {
		vs, err := s.State.VoiceState(i.GuildID, i.Interaction.Member.User.ID)
		if err != nil || vs == nil {
			responseText(s, i, "ボイスチャンネルに接続していません")
			return
		}

		responseText(s, i, "録音を開始します <#"+vs.ChannelID+">")
		v, err := s.ChannelVoiceJoin(i.GuildID, vs.ChannelID, true, false)
		if err != nil {
			responseText(s, i, "ボイスチャンネルに入ってください")
			return
		}

		go func() {
			time.Sleep(10 * time.Second)
			close(v.OpusRecv)
			v.Close()
		}()
		result := handleVoice(v.OpusRecv)

		// Create a MessageService instance
		messageService := service.NewMessageService(s)
		channelId := "1387679644001505400"
		if result == "" {
			// Handle empty result
			messageService.SendMessage(channelId, "録音の書き起こしができませんでした。")
		} else {
			// Send the transcription result
			messageService.SendMessage(channelId, "書き起こし結果:\n```\n"+result+"\n```")
		}
	}
}

func responseText(s *discordgo.Session, i *discordgo.InteractionCreate, contentText string) error {
	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: contentText,
		},
	})
	if err != nil {
		fmt.Printf("error responding to record command: %v\n", err)
	}
	return err
}
