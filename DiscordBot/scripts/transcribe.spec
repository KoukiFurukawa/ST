# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import copy_metadata
import whisper
import os

# whisper/assets のパスを動的に取得
whisper_assets_path = os.path.join(os.path.dirname(whisper.__file__), "assets")

# datas: .exe に同梱する追加ファイル（データファイルやリソースなど）のリスト
datas = [
    (whisper_assets_path, 'whisper/assets')
]
datas += copy_metadata('openai-whisper', recursive=True)

# Analysis: 依存関係解析やバイナリ作成のための設定
a = Analysis(
    ['transcribe.py'],           # メインとなるPythonスクリプト
    pathex=[],                   # スクリプト探索パス（空ならカレントディレクトリ）
    binaries=[],                 # .exeに含める追加バイナリファイル
    datas=datas,                 # 上で指定したデータファイル
    hiddenimports=['tqdm'],      # PyInstallerが自動検出できない隠れたimport
    hookspath=[],                # 独自hookファイルのパス
    hooksconfig={},              # hookの追加設定
    runtime_hooks=[],            # 実行時に読み込むhookスクリプト
    excludes=[],                 # 除外するモジュール
    noarchive=False,             # .pycを単一アーカイブにまとめるか
    optimize=0,                  # 最適化レベル（0:なし, 1:-O, 2:-OO）
)

# PYZ: Pythonコードを圧縮アーカイブ（pyzファイル）にまとめる
pyz = PYZ(a.pure)

# EXE: 実行ファイル(.exe)の作成設定
exe = EXE(
    pyz,                         # 圧縮されたPythonコード
    a.scripts,                   # エントリポイントとなるスクリプト
    a.binaries,                  # バイナリファイル
    a.datas,                     # データファイル
    [],                          # その他リソース
    name='transcribe',           # 出力されるexeファイル名
    debug=False,                 # デバッグ情報を含めるか
    bootloader_ignore_signals=False, # シグナル無視設定
    strip=False,                 # バイナリのストリップ（不要な情報削除）
    upx=True,                    # UPX圧縮を使うか
    upx_exclude=[],              # UPX圧縮除外ファイル
    runtime_tmpdir=None,         # 一時ディレクトリ指定
    console=True,                # コンソールアプリ(True) or GUIアプリ(False)
    disable_windowed_traceback=False, # GUI時のトレースバック表示
    argv_emulation=False,        # Mac用: argvエミュレーション
    target_arch=None,            # ターゲットアーキテクチャ
    codesign_identity=None,      # Mac用: コード署名
    entitlements_file=None,      # Mac用: entitlementsファイル
)

# Copyright (c) 2025 古川幸樹, 宮浦悠月士
# このソースコードは自由に使用、複製、改変、再配布することができます。
# ただし、著作権表示は削除しないでください。 