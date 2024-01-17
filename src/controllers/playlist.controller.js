import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createPlaylistSchema,
  updatePlaylistSchema,
} from "../schema/playlist.schema.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId, Types } from "mongoose";

// ! We are assuming that any playlist is publicly available for everyone.

const createPlaylist = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const requestBodyValidationResult = createPlaylistSchema.safeParse(req.body);

  if (!requestBodyValidationResult.success) {
    throw new ApiError(
      400,
      requestBodyValidationResult.error.errors[0]?.message ??
        "Something went wrong",
      requestBodyValidationResult.error.errors.map((e) => e.message)
    );
  }

  const { name, description } = requestBodyValidationResult.data;

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: _id,
  });

  return res.status(200).json(
    new ApiResponse(200, {
      playlist,
    })
  );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { page, limit } = req.query;

  const pageNumber = Number(page) ? Number.parseInt(page) : 1;
  const limitSize = Number(limit) ? Number.parseInt(limit) : 10;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Please provide a valid ObjectID as user id", [
      "Please provide a valid ObjectID as user id",
    ]);
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
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
        numberOfVideos: {
          $size: "$videos",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        owner: 1,
        numberOfVideos: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
      },
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
      playlists,
    })
  );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { _id } = req.user;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Provide valid ObjectID", [
      "Provide valid ObjectID",
    ]);
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
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
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "foundVideos",
        pipeline: [
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
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    avatar: 1,
                    username: 1,
                    fullName: 1,
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
            },
          },
          {
            $project: {
              _id: 1,
              thumbnail: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner", new Types.ObjectId(_id.toString())],
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
                        $eq: ["$owner", new Types.ObjectId(_id.toString())],
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
                        $eq: ["$owner", new Types.ObjectId(_id.toString())],
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
                        $eq: ["$owner", new Types.ObjectId(_id.toString())],
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
                        $eq: ["$owner", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$views",
                  else: "$$REMOVE",
                },
              },
              owner: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: "$owner",
                  else: "$$REMOVE",
                },
              },
              numberOfLikes: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: ["$isPublished", true],
                      },
                      {
                        $eq: ["$owner", new Types.ObjectId(_id.toString())],
                      },
                    ],
                  },
                  then: {
                    $size: "$likes",
                  },
                  else: "$$REMOVE",
                },
              },
              isPublished: 1,
            },
          },
          {
            $unset: ["likes"],
          },
        ],
      },
    },
    {
      $set: {
        deletedVideos: {
          $filter: {
            input: "$videos",
            as: "vid",
            cond: {
              $not: {
                $in: ["$$vid", "$foundVideos._id"],
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        videos: "$foundVideos",
      },
    },
    {
      $unset: ["foundVideos"],
    },
  ]);

  if (!playlist[0]) {
    throw new ApiError(404, "No playlist found!!", ["No playlist found!!"]);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      playlist: playlist[0],
    })
  );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const { _id } = req.user;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Provide valid ObjectID", [
      "Provide valid ObjectID",
    ]);
  }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: _id,
    },
    [
      {
        $set: {
          videos: {
            $concatArrays: ["$videos", [new Types.ObjectId(videoId)]],
          },
        },
      },
    ],
    {
      new: true,
    }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      added: true,
      updatedPlaylist,
    })
  );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const { _id } = req.user;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Provide valid ObjectID", [
      "Provide valid ObjectID",
    ]);
  }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: _id,
    },
    [
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          videos: {
            $filter: {
              input: "$videos",
              as: "v",
              cond: {
                $ne: ["$$v", new Types.ObjectId(videoId)],
              },
            },
          },
          owner: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
        },
      },
      {
        $set: {
          videos: "$videos",
        },
      },
    ],
    {
      new: true,
    }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      removed: true,
      updatedPlaylist,
    })
  );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { _id } = req.user;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Provide valid ObjectID", [
      "Provide valid ObjectID",
    ]);
  }

  const deletedPlaylist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: _id,
  });

  if (!deletedPlaylist) {
    throw new ApiError(
      404,
      "Either the playlist does not exist or you do not have permission to perform this action",
      [
        "Either the playlist does not exist or you do not have permission to perform this action",
      ]
    );
  }

  return res.status(200).json(
    new ApiResponse(200, {
      deletedPlaylist,
    })
  );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { _id } = req.user;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Provide valid ObjectID", [
      "Provide valid ObjectID",
    ]);
  }

  const requestBodyValidationResult = updatePlaylistSchema.safeParse(req.body);

  if (!requestBodyValidationResult.success) {
    throw new ApiError(
      400,
      requestBodyValidationResult.error.errors[0]?.message ??
        "Something went wrong",
      requestBodyValidationResult.error.errors.map((e) => e.message)
    );
  }

  const { name, description } = requestBodyValidationResult.data;

  if (!name && !description) {
    throw new ApiError(400, "Nothing to update", ["Nothing to update"]);
  }

  const updateObject = {};

  updateObject["name"] = name?.trim();
  updateObject["description"] = description?.trim();

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: _id,
    },
    {
      $set: updateObject,
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      404,
      "Either the playlist does not exist or you do not have permission to perform this action",
      [
        "Either the playlist does not exist or you do not have permission to perform this action",
      ]
    );
  }

  return res.status(200).json(
    new ApiResponse(200, {
      updatedPlaylist,
    })
  );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
