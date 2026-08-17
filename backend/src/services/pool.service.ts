import crypto from "crypto";

export const buildPool = (body: any) => {
  const expiresAt = new Date(
    Date.now() + body.durationMinutes * 60 * 1000
  );

  const hostToken = crypto.randomUUID();

  const hostMember = {
    isHost: true,
    name: body.host.name,
    phone: body.host.phone,
    cartTotal: body.item.price * body.item.quantity,
    items: [
      {
        itemName: body.item.name,
        quantity: body.item.quantity,
        price: body.item.price,
      },
    ],
    joinedAt: new Date(),
  };

  return {
    communityId: body.communityId,
    platform: body.platform,
    pickupLocation: body.pickupLocation,

    location: {
      type: "Point",
      coordinates: [
        body.location.lng,
        body.location.lat,
      ],
    },

    radiusKm: body.radiusKm,

    targetThreshold: body.targetThreshold,

    expiresAt,

    status: "active",

    deliveryStatus: "Cart Open",

    note: body.note,

    members: [hostMember],

    messages: [],

    hostToken,
  };
};