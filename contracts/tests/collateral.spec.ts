// CONTRACT-003 collateral program tests.
//
// The critical behavior under test: slash is halted and ALWAYS returns
// SlashHalted regardless of caller. This guards against accidentally
// enabling the halted instruction in a future refactor — the test will
// red-line if slashing logic lights up before the spec is finalized.

import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import {
  createMint, createAssociatedTokenAccount, mintTo,
  ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { expect } from 'chai';
import { randomBytes } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CollateralProgram = Program<any>;

describe('collateral', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = anchor.workspace.collateral as CollateralProgram;

  const assistant = Keypair.generate();
  const stranger = Keypair.generate();
  let usdcMint: PublicKey;
  let assistantUsdc: PublicKey;

  before(async () => {
    for (const kp of [assistant, stranger]) {
      const tx = await provider.connection.requestAirdrop(kp.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(tx, 'confirmed');
    }
    usdcMint = await createMint(provider.connection, assistant, assistant.publicKey, null, 6);
    assistantUsdc = await createAssociatedTokenAccount(provider.connection, assistant, usdcMint, assistant.publicKey);
    await mintTo(provider.connection, assistant, usdcMint, assistantUsdc, assistant, 50_000_000n);
  });

  it('init, deposit, partial withdraw', async () => {
    const [collateralPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('collateral'), assistant.publicKey.toBuffer()],
      program.programId,
    );
    const vaultUsdc = getAssociatedTokenAddressSync(usdcMint, collateralPda, true);

    await program.methods.initCollateral()
      .accounts({
        assistant: assistant.publicKey,
        collateral: collateralPda,
        usdcMint,
        vaultUsdc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([assistant])
      .rpc();

    await program.methods.deposit(new BN(20_000_000))
      .accounts({
        assistant: assistant.publicKey,
        collateral: collateralPda,
        assistantUsdc,
        vaultUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([assistant])
      .rpc();

    let v = await provider.connection.getTokenAccountBalance(vaultUsdc);
    expect(Number(v.value.amount)).to.equal(20_000_000);

    await program.methods.withdraw(new BN(5_000_000))
      .accounts({
        assistant: assistant.publicKey,
        collateral: collateralPda,
        vaultUsdc,
        assistantUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([assistant])
      .rpc();

    v = await provider.connection.getTokenAccountBalance(vaultUsdc);
    expect(Number(v.value.amount)).to.equal(15_000_000);
  });

  it('rejects withdraw by non-owner', async () => {
    const [collateralPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('collateral'), assistant.publicKey.toBuffer()],
      program.programId,
    );
    const vaultUsdc = getAssociatedTokenAddressSync(usdcMint, collateralPda, true);

    const strangerUsdc = await createAssociatedTokenAccount(provider.connection, stranger, usdcMint, stranger.publicKey);

    await expectError(
      program.methods.withdraw(new BN(1_000_000))
        .accounts({
          assistant: stranger.publicKey,
          collateral: collateralPda,
          vaultUsdc,
          assistantUsdc: strangerUsdc,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([stranger])
        .rpc(),
      'Unauthorized',
    );
  });

  it('slash is halted and always returns SlashHalted', async () => {
    const [collateralPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('collateral'), assistant.publicKey.toBuffer()],
      program.programId,
    );

    await expectError(
      program.methods.slash(new BN(1_000_000), [...randomBytes(32)])
        .accounts({ caller: assistant.publicKey, collateral: collateralPda })
        .signers([assistant])
        .rpc(),
      'SlashHalted',
    );

    // Different caller — same result.
    await expectError(
      program.methods.slash(new BN(1_000_000), [...randomBytes(32)])
        .accounts({ caller: stranger.publicKey, collateral: collateralPda })
        .signers([stranger])
        .rpc(),
      'SlashHalted',
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
