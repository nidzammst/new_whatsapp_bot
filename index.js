const { Client, LocalAuth, MessageMedia, Poll } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { timeOfDay } = require("./src/utils/time");

const fs = require("fs");
const path = require("path");
const { fetchMessageFromFlip } = require("./src/utils");

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

const removeTemporaryNumber = (waNumber) => {
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

let dataAyatArray = [];

saveDataAyat = (data, waNumber) => {
  dataAyatArray.push({
    waNumber,
    data,
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
};

const removeDataAyat = (waNumber) => {
  try {
    // Filter array untuk menciptakan array baru tanpa objek yang memiliki waNumber tertentu
    let filteredData = dataAyatArray.filter(
      (data) => data.waNumber !== waNumber
    );

    // Update temporaryDataArray dengan array baru yang telah difilter
    temporaryDataArray = filteredData;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "pk-ltjQWZOTeDqQuzELwGfUSwdkBnKYvzFtxCcazRCwlhuHjcrx",
  baseURL: "https://api.pawan.krd/cosmosrp/v1",
});

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".wwebjs_auth/",
  }),
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

const authenticate = () => {
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on(`auth_failure`, (msg) => {
    console.log(`auth_failure`, msg);
  });

  client.on(`disconnected`, (reason) => {
    console.log(`disconnected`, reason);
  });

  client.initialize();
};

client.on("message_create", (message) => {
  const introPoll1 = new Poll(
    `Hai Selamat ${timeOfDay} Nidzam's Bot disini\nSilahkan pilih Bot`,
    [
      "Asah Otak",
      "Cak Lontong",
      "Family 100",
      "Siapakah Aku",
      "Susun Kata",
      "Tebak Bendera",
      "Tebak Gambar",
      "Tebak Kalimat",
      "Tebak Kata",
      "Tebak Kimia",
      "Tebak Lagu",
      "Chatgpt",
    ]
  );

  const introPoll2 = new Poll(`lanjutan...`, [
    "Tebak Lirik",
    "Tebak Tebakan",
    "Tebak Teka-Teki",
    "Kata-kata Bucin",
    "Kata-kata Motivasi",
    "Kata-kata Renungan",
    "Truth Challenge",
    "Dare Challenge",
    "Quotes",
    "Meme Challenge",
    "Al-Qur'an (Arab, terhemahan, tafsir, dan murottal)",
    "Hadits",
  ]);
  if (message.body.toLowerCase().replace(/\s/g, "") === "!bot") {
    client.sendMessage(message.from, introPoll1);
    client.sendMessage(message.from, introPoll2);
  } else {
    try {
      const requesterData = temporaryDataArray.find(
        (data) => data.waNumber === message.from
      );
      if (!requesterData) {
        return;
      } else if (requesterData.category === "quran") {
        try {
          const [surahNumber, ayahNumber] = message.body.split(":");
          const surat = surahNumber ? surahNumber[1] : null;
          const ayat = ayahNumber ? ayahNumber[1] : null;

          if (!surat || !ayat) {
            message.reply();
          }

          const filePath = path.resolve(
            __dirname,
            "src/constants",
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

              saveDataAyat(dataAyat, message.from);

              message
                .reply(`Q.S.${surat}:${ayat}: \n${dataAyat.text.arab}`)
                .then(() =>
                  message.reply(
                    `Terjemahan Q.S.${surat}:${ayat}: \n${dataAyat.translation.id}`
                  )
                )
                .then(() =>
                  message.reply(
                    `Tafsir Q.S.${surat}:${ayat}: \n${dataAyat.tafsir.id.long}`
                  )
                )
                .then(() => {
                  const mutotalPoll = new Poll(`lanjutan...`, [
                    `Unduh Murotal?`,
                    "Tidak",
                  ]);
                  message.reply(mutotalPoll);
                });
            } catch (error) {
              console.error("Error in reading quran.json:", error.message);
              message.reply(
                "Error in reading quran.json. Please try again later."
              );
            }
          });
        } catch (error) {
          console.error("Error:", error.message);
          message.reply("Error:", error.message);
        }
      } else if (requesterData.category === "abu-dawud") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 4419) {
          message.reply("Total Hadits: 4419");
          return;
        }

        const filePath = path.resolve(
          __dirname,
          "src/constants",
          "abu-dawud.json"
        );
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Abu Dawud No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "ahmad") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 4305) {
          message.reply("Total Hadits: 4305");
          return;
        }
        const filePath = path.resolve(__dirname, "src/constants", "ahmad.json");
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Ahmad No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "bukhari") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 6638) {
          message.reply("Total Hadits: 6638");
          return;
        }
        const filePath = path.resolve(
          __dirname,
          "src/constants",
          "bukhari.json"
        );
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Bukhari No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "darimi") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 2949) {
          message.reply("Total Hadits: 2949");
          return;
        }
        const filePath = path.resolve(
          __dirname,
          "src/constants",
          "darimi.json"
        );
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Darimi No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "ibnu-majjah") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 4285) {
          message.reply("Total Hadits: 4285");
          return;
        }
        const filePath = path.resolve(
          __dirname,
          "src/constants",
          "ibnu-majah.json"
        );
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Ibnu Majjah No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "malik") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 1587) {
          message.reply("Total Hadits: 1587");
          return;
        }
        const filePath = path.resolve(__dirname, "src/constants", "malik.json");
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Malik No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "muslim") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 4930) {
          message.reply("Total Hadits: 4930");
          return;
        }
        const filePath = path.resolve(
          __dirname,
          "src/constants",
          "muslim.json"
        );
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Muslim No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "nasai") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 5364) {
          message.reply("Total Hadits: 5364");
          return;
        }
        const filePath = path.resolve(__dirname, "src/constants", "nasai.json");
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Nasai No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (requesterData.category === "tirmidzi") {
        const haditsNumber = parseInt(
          message.body.toLowerCase().replace(/\s/g, "")
        );
        if (haditsNumber >= 3625) {
          message.reply("Total Hadits: 3625");
          return;
        }
        const filePath = path.resolve(
          __dirname,
          "src/constants",
          "tirmidzi.json"
        );
        fs.readFile(filePath, "utf8", (err, data) => {
          try {
            if (err) {
              throw new Error(`Error reading file: ${err.message}`);
            }
            //Parse Json data
            const jsonData = JSON.parse(data);
            message
              .reply(`Hadits Riwayat Tirmidzi No. ${message.body}`)
              .then(() => message.reply(jsonData[message.body - 1].arab))
              .then(() => message.reply(jsonData[message.body - 1].id));
          } catch (error) {
            console.error("Error in reading hadits.json:", error.message);
            // Handle the error as needed, e.g., reply with an error message to the user
            message.reply(
              "Error in reading hadits.json. Please try again later."
            );
          }
        });
      } else if (
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
          message
            .reply(`Sayang sekali jawaban anda masih salah`)
            .then(() =>
              message.reply(
                `Soal: ${requesterData.question}\n\nJawaban: *${requesterData.answer}*`
              )
            );
        }
      } else if (requesterData.category === "chatgpt") {
        const createChat = async () => {
          const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: requesterData.waNumber }],
            model: "gpt-3.5-turbo",
          });
          message.reply(chatCompletion.choices[0].message.content).then(() => {
            const chatPoll = new Poll(`.`, ["Ulangi Pesan", "Tutup Pesan"]);
            client.sendMessage(message.from, chatPoll);
          });
        };

        createChat();
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
          message
            .reply(`Sayang sekali jawaban anda masih salah`)
            .then(() =>
              message.reply(
                `Jawaban: *${requesterData.answer}*\n👉: ${requesterData.description}`
              )
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
      }

      removeTemporaryNumber(message.from);
    } catch (error) {
      console.error("Error:", error.message);
      // Handle the error as needed, e.g., reply with an error message to the user
      message.reply("Error:", error.message);
    }
  }
});

