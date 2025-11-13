// encryption.js

class AesEncryption {
    constructor() {
        this.secretKey = "";
        this.ivParam = "";
        this.base64String = "";
    }
};

function aesEncrypt(aes, value)
{
    const key = CryptoJS.enc.Base64.parse(aes.secretKey);
    const ivParam = CryptoJS.enc.Base64.parse(aes.ivParam);

    aes.base64String = CryptoJS.AES.encrypt(value, key, {
    iv: ivParam,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

function aesDecrypt(aes)
{
    const key = CryptoJS.enc.Base64.parse(aes.secretKey);
    const ivParam = CryptoJS.enc.Base64.parse(aes.ivParam);

    const decrypted = CryptoJS.AES.decrypt(aes.base64String, key, {
    iv: ivParam,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}