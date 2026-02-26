export const SOCKET_EVENTS = {
  HEARTBEAT: "heartbeat",
  BID_PLACED: "bidPlaced",
  AUCTION_EXTENDED: "auctionExtended",
  AUCTION_ENDED: "auctionEnded",
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
