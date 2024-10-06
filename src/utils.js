require('dotenv').config();

const fetchMessageFromFlip = async () => {
	try {
    const response = await fetch("https://api.imgflip.com/get_memes");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonData = await response.json()
    	.then((data) => {
    		return data.data.memes;
    	});

    const randomNumber = Math.floor(Math.random() * jsonData.length);
    const message = jsonData[randomNumber];
    return message;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

const fetchJsonData = async (id, text1, text2) => {
	try {
		const response = await fetch(`https://api.imgflip.com/caption_image?template_id=${id}&username=${process.env.MEME_USERNAME}&password=${process.env.MEME_PASSWORD}&text0=${text1}&text1=${text2}&font=helvetica`);

		if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const url = await response.json()
    	.then((data) => {
    		return data.data.url;
    	});
    return url;
	}
	catch(error) {
		console.error('Error fetching data:', error.message);
    throw error;
	}
}

module.exports = {
	fetchMessageFromFlip,
	fetchJsonData
}