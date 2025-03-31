const cloudinary = require("cloudinary").v2;
const {eventEmiter , rabbitMqConsumer} = require('../../amqlib_RabbitMq/rabbiit');
const { logger } = require("../src/utils/logger");

const uploadToCloud = async (file, err) => {
  try {
    if (err) {
      console.log("Err in upload cloud ", err);
    }
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
    });
    console.log("File uploaded to cloud", file);
    const public_id = result.public_id;
    const secureUrl = result.secure_url;

    return {
      public_id,
      secureUrl,
    };
  } catch (error) {
    console.log("File erro at cloud", error);
  }
};

const deletFromCloud = async(req , res , next)=>{
  await rabbitMqConsumer();
  eventEmiter.on("post_data", async (data) => {
    try {
      const { _id, media_id } = data;
  
      // Delete the media from Cloudinary
      await cloudinary.uploader.destroy(media_id, {});
      logger.info(`Deleted media ${media_id}`);
      console.log("data")
      
    } catch (error) {
      logger.error("Error deleting post:", error);
    }
  });
}

deletFromCloud()

module.exports = { uploadToCloud };

