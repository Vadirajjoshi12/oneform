export const publicPoolDTO = (pool: any) => {

    const memberCount = pool.members.length;

    const poolTotal = pool.members.reduce(

        (total: number, member: any) =>

            total + member.cartTotal,

        0

    );

    const remainingAmount = Math.max(

        0,

        pool.targetThreshold - poolTotal

    );

    const timeLeftMinutes = Math.max(

        0,

        Math.ceil(

            (new Date(pool.expiresAt).getTime() -

                Date.now()) /

                60000

        )

    );

    return {
    id: pool._id,
    platform: pool.platform,
    pickupLocation: pool.pickupLocation,

    memberCount,
    poolTotal,
    remainingAmount,
    timeLeftMinutes,
    expiresAt: pool.expiresAt,

    status: pool.status,
    deliveryStatus: pool.deliveryStatus,

    members: pool.members.map((member: any) => ({
        id: member._id,
        name: member.name,
        phone: member.phone,
        isHost: member.isHost,
        cartTotal: member.cartTotal,
        items: member.items,
        joinedAt: member.joinedAt
    }))
};

};