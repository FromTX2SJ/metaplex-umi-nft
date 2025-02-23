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

const collectionMint = generateSigner(umi);

const transcation = await createNft(umi, {
  mint: collectionMint,
  name: "Test Collection",
  symbol: "TCOL",
  uri: "https://raw.githubusercontent.com/FromTX2SJ/Lenora-Protocol/refs/heads/main/metadata.json",
  sellerFeeBasisPoints: percentAmount(0.05), // 5%
  isCollection: true, // Mark as a collection NFT
});

await transcation.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);
console.log(
  "Created Collection 📦:",
  getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")
);
