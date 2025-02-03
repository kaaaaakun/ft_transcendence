import { FriendsTable } from "@/js/features/friends/FriendsTable";
import { BaseLayout } from "@/js/layouts/BaseLayout";
import { Teact } from "@/js/libs/teact";

// モックデータ
const mockFriends = [
  { id: 1, friend_name: "foo", is_online: true },
  { id: 2, friend_name: "bar", is_online: true },
  { id: 3, friend_name: "baz", is_online: true },
];

export const FriendsList = () => {
  return BaseLayout(
    Teact.createElement(
      "div",
      { className: "container bg-white p-4 rounded shadow" },
      Teact.createElement(FriendsTable, {
        friends: mockFriends,
        onAccept: () => {},
        onReject: () => {},
      }),
    ),
  );
};
