import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Dispute } from '../target/types/dispute';

describe('dispute', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Dispute as Program<Dispute>;

  it('Raises a dispute', async () => {
    // Test raise_dispute
  });

  it('Submits evidence', async () => {
    // Test submit_evidence
  });

  it('Selects jury and resolves dispute', async () => {
    // Test full flow
  });

  it('Records outcome vote', async () => {
    // Test cast_outcome_vote
  });
});