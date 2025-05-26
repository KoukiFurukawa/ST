import os
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from datetime import datetime

# 環境変数の読み込み
load_dotenv(".env", override=True)

def create_datacosmos_client():
    # Cosmos DB 接続設定
    endpoint = os.getenv("AZURE_COSMOSDB_ENDPOINT")
    key = os.getenv("AZURE_COSMOSDB_KEY")
    database_id = os.getenv("AZURE_COSMOSDB_DATABASEID")
    container_id = os.getenv("AZURE_COSMOSDB_DATACONTAINER")
    
    # クライアント作成
    cosmos_client = CosmosClient(endpoint, credential=key)
    database = cosmos_client.get_database_client(database_id)
    cosmos_datacontainer = database.get_container_client(container_id)

    return cosmos_client, database, cosmos_datacontainer

def create_anscosmos_client():
    # Cosmos DB 接続設定
    endpoint = os.getenv("AZURE_COSMOSDB_ENDPOINT")
    key = os.getenv("AZURE_COSMOSDB_KEY")
    database_id = os.getenv("AZURE_COSMOSDB_DATABASEID")
    container_id = os.getenv("AZURE_COSMOSDB_ANSCONTAINER")
    
    # クライアント作成
    cosmos_client = CosmosClient(endpoint, credential=key)
    database = cosmos_client.get_database_client(database_id)
    cosmos_anscontainer = database.get_container_client(container_id)

    return cosmos_client, database, cosmos_anscontainer