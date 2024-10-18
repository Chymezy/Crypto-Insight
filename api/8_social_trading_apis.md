# Social Trading APIs

This document provides details on the Social Trading APIs, which enable users to interact with and follow other traders on the platform.

## 1. Get Leaderboard

**Endpoint:** `GET /api/v1/social/leaderboard`

**Purpose:** Retrieve a list of top-performing traders on the platform.

### Headers:
- `Authorization: Bearer JWT_TOKEN`

### Query Parameters:
- `timeframe`: string (optional, default: '7d') - Possible values: '7d', '30d', 'all'
- `page`: number (optional, default: 1) - Page number for pagination
- `limit`: number (optional, default: 20) - Number of traders per page

### Response:
json
{
"success": true,
"message": "Leaderboard retrieved successfully",
"data": {
"traders": [
{
"userId": "user_id",
"username": "trader_username",
"profilePicture": "https://example.com/profile.jpg",
"performance": 15.5,
"followers": 1000
},
// ... more traders
],
"pagination": {
"currentPage": 1,
"totalPages": 5,
"totalItems": 100
}
}
}
### Possible Errors:
- 401 Unauthorized: Invalid or expired token

## 2. Follow Trader

**Endpoint:** `POST /api/v1/social/follow/:userId`

**Purpose:** Follow a specific trader.

### Headers:
- `Authorization: Bearer JWT_TOKEN`

### URL Parameters:
- `userId`: string - The ID of the trader to follow

### Response:
json
{
"success": true,
"message": "You are now following this trader",
"data": {
"followedUserId": "trader_user_id",
"followersCount": 1001
}
}
### Possible Errors:
- 400 Bad Request: You cannot follow yourself or you are already following this trader
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: User not found

## 3. Unfollow Trader

**Endpoint:** `DELETE /api/v1/social/unfollow/:userId`

**Purpose:** Unfollow a specific trader.

### Headers:
- `Authorization: Bearer JWT_TOKEN`

### URL Parameters:
- `userId`: string - The ID of the trader to unfollow

### Response:
json
{
"success": true,
"message": "You have unfollowed this trader",
"data": {
"unfollowedUserId": "trader_user_id",
"followersCount": 1000
}
}
### Possible Errors:
- 400 Bad Request: You are not following this trader
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: Trader not found or your trader profile not found

## 4. Get Followed Traders

**Endpoint:** `GET /api/v1/social/following/:userId?`

**Purpose:** Retrieve a list of traders followed by the user.

### Headers:
- `Authorization: Bearer JWT_TOKEN`

### URL Parameters:
- `userId`: string (optional) - The ID of the user whose followed traders to retrieve. If not provided, retrieves the current user's followed traders.

### Query Parameters:
- `page`: number (optional, default: 1) - Page number for pagination
- `limit`: number (optional, default: 20) - Number of traders per page

### Response:
json
{
"success": true,
"message": "Followed traders retrieved successfully",
"data": {
"traders": [
{
"username": "trader_username",
"profilePicture": "https://example.com/profile.jpg"
},
// ... more traders
],
"pagination": {
"currentPage": 1,
"totalPages": 5,
"totalItems": 100
}
}
}

### Possible Errors:
- 401 Unauthorized: Invalid or expired token
- 404 Not Found: Trader profile not found

---

## Notes on Social Trading Features:
- All endpoints require authentication using a valid JWT token.
- The leaderboard is based on trader performance over the specified timeframe.
- Following/unfollowing actions are idempotent - attempting to follow an already followed trader or unfollow a trader you're not following will not result in an error.
- When retrieving followed traders, you can view either your own followed traders or those of another user (if their profile is public).
