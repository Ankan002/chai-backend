import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Types } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
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
