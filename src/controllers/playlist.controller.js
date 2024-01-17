import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createPlaylistSchema } from "../schema/playlist.schema.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ! We are assuming that any playlist is publicly available for everyone.

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
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
  //TODO: get user playlists
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
