package envconfig

import (
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	TOKEN      string
	ServerPort string
}

func NewEnv() (*Env, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return nil, err
	}

	return &Env{
		TOKEN:      os.Getenv("TOKEN"),
		ServerPort: os.Getenv("PORT"),
	}, nil
}

/* Copyright (c) 2025 古川幸樹　*/
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