client.on("vote_update", async (vote) => {
  if (
    vote.selectedOptions[0]?.name ===
    "Al-Qur'an (Arab, terhemahan, tafsir, dan murottal)"
  ) {
    client
      .sendMessage(
        vote.voter,
        "Sebagai contoh, jawab dengan pesan seperti dibawah ini."
      )
      .then(() => client.sendMessage(vote.voter, "24:55"));

    removeTemporaryNumber(vote.voter);
    saveTemporaryData(null, null, "quran", vote.voter, null, null);
  } else if (vote.selectedOptions[0]?.name === "Unduh Murotal?") {
    try {
      const sendQuranAudio = async () => {
        const dataAyat = dataAyatArray.find(
          (data) => data.waNumber === vote.voter
        );
        const media = await MessageMedia.fromUrl(dataAyat.data.audio.primary, {
          unsafeMime: true,
        });
        client.sendMessage(dataAyat.waNumber, media);
        removeDataAyat();
      };
      sendQuranAudio();
    } catch (err) {
      throw new Error(err);
      client.sendMessage(
        vote.voter,
        "Error: Cant send Audio from url. Please try again later."
      );
    }
  } else if (vote.selectedOptions[0]?.name === "Asah Otak") {
    removeTemporaryNumber(vote.voter);
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

        temporaryDataArray.filter((data) => data.waNumber !== vote.voter);
        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-1",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading asahotak.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading asahotak.json. Please try again later."
        );
      }
    };

    const filePath = path.resolve(__dirname, "src/constants", "asahotak.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Cak Lontong") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-2",
          vote.voter,
          null,
          jsonData[randomNumber].deskripsi
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading caklontong.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading caklontong.json. Please try again later."
        );
      }
    };

    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "caklontong.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Family 100") {
    client.sendMessage(vote.voter, "Family 100 belum tersedia");
  } else if (vote.selectedOptions[0]?.name === "Siapakah Aku") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-4",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading siapakahaku.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading siapakahaku.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "siapakahaku.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Susun Kata") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-5",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading susunkata.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading susunkata.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "src/constants", "susunkata.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Tebak Bendera") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].img,
          jsonData[randomNumber].name,
          "bot-6",
          vote.voter,
          null,
          null
        );

        const media = await MessageMedia.fromUrl(jsonData[randomNumber].img);

        client.sendMessage(vote.voter, media);
      } catch (error) {
        console.error("Error in reading tebakbendera.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebakbendera.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "tebakbendera.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Tebak Gambar") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].img,
          jsonData[randomNumber].jawaban,
          "bot-7",
          vote.voter,
          null,
          jsonData[randomNumber].deskripsi
        );

        const media = await MessageMedia.fromUrl(jsonData[randomNumber].img);

        client.sendMessage(vote.voter, media);
      } catch (error) {
        console.error("Error in reading tebakgambar.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebakgambar.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "tebakgambar.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (
    vote.selectedOptions[0]?.name === "Chatgpt" ||
    vote.selectedOptions[0]?.name === "Ulangi Pesan"
  ) {
    removeTemporaryNumber(vote.voter);

    const chatgptResponse = [
      "Halo! Ini saya, gpt-3.5-turbo. Apa kabar hari ini?\n\nPesan Anda :",
      "Selamat pagi! Saya harap harimu menyenangkan. Ini gpt-3.5-turbo.\n\nPesan Anda :",
      "Hai! Senang bisa chatting denganmu. Saya gpt-3.5-turbo.\n\nPesan Anda :",
      "Selamat sore! Ini gpt-3.5-turbo. Ada yang ingin dibicarakan?\n\nPesan Anda :",
      "Hello! Gimana hari ini? Saya gpt-3.5-turbo.\n\nPesan Anda :",
      "Hi! Semoga semuanya baik-baik saja. Saya gpt-3.5-turbo.\n\nPesan Anda :",
      "Selamat malam! Ini gpt-3.5-turbo. Apa yang sedang kamu lakukan?\n\nPesan Anda :",
      "Halo! Ada kabar menarik? Saya gpt-3.5-turbo.\n\nPesan Anda :",
      "Hey! Lagi sibuk atau bisa ngobrol? Saya gpt-3.5-turbo.\n\nPesan Anda :",
      "Halo! Apa yang bisa saya bantu hari ini? Ini gpt-3.5-turbo.\n\nPesan Anda :",
    ];

    const randomNumber = Math.floor(Math.random() * chatgptResponse.length);

    client.sendMessage(vote.voter, chatgptResponse[randomNumber]);

    saveTemporaryData(null, null, "chatgpt", vote.voter, null, null);
  } else if (vote.selectedOptions[0]?.name === "Tutup Pesan") {
    client.sendMessage(
      vote.voter,
      "Mohon maaf fitur lanjutkan pesan Chatgpt belum tersedia, coba lagi lain waktu"
    );
    removeTemporaryNumber(vote.voter);
  } else if (vote.selectedOptions[0]?.name === "Tebak Kalimat") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-9",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebakkalimat.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebakkalimat.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "tebakkalimat.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Tebak Kata") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-10",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebakkata.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebakkata.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "src/constants", "tebakkata.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Tebak Kimia") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].lambang,
          jsonData[randomNumber].unsur,
          "bot-11",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].lambang);
      } catch (error) {
        console.error("Error in reading tebakkimia.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebakkimia.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "tebakkimia.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Tebak Lagu") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].link_song,
          jsonData[randomNumber].jawaban,
          "bot-12",
          vote.voter,
          null,
          jsonData[randomNumber].deskripsi
        );

        try {
          const media = await MessageMedia.fromUrl(
            jsonData[randomNumber].link_song,
            { unsafeMime: true }
          );

          client.sendMessage(vote.voter, media);
        } catch (err) {
          throw new Error(err);
          client.sendMessage(
            vote.voter,
            "Error while processing data.. Please try again later."
          );
        }
      } catch (error) {
        console.error("Error in reading tebaklagu.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebaklagu.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "src/constants", "tebaklagu.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Tebak Lirik") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-13",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebaklirik.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebaklirik.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "tebaklirik.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Tebak-tebakan") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-14",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tebaktebakan.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tebaktebakan.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(
      __dirname,
      "src/constants",
      "tebaktebakan.json"
    );
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Teka-Teki") {
    removeTemporaryNumber(vote.voter);

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

        const chat = saveTemporaryData(
          jsonData[randomNumber].soal,
          jsonData[randomNumber].jawaban,
          "bot-15",
          vote.voter,
          null,
          null
        );

        client.sendMessage(vote.voter, jsonData[randomNumber].soal);
      } catch (error) {
        console.error("Error in reading tekateki.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading tekateki.json. Please try again later."
        );
      }
    };
    const filePath = path.resolve(__dirname, "src/constants", "tekateki.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Kata-kata Bucin") {
    removeTemporaryNumber(vote.voter);

    const filePath = path.resolve(__dirname, "src/constants", "bucin.json");

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

        client.sendMessage(vote.voter, `\`\`\`${randomBucin}\`\`\``);
      } catch (error) {
        console.error("Error in reading bucin.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading bucin.json. Please try again later."
        );
      }
    });
  } else if (vote.selectedOptions[0]?.name === "Kata-kata Motivasi") {
    removeTemporaryNumber(vote.voter);

    const filePath = path.resolve(__dirname, "src/constants", "motivasi.json");
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

        client.sendMessage(vote.voter, `\`\`\`${randomMotivasi}\`\`\``);
      } catch (error) {
        console.error("Error in reading motivasi.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading motivasi.json. Please try again later."
        );
      }
    });
  } else if (vote.selectedOptions[0]?.name === "Kata-kata Renungan") {
    const filePath = path.resolve(__dirname, "src/constants", "renungan.json");
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
          client.sendMessage(vote.voter, media);
        });
      } catch (error) {
        console.error("Error in reading renungan.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading renungan.json. Please try again later."
        );
      }
    });
  } else if (vote.selectedOptions[0]?.name === "Truth Challenge") {
    const filePath = path.resolve(__dirname, "src/constants", "truth.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }
        //Parse Json data
        const jsonData = JSON.parse(data);
        const randomNumber = Math.floor(Math.random() * jsonData.length);

        client.sendMessage(vote.voter, `\`\`\`${jsonData[randomNumber]}\`\`\``);
      } catch (error) {
        console.error("Error in reading truth.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading truth.json. Please try again later."
        );
      }
    });
  } else if (vote.selectedOptions[0]?.name === "Dare Challenge") {
    const filePath = path.resolve(__dirname, "src/constants", "dare.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }
        //Parse Json data
        const jsonData = JSON.parse(data);
        const randomNumber = Math.floor(Math.random() * jsonData.length);

        client.sendMessage(vote.voter, `\`\`\`${jsonData[randomNumber]}\`\`\``);
      } catch (error) {
        console.error("Error in reading dare.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading dare.json. Please try again later."
        );
      }
    });
  } else if (vote.selectedOptions[0]?.name === "Quotes of the Day") {
    const filePath = path.resolve(__dirname, "src/constants", "quotes.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      try {
        if (err) {
          throw new Error(`Error reading file: ${err.message}`);
        }
        //Parse Json data
        const jsonData = JSON.parse(data);
        const randomNumber = Math.floor(Math.random() * jsonData.length);

        client.sendMessage(
          vote.voter,
          `\`\`\`${jsonData[randomNumber].text}\`\`\`\n_By: ${jsonData[randomNumber].author}_`
        );
      } catch (error) {
        console.error("Error in reading quotes.json:", error.message);
        // Handle the error as needed, e.g., reply with an error message to the user
        client.sendMessage(
          vote.voter,
          "Error in reading quotes.json. Please try again later."
        );
      }
    });
  } else if (vote.selectedOptions[0]?.name === "Meme Challenge") {
    removeTemporaryNumber(vote.voter);

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
          vote.voter,
          null,
          flipData.name
        );

        const media = await MessageMedia.fromUrl(flipData.url);

        client.sendMessage(vote.voter, media);
        client.sendMessage(
          vote.voter,
          `Tuliskan Sebuah Meme di Gambar ini\n\n`
        );
        client.sendMessage(
          vote.voter,
          `Tulisan Pertama: ...\nTulisan Kedua: ...`
        );
      } catch (error) {
        console.error("Error in fetching data from url:", error.message);
        client.sendMessage(vote.voter, error.message);
      }
    };

    const filePath = path.resolve(__dirname, "src/constants", "asahotak.json");
    fs.readFile(filePath, "utf8", handleChatData);
  } else if (vote.selectedOptions[0]?.name === "Hadits") {
    const haditsPoll = new Poll(`Pilih Satu Rawi!`, [
      "Abu Dawud",
      "Ahmad",
      "Bukhari",
      "Darimi",
      "Ibnu Majah",
      "Malik",
      "Muslim",
      "Nasai",
      "Tirmidzi",
    ]);
    client.sendMessage(vote.voter, haditsPoll);
  } else if (vote.selectedOptions[0]?.name === "Abu Dawud") {
    saveTemporaryData(null, null, "abu-dawud", vote.voter, null, "abu-dawud");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 4419 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Ahmad") {
    saveTemporaryData(null, null, "ahmad", vote.voter, null, "ahmad");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 4305 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Bukhari") {
    saveTemporaryData(null, null, "bukhari", vote.voter, null, "bukhari");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 6638 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Darimi") {
    saveTemporaryData(null, null, "darimi", vote.voter, null, "darimi");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 2949 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Ibnu Majah") {
    saveTemporaryData(
      null,
      null,
      "ibnu-majjah",
      vote.voter,
      null,
      "ibnu-majjah"
    );
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 4285 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Malik") {
    saveTemporaryData(null, null, "malik", vote.voter, null, "malik");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 1587 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Muslim") {
    saveTemporaryData(null, null, "muslim", vote.voter, null, "muslim");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 4930 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Nasai") {
    saveTemporaryData(null, null, "nasai", vote.voter, null, "nasai");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 5364 Hadits)");
  } else if (vote.selectedOptions[0]?.name === "Tirmidzi") {
    saveTemporaryData(null, null, "tirmidzi", vote.voter, null, "tirmidzi");
    client.sendMessage(vote.voter, "Nomor Hadits? (Total 3625 Hadits)");
  }
});

authenticate();
