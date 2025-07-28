// Copyright (c) 2025 古川幸樹, 小村善
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。 

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import { FormTemplate } from "@/lib/interfaces"; 
import Swal from "sweetalert2";
import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useState, useRef } from "react";

const AnswerPage = () => {
  const params = useParams();
  const formId = params.id as string;

  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNfcPrompt, setShowNfcPrompt] = useState(false);
  
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientAddress: "",
    grantorName: "",
    grantorAddress: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef(null);
  const answerRef = useRef(null);

  useEffect(() => {
    if (formId) {
      const fetchFormTemplate = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/getform/${formId}`);
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 404) {
              setError(`指定されたIDのフォームが見つかりません。(ID: ${formId})`);
            } else {
              setError(`フォームの読み込みに失敗しました: ${errorData.details || response.statusText}`);
            }
            setFormTemplate(null);
            return;
          }
          const data: FormTemplate = await response.json();
          setFormTemplate(data);
          setFormData(prev => ({
            ...prev,
            recipientName: data.recipientName || "",
            recipientAddress: data.recipientAddress || "",
            grantorName: "", 
            grantorAddress: "",
          }));
        } catch (e) {
          console.error("Failed to fetch form template:", e);
          setError(`フォームの読み込み中に予期せぬエラーが発生しました。${e instanceof Error ? e.message : ''}`);
          setFormTemplate(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFormTemplate();
    } else {
      setError("フォームIDがURLに含まれていません。");
      setIsLoading(false);
    }
  }, [formId]);

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
    if (!formTemplate) { // Check if formTemplate is loaded
      Swal.fire('エラー', 'フォーム情報が読み込まれていません。ページを再読み込みしてください。', 'error');
      return;
    }
    if (!recipientName || !recipientAddress || !grantorName || !grantorAddress) {
      alert("すべての欄を入力してください。");
      return;
    }
    setIsSubmitted(true);
  };

  // 管理者用ログイン（動作確認用）
  const handleAdminLogin = () => {
    setIsLoggedIn(true);
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

  const handleSendAnswer = async () => {
    if (!formTemplate) {
      Swal.fire('エラー', 'フォーム情報が読み込まれていません。', 'error');
      return;
    }
    if (!isSubmitted) {
      Swal.fire('エラー', 'まずフォーム内容を確認し、提出準備を完了してください。', 'error');
      return;
    }

    const userId = uuidv4(); // Generate a unique user ID
    const commissionID = formId;

    const answerPayload = {
      commissionID,
      userID: userId,
      answer: JSON.stringify({
        formTitle: formTemplate.title,
        formDescription: formTemplate.description,
        recipientName: formData.recipientName,
        recipientAddress: formData.recipientAddress,
        grantorName: formData.grantorName,
        grantorAddress: formData.grantorAddress,
        submittedAt: new Date().toISOString(),
      }),
    };

    Swal.fire({
      title: '処理中...',
      text: '回答を送信しています。',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch('/api/submitanswer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `サーバーエラー: ${response.status}`);
      }

      // const result = await response.json(); // Assuming the API returns some confirmation
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '回答が正常に送信されました。',
      });
      // Optionally, redirect or clear form
      // setIsSubmitted(false); 
      // setFormData({ recipientName: "", recipientAddress: "", grantorName: "", grantorAddress: ""});


    } catch (error) {
      console.error("Answer submission error:", error);
      Swal.fire({
        icon: 'error',
        title: '送信エラー',
        text: `回答の送信中にエラーが発生しました。(${(error as Error).message || '不明なエラー'})`,
      });
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div role="status" className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-xl mt-4">フォームを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">エラー</h1>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{error}</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            管理画面に戻る
          </Link>
        </div>
      </div>
    );
  }
  
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
  // Removed isLoggedIn check and login UI

  if (!formTemplate) { // Fallback if formTemplate is still null after loading and no error
      return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
              <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
                  <h1 className="text-2xl font-bold mb-4 text-orange-600">情報なし</h1>
                  <p className="text-gray-700 mb-6">フォーム情報を読み込めませんでした。ページを再読み込みするか、IDを確認してください。</p>
                  <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      管理画面に戻る
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2 text-center">
          {isSubmitted ? `確認画面: ${formTemplate.title}` : formTemplate.title || "委任状 入力フォーム"}
        </h1>

        {!isSubmitted && formTemplate.description && (
          <p className="text-sm text-gray-700 mb-6 whitespace-pre-wrap text-center">
            {formTemplate.description}
          </p>
        )}

        {isSubmitted ? (
          <div
            ref={answerRef}
            className="space-y-4 p-6 border border-gray-300 rounded-lg bg-white"
            style={{ fontFamily: "serif" }}
          >
            <h2 className="text-lg font-semibold text-center mb-2">{formTemplate.title}</h2>
            <p className="text-sm text-gray-700 mb-4 whitespace-pre-line text-center">{formTemplate.description}</p>
            <div className="border-t border-gray-400 my-2" />
            <div className="grid grid-cols-1 gap-2">
              <div className="flex flex-wrap">
                <span className="font-semibold min-w-[90px]">受任者名 :</span> 
                <span className="break-all">{formData.recipientName}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="font-semibold min-w-[90px]">受任者住所 :</span> 
                <span className="break-all">{formData.recipientAddress}</span>
              </div>
              <div className="border-t border-gray-400 my-2" />
              <div className="flex flex-wrap">
                <span className="font-semibold min-w-[90px]">委任者名 :</span> 
                <span className="break-all">{formData.grantorName}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="font-semibold min-w-[90px]">委任者住所 :</span> 
                <span className="break-all">{formData.grantorAddress}</span>
              </div>
            </div>
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
            {/* <button
              onClick={handleSaveImage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              画像として保存
            </button> */}
            <button
              onClick={handleBackToForm}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              戻る
            </button>
            <button
              onClick={handleSendAnswer}
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