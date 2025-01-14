import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId, Types } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { _id } = req.user;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Provide a valid ObjectID as videoId", [
      "Provide a valid ObjectID as videoId",
    ]);
  }

  const deletedLike = await Like.findOneAndDelete({
    video: videoId,
    likedBy: _id,
  });

  let createdLike;

  if (!deletedLike) {
    createdLike = await Like.create({
      video: videoId,
      likedBy: _id,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, {
      liked: !!(!deletedLike && createdLike),
      createdLike,
    })
  );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const { _id } = req.user;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Provide a valid ObjectID as commentId", [
      "Provide a valid ObjectID as commentId",
    ]);
  }

  const deletedLike = await Like.findOneAndDelete({
    comment: commentId,
    likedBy: _id,
  });

  let createdLike;

  if (!deletedLike) {
    createdLike = await Like.create({
      comment: commentId,
      likedBy: _id,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, {
      liked: !!(!deletedLike && createdLike),
      createdLike,
    })
  );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const { _id } = req.user;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Provide a valid ObjectID as tweetId", [
      "Provide a valid ObjectID as tweetId",
    ]);
  }

  const deletedLike = await Like.findOneAndDelete({
    tweet: tweetId,
    likedBy: _id,
  });

  let createdLike;

  if (!deletedLike) {
    createdLike = await Like.create({
      tweet: tweetId,
      likedBy: _id,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, {
      liked: !!(!deletedLike && createdLike),
      createdLike,
    })
  );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const { page, limit } = req.query;

  const pageNumber = Number(page) ? Number.parseInt(page) : 1;
  const sizeLimit = Number(limit) ? Number.parseInt(limit) : 10;

  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: new Types.ObjectId(_id.toString()),
        video: {
          $ne: null,
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "owner",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "likes",
              foreignField: "video",
              localField: "_id",
              as: "liked_by",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
              likes: {
                $size: "$liked_by",
              },
            },
          },
          {
            $unset: ["liked_by"],
          },
          {
            $project: {
              _id: 1,
              videoFile: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$videoFile",
                  else: "$$REMOVE",
                },
              },
              thumbnail: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$thumbnail",
                  else: "$$REMOVE",
                },
              },
              title: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$title",
                  else: "$$REMOVE",
                },
              },
              description: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$description",
                  else: "$$REMOVE",
                },
              },
              duration: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$duration",
                  else: "$$REMOVE",
                },
              },
              views: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$views",
                  else: "$$REMOVE",
                },
              },
              isPublished: 1,
              owner: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$owner",
                  else: "$$REMOVE",
                },
              },
              likes: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner._id", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$likes",
                  else: "$$REMOVE",
                },
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
    {
      $skip: (pageNumber - 1) * sizeLimit,
    },
    {
      $limit: sizeLimit,
    },
    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
    })
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
