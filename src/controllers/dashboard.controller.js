import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Types } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const details = await User.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(_id.toString()),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "owner",
        localField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "video",
              as: "comments",
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
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
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
              numberOfComments: {
                $size: "$comments",
              },
              numberOfLikes: {
                $size: "$likes",
              },
            },
          },
          {
            $unset: ["comments", "likes"],
          },
          {
            $project: {
              _id: 1,
              numberOfComments: 1,
              numberOfLikes: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriptions",
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
        numberOfSubscribers: {
          $size: "$subscriptions",
        },
      },
    },
    {
      $project: {
        numberOfSubscribers: 1,
        totalNumberOfComments: {
          $sum: "$videos.numberOfComments",
        },
        totalNumberOfLikes: {
          $sum: "$videos.numberOfLikes",
        },
      },
    },
    {
      $unset: ["videos"],
    },
  ]);

  if (!details[0]) {
    throw new ApiError(404, "No data found!!", ["No data found!!"]);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      stats: details[0],
    })
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { page, limit } = req.query;

  const pageNumber = Number(page) ? Number.parseInt(page) : 1;
  const limitSize = Number(limit) ? Number.parseInt(limit) : 10;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new Types.ObjectId(_id.toString()),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
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
        numberOfLikes: {
          $size: "$likes",
        },
        numberOfComments: {
          $size: "$comments",
        },
      },
    },
    {
      $unset: ["likes", "comments"],
    },
    {
      $skip: (pageNumber - 1) * limitSize,
    },
    {
      $limit: limitSize,
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
    })
  );
});

export { getChannelStats, getChannelVideos };
