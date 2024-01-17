import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createPlaylistSchema } from "../schema/playlist.schema.js";
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
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
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
