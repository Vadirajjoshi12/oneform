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

        status: pool.status,

        deliveryStatus: pool.deliveryStatus

    };

};