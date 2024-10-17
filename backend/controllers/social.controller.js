import asyncHandler from 'express-async-handler';
import { User } from '../models/user.model.js';
import { TraderProfile } from '../models/traderProfile.model.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

// Get leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
    const { timeframe = '7d', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const leaderboard = await TraderProfile.aggregate([
        {
            $match: {
                'performance.lastUpdated': { $gte: startDate }
            }
        },
        {
            $sort: { [`performance.${timeframe}`]: -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $unwind: '$userDetails'
        },
        {
            $project: {
                userId: '$userDetails._id',
                username: '$userDetails.username',
                profilePicture: '$userDetails.profilePicture',
                performance: `$performance.${timeframe}`,
                followers: { $size: '$followers' }
            }
        }
    ]);

    const totalTraders = await TraderProfile.countDocuments();

    sendSuccessResponse(res, 200, 'Leaderboard retrieved successfully', {
        traders: leaderboard,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTraders / limit),
            totalItems: totalTraders
        }
    });
});

// Follow trader
export const followTrader = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
        return sendErrorResponse(res, 400, 'You cannot follow yourself');
    }

    // Find or create trader profile for the user to be followed
    let traderToFollow = await TraderProfile.findOne({ user: userId });
    if (!traderToFollow) {
        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        traderToFollow = new TraderProfile({
            user: userId,
            followers: [],
            following: [],
            performance: {
                allTime: 0,
                lastMonth: 0,
                lastWeek: 0
            }
        });
        await traderToFollow.save();
    }

    // Find or create trader profile for the current user
    let currentUserProfile = await TraderProfile.findOne({ user: currentUserId });
    if (!currentUserProfile) {
        currentUserProfile = new TraderProfile({
            user: currentUserId,
            followers: [],
            following: [],
            performance: {
                allTime: 0,
                lastMonth: 0,
                lastWeek: 0
            }
        });
    }

    if (traderToFollow.followers.includes(currentUserId)) {
        return sendErrorResponse(res, 400, 'You are already following this trader');
    }

    traderToFollow.followers.push(currentUserId);
    currentUserProfile.following.push(userId);

    await Promise.all([traderToFollow.save(), currentUserProfile.save()]);

    sendSuccessResponse(res, 200, 'You are now following this trader', {
        followedUserId: userId,
        followersCount: traderToFollow.followers.length
    });
});

// Unfollow trader
export const unfollowTrader = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const traderToUnfollow = await TraderProfile.findOne({ user: userId });
    if (!traderToUnfollow) {
        return sendErrorResponse(res, 404, 'Trader not found');
    }

    const currentUserProfile = await TraderProfile.findOne({ user: currentUserId });
    if (!currentUserProfile) {
        return sendErrorResponse(res, 404, 'Your trader profile not found');
    }

    if (!traderToUnfollow.followers.includes(currentUserId)) {
        return sendErrorResponse(res, 400, 'You are not following this trader');
    }

    traderToUnfollow.followers = traderToUnfollow.followers.filter(id => !id.equals(currentUserId));
    currentUserProfile.following = currentUserProfile.following.filter(id => !id.equals(userId));

    await Promise.all([traderToUnfollow.save(), currentUserProfile.save()]);

    sendSuccessResponse(res, 200, 'You have unfollowed this trader', {
        unfollowedUserId: userId,
        followersCount: traderToUnfollow.followers.length
    });
});

// Get followed traders
export const getFollowedTraders = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let userToCheck = userId ? userId.trim() : req.user._id.toString();

    console.log('User ID to check:', userToCheck); // Add this log

    const traderProfile = await TraderProfile.findOne({ user: userToCheck })
        .populate({
            path: 'following',
            options: {
                skip: skip,
                limit: parseInt(limit)
            }
        });

    if (!traderProfile) {
        console.log('Trader profile not found for user:', userToCheck); // Add this log
        return sendErrorResponse(res, 404, 'Trader profile not found');
    }

    const followedTraders = await User.find({
        _id: { $in: traderProfile.following }
    }).select('username profilePicture');

    const totalFollowing = traderProfile.following.length;

    sendSuccessResponse(res, 200, 'Followed traders retrieved successfully', {
        traders: followedTraders,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalFollowing / limit),
            totalItems: totalFollowing
        }
    });
});