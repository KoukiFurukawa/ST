import os
import base64
from openai import AzureOpenAI
from dotenv import load_dotenv
from open_api_controller import *
from database import *
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class Item(BaseModel):
    description: str | None = None

class Data(BaseModel):
    id : str 
    title : str
    description : str
    recipientName : str
    recipientAddress: str
    created_at : datetime
    open : bool

class Answer(BaseModel):
    commissionID : str
    userId : str
    answer : str
    created_at : datetime

    @property
    def id(self) -> str:
        # userId と commissionID を # で連結して一意IDを作成
        return f"{self.userId}#{self.commissionID}"

app = FastAPI()

# 初期化
client, deployment = initialize_client()
cosmos_client, database, cosmos_datacontainer = create_datacosmos_client()
_, _, cosmos_anscontainer = create_anscosmos_client()

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

# 委任状データの追加
@app.post("/upload_data/")
async def create_commission_data(data: Data):
    # 既存のデータがすでに存在するかチェック
    existing_item = await cosmos_datacontainer.read_item(data.id, partition_key=data.id)

    if existing_item:
        raise HTTPException(status_code=400, detail="委任状データはすでに存在します。")

    new_item = {
        "id": data.id,
        "title": data.title,
        "description": data.description,
        "recipientName" : data.recipientName,
        "recipientAddress": data.recipientAddress,
        "created_at": data.created_at.isoformat(),  # ISOフォーマットで保存
        "open": data.open
    }

    create = cosmos_datacontainer.create_item(body=new_item)
    print("委任状データを追加しました。")
    return create

# 委任状データの取得
@app.post("/get_data/")
async def get_all_data():    
    # 全件取得クエリ
    query = "SELECT * FROM c"
    
    # クエリを実行
    items = cosmos_datacontainer.query_items(query=query, enable_cross_partition_query=True)
    
    data_result = [item for item in items]
    
    return data_result

# 委任状回答の追加
@app.post("/upload_answer/")
async def create_answer_data(ans: Answer):
    partition_key = ans.id  # 複合キー

    try:
        existing_item = await cosmos_anscontainer.read_item(ans.id, partition_key=partition_key)
        if existing_item:
            raise HTTPException(status_code=400, detail="回答データはすでに存在します。")
    except Exception:
        # 存在しない場合は例外が投げられるので無視
        pass

    new_ans = {
        "userId": ans.userId,
        "answer": ans.answer,
        "created_at": ans.created_at.isoformat(),  # ISOフォーマットで保存
    }

    create_ans = cosmos_anscontainer.create_item(body=new_ans)
    print("回答データを追加しました。")
    return create_ans

# 委任状回答の取得
@app.post("/get_answer_ids/")
async def get_ans_data():
    # id のみを取得するクエリ
    query = "SELECT c.id FROM c"

    # クエリを実行
    items = cosmos_anscontainer.query_items(query=query, enable_cross_partition_query=True)

    # id だけを取り出してリストに変換
    id_list = [item['id'] for item in items]

    return {"ids": id_list}

