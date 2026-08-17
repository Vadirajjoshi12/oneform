import crypto from "crypto";

export const generateHostToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashHostToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};
export const verifyHostToken = (
  token: string,
  tokenHash: string
) => {

  return (
    hashHostToken(token) === tokenHash
  );

};
import HostSession from "../models/HostSession";

export const createHostSession = async (
  poolId: string,
  expiresAt: Date
) => {

  const token =
    generateHostToken();

  const tokenHash =
    hashHostToken(token);

  await HostSession.create({

    poolId,

    tokenHash,

    expiresAt

  });

  return token;

};