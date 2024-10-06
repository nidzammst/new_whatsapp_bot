const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const { fetchMessageFromFlip, fetchJsonData } = require("./utils");
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "../../.wwebjs_auth/",
  }),
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

let temporaryDataArray = [];

// Fungsi untuk menyimpan chat dan nomor WhatsApp sementara
const saveTemporaryData = async (
  question,
  answer,
  category,
  waNumber,
  name,
  description
) => {
  try {
    // Tambahkan objek ke dalam array temporaryDataArray
    temporaryDataArray.push({
      question,
      answer,
      category,
      waNumber,
      name,
      description,
      timestamp: Date.now(),
    });

    // Atur timeout untuk menghapus objek setelah 10 menit
    setTimeout(() => {
      // Hapus objek yang memiliki timestamp lebih dari 10 menit yang lalu
      const currentTime = Date.now();
      temporaryDataArray = temporaryDataArray.filter(
        (data) => currentTime - data.timestamp <= 10 * 60 * 1000
      );

      console.log("Old data deleted after 10 minutes.");
    }, 10 * 60 * 1000); // 10 menit dalam milidetik
  } catch (error) {
    console.error("Error:", error.message);
  }
};
const removeDataByWaNumber = (waNumber) => {
  try {
    // Filter array untuk menciptakan array baru tanpa objek yang memiliki waNumber tertentu
    let filteredData = temporaryDataArray.filter(
      (data) => data.waNumber !== waNumber
    );

    // Update temporaryDataArray dengan array baru yang telah difilter
    temporaryDataArray = filteredData;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Get the current time with WIB (Western Indonesian Time) timezone
const currentTime = new Date();
const timezoneOptionsWIB = { timeZone: "Asia/Jakarta" };
const currentTimeWIB = new Intl.DateTimeFormat("id-ID", {
  timeStyle: "short",
  ...timezoneOptionsWIB,
}).format(currentTime);

let timeOfDay;

if (currentTimeWIB >= 0 && currentTimeWIB < 12) {
  timeOfDay = "Pagi";
} else if (currentTimeWIB >= 12 && currentTimeWIB < 15) {
  timeOfDay = "Siang";
} else if (currentTimeWIB >= 15 && currentTimeWIB < 18) {
  timeOfDay = "Sore";
} else {
  timeOfDay = "Malam";
}

client.on("message_create", (message) => {
  if (message.body === "hello") {
    message.reply("World");
  } else if (
    message.body.toLowerCase().replace(/\s/g, "") === "myprivateproject"
  ) {
    message.reply(
      `Hai Selamat ${timeOfDay} Nidzam's Bot disini\nSilahkan pilih Bot:\n*bot-1:* Asah Otak\n*bot-2:* Cak Lontong\n*bot-3:* Family 100\n*bot-4:* Siapakah Aku\n*bot-5:* Susun Kata\n*bot-6:* Tebak Bendera\n*bot-7:* Tebak Gambar\n*bot-8:* Tebak Kabupaten\n*bot-9:* Tebak Kalimat\n*bot-10:* Tebak Kata\n*bot-11:* Tebak Kimia\n*bot-12:* Tebak Lagu\n*bot-13:* Tebak Lirik\n*bot-14:* Tebak Tebakan\n*bot-15:* Tebak Teka-Teki\n*bot-16:* Kata-kata Bucin\n*bot-17:* Kata-kata Motivasi\n*bot-18:* Kata-kata Renungan\n*bot-19:* Kata-kata Truth\n*bot-20:* Kata-kata Dare\n*bot-21:* Quotes\n*bot-22:* Meme Challenge\n*Quran:* Al-Qur'an (Arab, terhemahan, tafsir, dan murottal)`
    );
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "quran") {
    removeDataByWaNumber(message.from);
    saveTemporaryData(
      null,
      null,
      "quran",
      message.from,
      message._data.notifyName,
      null
    );

    message.reply(
      "Mohon isi form berikut ini:\nSurat:\nAyat:\nTafsir:\nMurottal:"
    );
    message.reply(
      "Sebagai contoh, mohon isi formulir berikut ini:\nSurat: 24\nAyat: 35\nTafsir: ya(Ya/tidak/Tidak/✅/❌)\nMurottal: tidak(Ya/tidak/Tidak/✅/❌)"
    );
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-1") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-1",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading asahotak.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading asahotak.json. Please try again later."
        );
      }
    };

    const filePath = path.resolve(__dirname, "constants", "asahotak.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-2") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        let existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          removeDataByWaNumber(message.from);
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-2",
          message.from,
          message._data.notifyName,
          jsonData[randomNumber].deskripsi
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading caklontong.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading caklontong.json. Please try again later."
        );
      }
    };

    const filePath = path.resolve(__dirname, "constants", "caklontong.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-4") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        let existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          removeDataByWaNumber(message.from);
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-4",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading siapakahaku.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading siapakahaku.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "siapakahaku.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-5") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-5",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading susunkata.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading susunkata.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "susunkata.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-6") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].img,
          jsonData[randomNumber].name,
          "bot-6",
          message.from,
          message._data.notifyName,
          null
        );

        const media = await MessageMedia.fromUrl(jsonData[randomNumber].img);

        message.reply(media);
      } catch (error) {
        console.error("Error in reading tebakbendera.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebakbendera.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebakbendera.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-7") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].img,
          jsonData[randomNumber].jawaban,
          "bot-7",
          message.from,
          message._data.notifyName,
          jsonData[randomNumber].deskripsi
        );

        const media = await MessageMedia.fromUrl(jsonData[randomNumber].img);

        message.reply(media);
      } catch (error) {
        console.error("Error in reading tebakgambar.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebakgambar.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebakgambar.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-8") {
    message.reply("Not working😠...");
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-9") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-9",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebakkalimat.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebakkalimat.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebakkalimat.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-10") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-10",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebakkata.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebakkata.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebakkata.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-11") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].lambang,
          jsonData[randomNumber].unsur,
          "bot-11",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].lambang);
      } catch (error) {
        console.error("Error in reading tebakkimia.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebakkimia.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebakkimia.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-12") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].link_song,
          jsonData[randomNumber].jawaban,
          "bot-12",
          message.from,
          message._data.notifyName,
          jsonData[randomNumber].deskripsi
        );

        try {
          const media = await MessageMedia.fromUrl(
            jsonData[randomNumber].link_song,
            { unsafeMime: true }
          );

          message.reply(media);
        } catch (err) {
          throw new Error(err);
          message.reply(
            "Error while processing data.. Please try again later."
          );
        }
      } catch (error) {
        console.error("Error in reading tebaklagu.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebaklagu.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebaklagu.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-13") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-13",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebaklirik.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebaklirik.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebaklirik.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-14") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-14",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebaktebakan.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tebaktebakan.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tebaktebakan.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-16") {
    const filePath = path.resolve(__dirname, "constants", "bucin.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);
        const randomBucin = jsonData[randomNumber];

        if (typeof randomBucin !== "string") {
          throw new Error(
            "Invalid JSON format. Expected strings in the array."
          );
        }

        message.reply(`\`\`\`${randomBucin}\`\`\``);
      } catch (error) {
        console.error("Error in reading bucin.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply("Error in reading bucin.json. Please try again later.");
      }
    });
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-15") {
    const handleChatData = async (err, data) => {
      try {
        if (err) {
          throw new Error("Error reading file: " + err.message);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-15",
          message.from,
          message._data.notifyName,
          null
        );

        message.reply(jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tekateki.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading tekateki.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "constants", "tekateki.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-17") {
    const filePath = path.resolve(__dirname, "constants", "motivasi.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }

        // Parse JSON data
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid JSON format. Expected an array.");
        }

        const randomNumber = Math.floor(Math.random() * jsonData.length);
        const randomMotivasi = jsonData[randomNumber];

        if (typeof randomMotivasi !== "string") {
          throw new Error(
            "Invalid JSON format. Expected strings in the array."
          );
        }

        message.reply(`\`\`\`${randomMotivasi}\`\`\``);
      } catch (error) {
        console.error("Error in reading motivasi.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading motivasi.json. Please try again later."
        );
      }
    });
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-18") {
    const filePath = path.resolve(__dirname, "constants", "renungan.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }
        //Parse Json data
        const jsonData = JSON.parse(data);

        const randomNumber = Math.floor(Math.random() * jsonData.length);
        const getMedia = async () => {
          return await MessageMedia.fromUrl(jsonData[randomNumber]);
        };
        getMedia().then((media) => {
          message.reply(media);
        });
      } catch (error) {
        console.error("Error in reading renungan.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply(
          "Error in reading renungan.json. Please try again later."
        );
      }
    });
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-19") {
    const filePath = path.resolve(__dirname, "constants", "truth.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }
        //Parse Json data
        const jsonData = JSON.parse(data);
        const randomNumber = Math.floor(Math.random() * jsonData.length);

        message.reply(`\`\`\`${jsonData[randomNumber]}\`\`\``);
      } catch (error) {
        console.error("Error in reading truth.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply("Error in reading truth.json. Please try again later.");
      }
    });
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-20") {
    const filePath = path.resolve(__dirname, "constants", "dare.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }
        //Parse Json data
        const jsonData = JSON.parse(data);
        const randomNumber = Math.floor(Math.random() * jsonData.length);

        message.reply(`\`\`\`${jsonData[randomNumber]}\`\`\``);
      } catch (error) {
        console.error("Error in reading dare.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply("Error in reading dare.json. Please try again later.");
      }
    });
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-21") {
    const filePath = path.resolve(__dirname, "constants", "quotes.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }
        //Parse Json data
        const jsonData = JSON.parse(data);
        const randomNumber = Math.floor(Math.random() * jsonData.length);

        message.reply(
          `\`\`\`${jsonData[randomNumber].text}\`\`\`\n_By: ${jsonData[randomNumber].author}_`
        );
      } catch (error) {
        console.error("Error in reading quotes.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        message.reply("Error in reading quotes.json. Please try again later.");
      }
    });
  } else if (message.body.toLowerCase().replace(/\s/g, "") === "bot-22") {
    removeDataByWaNumber(message.from);
    const handleChatData = async (err, data) => {
      try {
        const flipData = await fetchMessageFromFlip();

        const existingChat = temporaryDataArray.find(
          (data) => data.waNumber === message.from
        );

        if (existingChat) {
          const removedChat = temporaryDataArray.filter(
            (data) => data.waNumber !== message.from
          );
        }
        const chat = saveTemporaryData(
          flipData.url,
          flipData.id,
          "bot-22",
          message.from,
          message._data.notifyName,
          flipData.name
        );

        const media = await MessageMedia.fromUrl(flipData.url);

        message.reply(media);
        message.reply(`Tuliskan Sebuah Meme di Gambar ini\n\n`);
        message.reply(`Tulisan Pertama: ...\nTulisan Kedua: ...`);
      } catch (error) {
        console.error("Error in fetching data from url:", error.message);
        message.reply(error.message);
      }
    };

    const filePath = path.resolve(__dirname, "constants", "asahotak.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else {
    try {
      const requesterData = temporaryDataArray.find(
        (data) => data.waNumber === message.from
      );
      if (!requesterData) {
        return;
      } else {
        if (
          requesterData.category === "bot-1" ||
          requesterData.category === "bot-4" ||
          requesterData.category === "bot-5" ||
          requesterData.category === "bot-6" ||
          requesterData.category === "bot-9" ||
          requesterData.category === "bot-10" ||
          requesterData.category === "bot-11" ||
          requesterData.category === "bot-12" ||
          requesterData.category === "bot-13" ||
          requesterData.category === "bot-14" ||
          requesterData.category === "bot-15"
        ) {
          const correctAnswer =
            requesterData.answer.toLowerCase() === message.body.toLowerCase();
          if (correctAnswer) {
            message.reply(
              `Bravo ${requesterData.name}! Anda sudah menjawab dengan benar!\nSelamat anda berhak mendapatkan sebuah *HADIAH* yang akan dikirimkan ke rumah anda, jika tidak datang juga berarti anda ditipu...`
            );
          } else {
            message.reply(
              `Sayang sekali jawaban anda masih salah\nJawaban: *${requesterData.answer}*`
            );
          }
        } else if (
          requesterData.category === "bot-2" ||
          requesterData.category === "bot-7"
        ) {
          const correctAnswer =
            requesterData.answer.toLowerCase() === message.body.toLowerCase();
          if (correctAnswer) {
            message.reply(
              `${requesterData.description}\nBravo! Anda sudah menjawab dengan benar!\nSelamat anda berhak mendapatkan sebuah *HADIAH* yang akan dikirimkan ke rumah anda, jika tidak datang juga berarti anda sudah tertipu`
            );
          } else {
            message.reply(
              `Sayang sekali jawaban anda masih salah\nJawaban: *${requesterData.answer}*\n👉: ${requesterData.description}`
            );
          }
        } else if (requesterData.category === "bot-22") {
          const [firstAnswer, secondAnswer] = message.body
            .split("\n")
            .map((line) => line.split(": ")[1]);
          const sendImg = async () => {
            try {
              const url = await fetchJsonData(
                requesterData.answer,
                firstAnswer,
                secondAnswer
              );
              const media = await MessageMedia.fromUrl(url);
              message.reply(media);
            } catch (error) {
              console.error(error.message);
              message.reply(error.message);
            }
          };
          sendImg();
        } else if (requesterData.category === "quran") {
          try {
            const suratMatch = message.body.match(/Surat: (\d+)/i);
            const ayatMatch = message.body.match(/Ayat: (\d+)/i);
            const tafsirMatch = message.body.match(/Tafsir: (\S+)/i);
            const murottalMatch = message.body.match(/Murottal: (\S+)/i);

            const surat = suratMatch ? suratMatch[1] : null;
            const ayat = ayatMatch ? ayatMatch[1] : null;

            if (!surat || !ayat) {
              message.reply();
            }

            let withMurottal = false;

            if (murottalMatch) {
              const murottalValue = murottalMatch[1].toLowerCase();

              // Menggunakan nilai boolean berdasarkan kemungkinan nilai Tafsir
              if (
                murottalValue.toLowerCase().replace(/\s/g, "") === "ya" ||
                murottalValue.toLowerCase().replace(/\s/g, "") === "✅"
              ) {
                withMurottal = true;
              } else if (
                murottalValue.toLowerCase().replace(/\s/g, "") === "tidak" ||
                murottalValue.toLowerCase().replace(/\s/g, "") === "❌"
              ) {
                withMurottal = false;
              }
            }

            let tafsir = false; // Inisialisasi nilai tafsir sebagai false secara default

            if (tafsirMatch) {
              const tafsirValue = tafsirMatch[1].toLowerCase();

              // Menggunakan nilai boolean berdasarkan kemungkinan nilai Tafsir
              if (
                tafsirValue.toLowerCase().replace(/\s/g, "") === "ya" ||
                tafsirValue.toLowerCase().replace(/\s/g, "") === "✅"
              ) {
                tafsir = true;
              } else if (
                tafsirValue.toLowerCase().replace(/\s/g, "") === "tidak" ||
                tafsirValue.toLowerCase().replace(/\s/g, "") === "❌"
              ) {
                tafsir = false;
              }
              const filePath = path.resolve(
                __dirname,
                "constants",
                "quran.json"
              );
              fs.readFile(filePath, "utf8", (err, data) => {
                try {
                  if (err) {
                    throw new Error(`Error reading file: ${err.message}`);
                  }
                  //Parse Json data
                  const jsonData = JSON.parse(data);

                  const checkSurat = jsonData[surat - 1];
                  const checkAyat = checkSurat.verses[ayat - 1];
                  const dataSurat = { ...checkSurat };
                  delete dataSurat.verses;

                  const dataAyat = { ...checkAyat, surah: dataSurat };
                  message.reply(
                    `Q.S.${surat}:${ayat}: \n${dataAyat.text.arab}`
                  );
                  message.reply(
                    `Terjemahan Q.S.${surat}:${ayat}: \n${dataAyat.translation.id}`
                  );

                  if (tafsir) {
                    message.reply(
                      `Tafsir Q.S.${surat}:${ayat}: \n${dataAyat.tafsir.id.long}`
                    );
                  }

                  if (withMurottal) {
                    try {
                      const sendQuranAudio = async () => {
                        const media = await MessageMedia.fromUrl(
                          dataAyat.audio.primary,
                          { unsafeMime: true }
                        );
                        message.reply(media);
                      };
                      sendQuranAudio();
                    } catch (err) {
                      throw new Error(err);
                      message.reply(
                        "Error: Cant send Audio from url. Please try again later."
                      );
                    }
                  }
                } catch (error) {
                  console.error("Error in reading quran.json:", error.message);
                  // Handle the error as needed, e.g., reply with an error message to the user
                  message.reply(
                    "Error in reading quran.json. Please try again later."
                  );
                }
              });
            } else {
              message.reply("Error: mohon ulangi lagi");
            }
          } catch (error) {
            console.error("Error:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply("Error:", error.message);
          }
        }
      }
      removeDataByWaNumber(message.from);
    } catch (error) {
      console.error("Error:", error.message);
      // Handle the error as needed, e.g., reply with an error message to the user
      message.reply("Error:", error.message);
    }
  }
});

client.initialize();
