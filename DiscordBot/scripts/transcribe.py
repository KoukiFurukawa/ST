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
