import sys
import whisper
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_file_path>")
        return

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    model = whisper.load_model("medium")  # small / medium / large も可

    try:
        result = model.transcribe(file_path)
        print("結果")
        print(result["text"])
    except Exception as e:
        print(f"Whisper transcription failed: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


# Copyright (c) 2025 古川幸樹, 宮浦悠月士
# このソースコードは自由に使用、複製、改変、再配布することができます。
# ただし、著作権表示は削除しないでください。 