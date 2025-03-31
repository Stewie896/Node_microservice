const { logger } = require("../utils/logger");
const { postModel } = require("../models/Post");
const { uploadToCloud } = require("../../cloudinary/cloudcontroller");
const { json } = require("stream/consumers");
const {eventEmiter , rabbitMqConsumer , rabbitMqProducer} = require('../../../amqlib_RabbitMq/rabbiit')


async function invalidateCache(req , input) {
      const keys = await req.redisClient.keys("post:*");
      if(keys.length > 0){
        await req.redisClient.del(keys)
      }
}
const createPost = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      console.log("File missing");
    }
    console.log("FILE =", file);

     let {public_id , secureUrl} =  await uploadToCloud(file);

     console.log("PUBLIC ID" , public_id);
     console.log("SECURE URL" , secureUrl)

    
    const { price, contentGenre, description } = req.body;
    const newCreatedPost = new postModel({
      contentGenre: contentGenre || [],
      description: description || [],
      userPosting: req.user.user_id || [],
      price: price || [],
      mediaUrls: public_id,
      secureUrl: secureUrl 
    });

    await newCreatedPost.save();
    await invalidateCache(req ,  newCreatedPost._id.toString() )

    res.status(201).json({
      message: "Post created succesfully",
      postData: {
        post: newCreatedPost,
        userPosting: newCreatedPost.userPosting,
        hello: "THis is the yalo",
      },
    });

    next();
    // res.send("Hello");
  } catch (error) {
    console.log(error);
    res.json({
      message: "Something went wrong createpost",
    });
  }
};

const getAllPost = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const pageStartIndex = (page - 1) * limit;

    const cacheKeyredis = `post:  ${page} && ${limit}`;
    const redisCachedPost = await req.redisClient.get(cacheKeyredis);

    if (redisCachedPost) {
      return res.status(201).json({
        success: true,
        data: JSON.parse(redisCachedPost),
      });
    }

    const post = await postModel
      .find({})
      .sort({ createPost: -1 })
      .skip(pageStartIndex)
      .limit(limit);
    const total_result = await postModel.countDocuments();

    const result = {
      post: post,
      currentPage: page,
      totalPages: Math.ceil(total_result / limit),
      totalPost: total_result,
    };

    await req.redisClient.setex(cacheKeyredis, 300, JSON.stringify(result));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error in fetching post ${error}`);
    return res.status(404).json({
      success: false,
      message: "Error while fetching post!",
    });
  }
};

const deletPost = async (req, res, next) => {
  try {
    const findPerson = await postModel.findByIdAndDelete({
      _id: req.params.id,
      userPosting: req.user.user_id 
    })

    if(!findPerson){
      res.status(203).json({
        message: "Post already delet || post does not exist"
      })
    }

    await rabbitMqProducer( 'delet.post' , {
      _id: findPerson._id,
      media_id: findPerson.mediaUrls
    })

    res.send("Post deleted form db")
    
  } catch (error) {
    logger.error(`Error in deleting post ${error}`);
    console.log(error)
    return res.status(404).json({
      success: false,
      message: "Error while deleting post!",
    });
  }
};

module.exports = { deletPost, getAllPost, createPost };
