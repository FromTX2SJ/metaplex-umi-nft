import {
  createNft,
  fetchDigitalAsset,
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
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

// Create a new collection NFT
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user......");

const collectionAddress = publicKey(
  "6WxNeqxceQqfxumKK86VP4RVopA17EHHnvyzZ3VtoQiY"
);
const nftAddress = publicKey("6qdgkCvZh2fD25612CLuhUt7FwLDBquQKYLr86xgSvj7");

const transcation = await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: nftAddress }),
  collectionMint: collectionAddress,
  authority: umi.identity,
});

await transcation.sendAndConfirm(umi);

console.log(
  `✅ NFT ${nftAddress} verified as member of the collection ${collectionAddress} successfully! See Explorer at ${getExplorerLink(
    "address",
    nftAddress,
    "devnet"
  )}`
);
