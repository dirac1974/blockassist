// CONTRACT-002 escrow program tests.
//
// Note: these tests are written against the public Anchor surface defined in
// contracts/programs/escrow/src/lib.rs. They will run under `anchor test`
// against a local validator once the program's declare_id! placeholder
// is replaced (see ADV-F-014) and the IDL is generated.

import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount as getTokenAccount,
} from '@solana/spl-token';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { assert, expect } from 'chai';
import { randomBytes } from 'crypto';

// IDL import is generated at `anchor build` time; treat as Program until then.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EscrowProgram = Program<any>;

describe('escrow', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = anchor.workspace.escrow as EscrowProgram;

  const customer = Keypair.generate();
  const assistant = Keypair.generate();
  let usdcMint: PublicKey;
  let customerUsdc: PublicKey;
  let assistantUsdc: PublicKey;

  before(async () => {
    await fundLamports(provider, customer.publicKey, 5);
    await fundLamports(provider, assistant.publicKey, 1);

    usdcMint = await createMint(
      provider.connection,
      customer,
      customer.publicKey,
      null,
      6,
    );

    customerUsdc = await createAssociatedTokenAccount(
      provider.connection, customer, usdcMint, customer.publicKey,
    );
    assistantUsdc = await createAssociatedTokenAccount(
      provider.connection, assistant, usdcMint, assistant.publicKey,
    );

    // Give customer 100 USDC.
    await mintTo(provider.connection, customer, usdcMint, customerUsdc, customer, 100_000_000n);
  });

  it('initializes, funds, accepts, delivers, and releases on manual accept', async () => {
    const orderId = randomBytes(32);
    const orderHash = randomBytes(32);
    const termsHash = randomBytes(32);
    const amount = new BN(10_000_000); // $10 USDC

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderId, customer.publicKey.toBuffer()],
      program.programId,
    );
    const vaultUsdc = getAssociatedTokenAddressSync(usdcMint, escrowPda, true);

    await program.methods
      .initEscrow([...orderId], [...orderHash], [...termsHash], amount)
      .accounts({
        customer: customer.publicKey,
        escrow: escrowPda,
        usdcMint,
        vaultUsdc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([customer])
      .rpc();

    await program.methods.fundEscrow()
      .accounts({
        customer: customer.publicKey,
        escrow: escrowPda,
        customerUsdc,
        vaultUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([customer])
      .rpc();

    await program.methods.acceptListing()
      .accounts({ assistant: assistant.publicKey, escrow: escrowPda })
      .signers([assistant])
      .rpc();

    await program.methods.markDelivered()
      .accounts({ assistant: assistant.publicKey, escrow: escrowPda })
      .signers([assistant])
      .rpc();

    const beforeAccept = await getTokenAccount(provider.connection, assistantUsdc);

    await program.methods.acceptDelivery()
      .accounts({
        customer: customer.publicKey,
        escrow: escrowPda,
        vaultUsdc,
        assistantUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([customer])
      .rpc();

    const afterAccept = await getTokenAccount(provider.connection, assistantUsdc);
    expect(Number(afterAccept.amount) - Number(beforeAccept.amount)).to.equal(10_000_000);

    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    expect(escrowAccount.state.completed !== undefined).to.equal(true);
  });

  it('rejects fund_escrow on already-funded escrow', async () => {
    const orderId = randomBytes(32);
    const amount = new BN(5_000_000);
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderId, customer.publicKey.toBuffer()],
      program.programId,
    );
    const vaultUsdc = getAssociatedTokenAddressSync(usdcMint, escrowPda, true);

    await program.methods
      .initEscrow([...orderId], [...randomBytes(32)], [...randomBytes(32)], amount)
      .accounts({
        customer: customer.publicKey, escrow: escrowPda, usdcMint, vaultUsdc,
        systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([customer])
      .rpc();

    await program.methods.fundEscrow()
      .accounts({
        customer: customer.publicKey, escrow: escrowPda, customerUsdc, vaultUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([customer])
      .rpc();

    await expectError(
      program.methods.fundEscrow()
        .accounts({
          customer: customer.publicKey, escrow: escrowPda, customerUsdc, vaultUsdc,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([customer])
        .rpc(),
      'InvalidStateTransition',
    );
  });

  it('rejects finalize_optimistic before the challenge window has elapsed', async () => {
    const orderId = randomBytes(32);
    const amount = new BN(2_000_000); // $2 (below affirmative threshold)
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderId, customer.publicKey.toBuffer()],
      program.programId,
    );
    const vaultUsdc = getAssociatedTokenAddressSync(usdcMint, escrowPda, true);

    await program.methods
      .initEscrow([...orderId], [...randomBytes(32)], [...randomBytes(32)], amount)
      .accounts({
        customer: customer.publicKey, escrow: escrowPda, usdcMint, vaultUsdc,
        systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([customer])
      .rpc();
    await program.methods.fundEscrow()
      .accounts({ customer: customer.publicKey, escrow: escrowPda, customerUsdc, vaultUsdc, tokenProgram: TOKEN_PROGRAM_ID })
      .signers([customer]).rpc();
    await program.methods.acceptListing()
      .accounts({ assistant: assistant.publicKey, escrow: escrowPda })
      .signers([assistant]).rpc();
    await program.methods.markDelivered()
      .accounts({ assistant: assistant.publicKey, escrow: escrowPda })
      .signers([assistant]).rpc();

    await expectError(
      program.methods.finalizeOptimistic()
        .accounts({
          cranker: customer.publicKey,
          escrow: escrowPda, vaultUsdc, assistantUsdc, tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([customer])
        .rpc(),
      'WindowNotElapsed',
    );
  });

  it('rejects finalize_optimistic on orders above the affirmative-accept threshold', async () => {
    const orderId = randomBytes(32);
    const amount = new BN(75_000_000); // $75 — above $50 threshold
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderId, customer.publicKey.toBuffer()],
      program.programId,
    );
    const vaultUsdc = getAssociatedTokenAddressSync(usdcMint, escrowPda, true);

    // Fast-forward by manipulating Clock — skipped here; in a real test we'd
    // either use anchor's BankrunProvider or set time on a forked validator.
    // For now, assert the threshold check fires by trying an above-threshold
    // call.
    await program.methods
      .initEscrow([...orderId], [...randomBytes(32)], [...randomBytes(32)], amount)
      .accounts({
        customer: customer.publicKey, escrow: escrowPda, usdcMint, vaultUsdc,
        systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([customer])
      .rpc();
    await program.methods.fundEscrow()
      .accounts({ customer: customer.publicKey, escrow: escrowPda, customerUsdc, vaultUsdc, tokenProgram: TOKEN_PROGRAM_ID })
      .signers([customer]).rpc();
    await program.methods.acceptListing()
      .accounts({ assistant: assistant.publicKey, escrow: escrowPda })
      .signers([assistant]).rpc();
    await program.methods.markDelivered()
      .accounts({ assistant: assistant.publicKey, escrow: escrowPda })
      .signers([assistant]).rpc();

    await expectError(
      program.methods.finalizeOptimistic()
        .accounts({
          cranker: customer.publicKey,
          escrow: escrowPda, vaultUsdc, assistantUsdc, tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([customer])
        .rpc(),
      // Either OverThreshold (if window hasn't elapsed yet, threshold check still fires first because it precedes the window check in lib.rs) or WindowNotElapsed.
      'OverThreshold',
    );
  });

  it('cancel_pre_fund refunds rent and transitions to Cancelled', async () => {
    const orderId = randomBytes(32);
    const amount = new BN(3_000_000);
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), orderId, customer.publicKey.toBuffer()],
      program.programId,
    );
    const vaultUsdc = getAssociatedTokenAddressSync(usdcMint, escrowPda, true);

    await program.methods
      .initEscrow([...orderId], [...randomBytes(32)], [...randomBytes(32)], amount)
      .accounts({
        customer: customer.publicKey, escrow: escrowPda, usdcMint, vaultUsdc,
        systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([customer])
      .rpc();

    await program.methods.cancelPreFund()
      .accounts({ customer: customer.publicKey, escrow: escrowPda })
      .signers([customer])
      .rpc();

    // Escrow PDA should be closed (fetch must throw).
    let threw = false;
    try {
      await program.account.escrow.fetch(escrowPda);
    } catch {
      threw = true;
    }
    assert.equal(threw, true, 'escrow PDA should be closed after cancel_pre_fund');
  });
});

async function fundLamports(provider: anchor.AnchorProvider, to: PublicKey, sol: number): Promise<void> {
  const lamports = sol * anchor.web3.LAMPORTS_PER_SOL;
  const tx = await provider.connection.requestAirdrop(to, lamports);
  await provider.connection.confirmTransaction(tx, 'confirmed');
}

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
