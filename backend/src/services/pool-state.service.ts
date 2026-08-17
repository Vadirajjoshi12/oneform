import Pool from "../models/Pool";

export const syncPoolState = async (pool: any) => {
  const poolTotal = pool.members.reduce(
    (total: number, member: any) => {
      return total + member.cartTotal;
    },
    0
  );

  if (
    pool.status === "active" &&
    poolTotal >= pool.targetThreshold
  ) {
    pool.status = "threshold_met";
    pool.deliveryStatus = "Target Reached";

    await pool.save();
  }

  return pool;
};