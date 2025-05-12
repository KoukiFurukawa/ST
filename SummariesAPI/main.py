import os
import base64
from openai import AzureOpenAI
from dotenv import load_dotenv
from open_api_controller import *
from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    description: str | None = None

app = FastAPI()

# 初期化
client, deployment = initialize_client()

@app.post("/items/")
async def create_item(item: Item):
    # ユーザー入力を受け取る
    # text = "アメリカ航空宇宙局あるいは国家航空宇宙局は、アメリカ合衆国政府内における宇宙開発の計画を担当する連邦機関。1958年7月29日、国家航空宇宙法に基づき、先行の国家航空宇宙諮問委員会を発展的に解消する形で設立された。正式に活動を始めたのは1958年10月1日のことであった。"
    text = item.description

    # チャットプロンプトの作成
    chat_prompt = create_chat_prompt(text)

    # チャットのレスポンスを取得
    result = get_chat_response(client, deployment, chat_prompt)

    # 結果を表示
    value = display_results(result)
    return value