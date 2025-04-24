
import os  
import base64
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv(".env", override=True)
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")  
deployment = os.getenv("DEPLOYMENT_NAME", "gpt-4o-mini")  
subscription_key = os.getenv("AZURE_OPENAI_API_KEY")  

# キーベースの認証を使用して Azure OpenAI Service クライアントを初期化する    
client = AzureOpenAI(  
    azure_endpoint=endpoint,  
    api_key=subscription_key,  
    api_version=os.getenv("AZURE_OPENAI_API_VERSION")
)
    
    
# IMAGE_PATH = "YOUR_IMAGE_PATH"
# encoded_image = base64.b64encode(open(IMAGE_PATH, 'rb').read()).decode('ascii')

#チャット プロンプトを準備する 
chat_prompt = [
    {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": "情報を見つけるのに役立つ AI アシスタントです。"
            }
        ]
    },
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "アメリカ航空宇宙局あるいは国家航空宇宙局は、アメリカ合衆国政府内における宇宙開発の計画を担当する連邦機関。1958年7月29日、国家航空宇宙法に基づき、先行の国家航空宇宙諮問委員会を発展的に解消する形で設立された。正式に活動を始めたのは1958年10月1日のことであった。"
            },
            {
                "type": "text",
                "text": "要約"
            }
        ]
    },
] 
    
# 音声認識が有効になっている場合は音声結果を含める  
messages = chat_prompt  
    
# 入力候補を生成する  
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

# チャット プロンプトを表示する
print(completion.choices[0].message.content)

# 使用したトークンを表示する
print(f"- 完了トークン: {completion.usage.completion_tokens}")
print(f"- プロンプトトークン: {completion.usage.prompt_tokens}")