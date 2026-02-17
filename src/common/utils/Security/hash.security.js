import {hash, compare} from "bcrypt";

export const Hash = async ({plainText, salt_rounds = 12} = {}) => {
  return await hash(plainText, salt_rounds);
};

export const compare_match = async ({plainText, cipherText} = {}) => {
  return await compare(plainText, cipherText);
};
