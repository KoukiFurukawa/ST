"use client";

import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";

const AnswerPage = () => {
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientAddress: "",
    grantorName: "",
    grantorAddress: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNfcPrompt, setShowNfcPrompt] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // 入力変更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { recipientName, recipientAddress, grantorName, grantorAddress } = formData;
    if (!recipientName || !recipientAddress || !grantorName || !grantorAddress) {
      alert("すべての欄を入力してください。");
      return;
    }
    setIsSubmitted(true);
  };

  // 戻るボタン
  const handleBackToForm = () => {
    setIsSubmitted(false);
  };

  // 画像保存
  const handleSaveImage = () => {
    if (answerRef.current) {
      toPng(answerRef.current, { width: 800, height: 600 })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "委任状.png";
          link.click();
        })
        .catch((err) => console.error("Error generating image", err));
    }
  };

  // Enterで送信防止 + 送信実行
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  // NFC読み取り開始
  const handleLogin = async () => {
    if (!("NDEFReader" in window)) {
      alert("この端末・ブラウザはNFCに対応していません。");
      return;
    }

    setShowNfcPrompt(true);
    alert("スマホを交通系ICカードやNFCタグにかざしてください...");

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.onreading = (event: any) => {
        // どんなNFCでも検出できたらログイン成功扱いにする
        setIsLoggedIn(true);
        setShowNfcPrompt(false);
      };

      ndef.onreadingerror = (event: any) => {
        // 読み取りエラーでも次に進む（要件によるが）
        alert("NFC読み取りに失敗しましたが、カードがかざされたとみなして次の画面に進みます。");
        setIsLoggedIn(true);
        setShowNfcPrompt(false);
      };

      // 5秒で読み取り失敗とみなして戻す
      setTimeout(() => {
        if (!isLoggedIn) {
          alert("NFCカードが検出されませんでした。ログイン画面に戻ります。");
          setShowNfcPrompt(false);
        }
      }, 5000);
    } catch (error) {
      alert("NFCスキャンが開始できませんでした。対応端末か確認してください。");
      setShowNfcPrompt(false);
      console.error(error);
    }
  };

  // 管理者用ログイン（動作確認用）
  const handleAdminLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">マイナンバー ログイン</h1>
          <button
            onClick={handleLogin}
            disabled={showNfcPrompt}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4 ${
              showNfcPrompt ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            マイナンバーカードでログイン（スマホNFC）
          </button>
          <p className="text-sm text-gray-500 mt-2">
            ※ Android版Chromeのみ対応。iPhoneやPCではご利用いただけません。
          </p>
          <button
            onClick={handleAdminLogin}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
          >
            管理者用ログイン（動作確認）
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSubmitted ? "確認画面" : "委任状 入力フォーム"}
        </h1>

        {isSubmitted ? (
          <div
            ref={answerRef}
            className="space-y-4 p-6 border border-gray-300 rounded-lg bg-white"
            style={{ fontFamily: "serif" }}
          >
            <p className="text-center font-semibold">私は下記の通り、業務を委託します。</p>
            <div className="border-t border-gray-400 my-2" />
            <p><span className="font-semibold">受任者名 :</span> {formData.recipientName}</p>
            <p><span className="font-semibold">受任者住所 :</span> {formData.recipientAddress}</p>
            <div className="border-t border-gray-400 my-2" />
            <p><span className="font-semibold">委任者名 :</span> {formData.grantorName}</p>
            <p><span className="font-semibold">委任者住所 :</span> {formData.grantorAddress}</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit}>
            <label className="block mb-2">受任者名:</label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="border p-2 mb-4 w-full"
            />

            <label className="block mb-2">受任者住所:</label>
            <input
              type="text"
              name="recipientAddress"
              value={formData.recipientAddress}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="border p-2 mb-4 w-full"
            />

            <label className="block mb-2">委任者名:</label>
            <input
              type="text"
              name="grantorName"
              value={formData.grantorName}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="border p-2 mb-4 w-full"
            />

            <label className="block mb-2">委任者住所:</label>
            <input
              type="text"
              name="grantorAddress"
              value={formData.grantorAddress}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="border p-2 mb-4 w-full"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
            >
              確認する
            </button>
          </form>
        )}

        {isSubmitted && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleSaveImage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              画像として保存
            </button>
            <button
              onClick={handleBackToForm}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              戻る
            </button>
            <button
              onClick={() => {}}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              QRコード表示（未実装）
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerPage;
