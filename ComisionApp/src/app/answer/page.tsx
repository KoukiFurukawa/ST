"use client";

import React, { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

const MagneticLogin = ({ onLoginSuccess }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleCardLogin = async () => {
        try {
            if ("NFCReader" in window) {
                const nfc = new window.NFCReader();
                nfc.onreading = (event) => {
                    const { serialNumber } = event;
                    if (serialNumber) {
                        setIsLoggedIn(true);
                        onLoginSuccess();
                    } else {
                        setErrorMessage("ICカードの読み取りに失敗しました");
                    }
                };
                await nfc.scan();
            } else {
                setErrorMessage("この端末はNFCをサポートしていません");
            }
        } catch (error) {
            setErrorMessage("NFCの読み取りに失敗しました。NFCが有効か確認してください");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6">マイナンバーログイン</h1>
                {isLoggedIn ? (
                    <p className="text-green-600 font-semibold">ログイン成功！</p>
                ) : (
                    <>
                        <button
                            onClick={handleCardLogin}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
                        >
                            ICカードをかざす
                        </button>
                        {errorMessage && (
                            <p className="text-red-600">{errorMessage}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const AnswerPage = () => {
    const [formData, setFormData] = useState({
        recipientName: "",
        recipientAddress: "",
        grantorName: "",
        grantorAddress: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const answerRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { recipientName, recipientAddress, grantorName, grantorAddress } = formData;
        if (!recipientName || !recipientAddress || !grantorName || !grantorAddress) {
            alert("すべての欄を入力してください。");
            return;
        }
        setIsSubmitted(true);
    };

    const handleSaveImage = () => {
        if (answerRef.current) {
            toPng(answerRef.current).then((dataUrl) => {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "委任状.png";
                link.click();
            });
        }
    };

    return isSubmitted ? (
        <div ref={answerRef} className="p-4">
            <p>受任者名: {formData.recipientName}</p>
            <p>受任者住所: {formData.recipientAddress}</p>
            <p>委任者名: {formData.grantorName}</p>
            <p>委任者住所: {formData.grantorAddress}</p>
            <button onClick={handleSaveImage}>画像として保存</button>
        </div>
    ) : (
        <form onSubmit={handleSubmit}>
            <input name="recipientName" onChange={handleInputChange} placeholder="受任者名" />
            <input name="recipientAddress" onChange={handleInputChange} placeholder="受任者住所" />
            <input name="grantorName" onChange={handleInputChange} placeholder="委任者名" />
            <input name="grantorAddress" onChange={handleInputChange} placeholder="委任者住所" />
            <button type="submit">確認する</button>
        </form>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div>
            {isLoggedIn ? <AnswerPage /> : <MagneticLogin onLoginSuccess={() => setIsLoggedIn(true)} />}
        </div>
    );
};

export default App;
