import os
from openai import AzureOpenAI
from dotenv import load_dotenv

# キーベースの認証を使用して Azure OpenAI Service クライアントを初期化する
def initialize_client():
    load_dotenv(".env", override=True)
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")  
    deployment = os.getenv("DEPLOYMENT_NAME", "gpt-4o-mini")  
    subscription_key = os.getenv("AZURE_OPENAI_API_KEY") 

    client = AzureOpenAI(  
        azure_endpoint=endpoint,  
        api_key=subscription_key,  
        api_version=os.getenv("AZURE_OPENAI_API_VERSION")
    )
    return client, deployment

# チャットプロンプトをを準備する 
def create_chat_prompt(text, length =200):
    chat_prompt = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "情報をまとめるのを得意なAIアシスタントです。"
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": text
                },
                {
                    "type": "text",
                    "text": "{length}文字で要約"
                }
            ]
        },
    ]
    return chat_prompt

# 入力候補を生成する
def get_chat_response(client, deployment, messages):
    completion = client.chat.completions.create(  
        model=deployment,
        messages=messages,
        max_tokens=800,  
        temperature=0.7,  
        top_p=0.95,  
        frequency_penalty=0,  
        presence_penalty=0,
        stop=None,  
        stream=False
    )
    return completion

# チャット プロンプト とトークン情報を表示する関数
def display_results(result):
    print(result.choices[0].message.content)
    print(f"- 完了トークン: {result.usage.completion_tokens}")
    print(f"- プロンプトトークン: {result.usage.prompt_tokens}")

    return result.choices[0].message.content

# Copyright (c) 2025 コウレキトウ */
# このソースコードは自由に使用、複製、改変、再配布することができます。 */
# ただし、著作権表示は削除しないでください。  */