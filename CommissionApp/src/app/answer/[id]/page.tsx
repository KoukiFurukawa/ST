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
  const [isAndroid, setIsAndroid] = useState(false);
  const formRef = useRef(null);
  const answerRef = useRef(null);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
      setIsAndroid(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { recipientName, recipientAddress, grantorName, grantorAddress } = formData;
    if (!recipientName || !recipientAddress || !grantorName || !grantorAddress) {
      alert("すべての欄を入力してください。");
      return;
    }
    setIsSubmitted(true);
  };

  const handleBackToForm = () => {
    setIsSubmitted(false);
  };

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

  const handleLogin = async () => {
    if (isAndroid && "NDEFReader" in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        ndef.onreading = (event: any) => {
          const message = event.message;
          for (const record of message.records) {
            console.log("NFC record:", record);
            alert("マイナンバーカードのNFCを読み取りました。ログイン完了。");
            setIsLoggedIn(true);
          }
        };
      } catch (error) {
        alert("NFC読み取りに失敗しました。対応端末を使用してください。");
      }
    } else {
      alert("この端末はNFCに対応していないか、Android端末ではありません。");
    }
  };

  const handleAdminLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">マイナンバー ログイン</h1>
          {isAndroid ? (
            <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
            >
              マイナンバーカードでログイン（NFC）
            </button>
          ) : (
            <p className="mb-4 text-gray-600">この端末はNFCログインに対応していません。</p>
          )}
          <button
            onClick={handleAdminLogin}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full"
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
              className="border p-2 mb-4 w-full"
            />
            <label className="block mb-2">受任者住所:</label>
            <input
              type="text"
              name="recipientAddress"
              value={formData.recipientAddress}
              onChange={handleInputChange}
              className="border p-2 mb-4 w-full"
            />
            <label className="block mb-2">委任者名:</label>
            <input
              type="text"
              name="grantorName"
              value={formData.grantorName}
              onChange={handleInputChange}
              className="border p-2 mb-4 w-full"
            />
            <label className="block mb-2">委任者住所:</label>
            <input
              type="text"
              name="grantorAddress"
              value={formData.grantorAddress}
              onChange={handleInputChange}
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
              送信する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerPage;