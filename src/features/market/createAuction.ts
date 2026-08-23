import { Auction, Gladiator } from "../../types/game";

export function createAuction(gladiator: Gladiator): Auction {
  const startPrice = gladiator.marketValue;

  return {
    id: `auction-${gladiator.id}`,

    gladiator,

    currentBid: startPrice,

    currentBidder: null,

    minNextBid: Math.max(25, Math.round(startPrice * 0.1)),

    isFinished: false,
  };
}
