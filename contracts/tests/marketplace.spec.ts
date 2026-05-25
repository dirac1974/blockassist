// CONTRACT-003 marketplace program tests.

import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import {
  createMint, createAssociatedTokenAccount, mintTo,
  ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { assert, expect } from 'chai';
import { randomBytes } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarketplaceProgram = Program<any>;

describe('marketplace', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = anchor.workspace.marketplace as MarketplaceProgram;

  const lister = Keypair.generate();
  const taker = Keypair.generate();
  const cranker = Keypair.generate();
  let usdcMint: PublicKey;
  let listerUsdc: PublicKey;

  before(async () => {
    for (const kp of [lister, taker, cranker]) {
      const tx = await provider.connection.requestAirdrop(kp.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(tx, 'confirmed');
    }
    usdcMint = await createMint(provider.connection, lister, lister.publicKey, null, 6);
    listerUsdc = await createAssociatedTokenAccount(provider.connection, lister, usdcMint, lister.publicKey);
    await mintTo(provider.connection, lister, usdcMint, listerUsdc, lister, 1_000_000n);
  });

  it('creates a listing, accepts it, and refunds the listing fee', async () => {
    const listingId = randomBytes(32);
    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), listingId, lister.publicKey.toBuffer()],
      program.programId,
    );
    const feeVault = getAssociatedTokenAddressSync(usdcMint, listingPda, true);

    const before = await provider.connection.getTokenAccountBalance(listerUsdc);

    await program.methods
      .createListing(
        [...listingId],
        'Grocery run, 1 hour',
        [...randomBytes(32)],
        new BN(1_500_000),
        new BN(7 * 24 * 60 * 60),
      )
      .accounts({
        lister: lister.publicKey,
        listing: listingPda,
        usdcMint,
        listerUsdc,
        feeVaultUsdc: feeVault,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([lister])
      .rpc();

    const midway = await provider.connection.getTokenAccountBalance(listerUsdc);
    expect(Number(before.value.amount) - Number(midway.value.amount)).to.equal(50_000);

    await program.methods.acceptListing()
      .accounts({
        taker: taker.publicKey,
        listing: listingPda,
        feeVaultUsdc: feeVault,
        listerUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([taker])
      .rpc();

    const after = await provider.connection.getTokenAccountBalance(listerUsdc);
    expect(Number(after.value.amount)).to.equal(Number(before.value.amount));

    const listing = await program.account.listing.fetch(listingPda);
    expect((listing.state as { accepted?: object }).accepted).to.not.be.undefined;
    expect((listing.taker as PublicKey).equals(taker.publicKey)).to.equal(true);
  });

  it('rejects a second accept on the same listing', async () => {
    const listingId = randomBytes(32);
    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), listingId, lister.publicKey.toBuffer()],
      program.programId,
    );
    const feeVault = getAssociatedTokenAddressSync(usdcMint, listingPda, true);

    await program.methods
      .createListing([...listingId], 'Test', [...randomBytes(32)], new BN(1_000_000), new BN(3600))
      .accounts({
        lister: lister.publicKey, listing: listingPda, usdcMint, listerUsdc,
        feeVaultUsdc: feeVault, systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID, associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([lister]).rpc();
    await program.methods.acceptListing()
      .accounts({ taker: taker.publicKey, listing: listingPda, feeVaultUsdc: feeVault, listerUsdc, tokenProgram: TOKEN_PROGRAM_ID })
      .signers([taker]).rpc();

    await expectError(
      program.methods.acceptListing()
        .accounts({ taker: cranker.publicKey, listing: listingPda, feeVaultUsdc: feeVault, listerUsdc, tokenProgram: TOKEN_PROGRAM_ID })
        .signers([cranker]).rpc(),
      'InvalidStateTransition',
    );
  });

  it('cancel_listing refunds the fee', async () => {
    const listingId = randomBytes(32);
    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), listingId, lister.publicKey.toBuffer()],
      program.programId,
    );
    const feeVault = getAssociatedTokenAddressSync(usdcMint, listingPda, true);

    const before = await provider.connection.getTokenAccountBalance(listerUsdc);
    await program.methods
      .createListing([...listingId], 'Cancellable', [...randomBytes(32)], new BN(2_000_000), new BN(3600))
      .accounts({
        lister: lister.publicKey, listing: listingPda, usdcMint, listerUsdc,
        feeVaultUsdc: feeVault, systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID, associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([lister]).rpc();

    await program.methods.cancelListing()
      .accounts({
        lister: lister.publicKey, listing: listingPda, feeVaultUsdc: feeVault, listerUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([lister]).rpc();

    const after = await provider.connection.getTokenAccountBalance(listerUsdc);
    expect(Number(after.value.amount)).to.equal(Number(before.value.amount));
  });

  it('expire_listing requires that expires_at has elapsed', async () => {
    const listingId = randomBytes(32);
    const [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), listingId, lister.publicKey.toBuffer()],
      program.programId,
    );
    const feeVault = getAssociatedTokenAddressSync(usdcMint, listingPda, true);

    await program.methods
      .createListing([...listingId], 'Will-expire', [...randomBytes(32)], new BN(500_000), new BN(3600))
      .accounts({
        lister: lister.publicKey, listing: listingPda, usdcMint, listerUsdc,
        feeVaultUsdc: feeVault, systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID, associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([lister]).rpc();

    await expectError(
      program.methods.expireListing()
        .accounts({ cranker: cranker.publicKey, listing: listingPda })
        .signers([cranker]).rpc(),
      'NotYetExpired',
    );
  });
});

async function expectError(promise: Promise<unknown>, codeFragment: string): Promise<void> {
  try {
    await promise;
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    if (msg.includes(codeFragment)) return;
    throw new Error(`Expected error containing "${codeFragment}", got: ${msg}`);
  }
  throw new Error(`Expected error containing "${codeFragment}", but call succeeded`);
}
