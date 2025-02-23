import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  LAMPORTS_PER_SOL * 2,
  LAMPORTS_PER_SOL * 0.5
);

console.log(`User PublicKey: ${user.publicKey.toBase58()}`);

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user......");

const collectionAddress = publicKey(
  "6WxNeqxceQqfxumKK86VP4RVopA17EHHnvyzZ3VtoQiY"
);

console.log(`creatig NFT......`);

const nftMint = generateSigner(umi);

const transcation = await createNft(umi, {
  mint: nftMint,
  name: "My NFT",
  symbol: "TNT",
  uri: "https://raw.githubusercontent.com/FromTX2SJ/Lenora-Protocol/refs/heads/main/metadata.json",
  sellerFeeBasisPoints: percentAmount(0.05), // 5%
  collection: { key: collectionAddress, verified: false }, // Assign to the  created collection
});

await transcation.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, nftMint.publicKey);

console.log(
  "💎 Created NFT:",
  getExplorerLink("address", createdNft.mint.publicKey, "devnet")
);
