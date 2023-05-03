import React from 'react';
import { useEffect } from 'react';
import { useBlockNumber } from '@usedapp/core';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProposalStatus from '../ProposalStatus';
import classes from './ProposalHeader.module.css';
import navBarButtonClasses from '../NavBarButton/NavBarButton.module.css';
import {
  Proposal,
  ProposalCandidate,
  useHasVotedOnProposal,
  useProposalVote,
} from '../../wrappers/nounsDao';
import clsx from 'clsx';
import { isMobileScreen } from '../../utils/isMobile';
import { useUserVotesAsOfBlock } from '../../wrappers/nounToken';
import { useBlockTimestamp } from '../../hooks/useBlockTimestamp';
import { Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';
import { buildEtherscanAddressLink } from '../../utils/etherscan';
import { transactionLink } from '../ProposalContent';
import ShortAddress from '../ShortAddress';
import { useActiveLocale } from '../../hooks/useActivateLocale';
import { Locales } from '../../i18n/locales';
import HoverCard from '../HoverCard';
import ByLineHoverCard from '../ByLineHoverCard';
import { timestampFromBlockNumber } from '../../utils/timeUtils';
import dayjs from 'dayjs';

interface CandidateHeaderProps {
  proposal: ProposalCandidate;
  isActiveForVoting?: boolean;
  isWalletConnected: boolean;
  isCandidate?: boolean;
  submitButtonClickHandler: () => void;
}

const getTranslatedVoteCopyFromString = (proposalVote: string) => {
  if (proposalVote === 'For') {
    return (
      <Trans>
        You voted <strong>For</strong> this proposal
      </Trans>
    );
  }
  if (proposalVote === 'Against') {
    return (
      <Trans>
        You voted <strong>Against</strong> this proposal
      </Trans>
    );
  }
  return (
    <Trans>
      You <strong>Abstained</strong> from this proposal
    </Trans>
  );
};

const CandidateHeader: React.FC<CandidateHeaderProps> = props => {
  const { proposal, isActiveForVoting, isWalletConnected, submitButtonClickHandler } = props;
  const [updatedTimestamp, setUpdatedTimestamp] = React.useState<Date | null>(null);
  const isMobile = isMobileScreen();
  const currentBlock = useBlockNumber();
  const availableVotes = useUserVotesAsOfBlock(currentBlock) ?? 0;
  // const availableVotes = useUserVotesAsOfBlock(proposal?.createdBlock) ?? 0;
  const hasVoted = useHasVotedOnProposal(proposal?.id);
  const proposalVote = useProposalVote(proposal?.id);
  // const proposalCreationTimestamp = useBlockTimestamp(proposal?.createdBlock);
  const disableVoteButton = !isWalletConnected || !availableVotes || hasVoted;
  const activeLocale = useActiveLocale();
  // TODO: remove this after getting real data from the contract
  const tempUpdatedBlockNumber = 17097956;
  useEffect(() => {
    if (currentBlock) {
      // TODO: remove this after getting real data from the contract
      const timestamp = timestampFromBlockNumber(tempUpdatedBlockNumber, currentBlock);
      setUpdatedTimestamp(timestamp.toDate());
    }
  }, [currentBlock]);

  const voteButton = (
    <>
      {isWalletConnected ? (
        <>
          {!availableVotes && (
            <div className={classes.noVotesText}>
              <Trans>You have no votes.</Trans>
            </div>
          )}
        </>
      ) : (
        <div className={classes.connectWalletText}>
          <Trans>Connect a wallet to vote.</Trans>
        </div>
      )}
      <Button
        className={disableVoteButton ? classes.submitBtnDisabled : classes.submitBtn}
        disabled={disableVoteButton}
        onClick={submitButtonClickHandler}
      >
        <Trans>Submit vote</Trans>
      </Button>
    </>
  );

  const proposer = (
    <a
      href={buildEtherscanAddressLink(proposal.proposer || '')}
      target="_blank"
      rel="noreferrer"
      className={classes.proposerLinkJp}
    >
      <ShortAddress address={proposal.proposer || ''} avatar={false} />
    </a>
  );

  // const proposedAtTransactionHash = (
  //   <Trans>
  //     at{' '}
  //     <span className={classes.propTransactionHash}>
  //       {transactionLink(proposal.version.details.encodedProposalHash)}
  //     </span>
  //   </Trans>
  // );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex justify-content-start align-items-start">
          {/* TODO: bleed left on wide. move above on mobile */}
          <Link to={'/vote'}>
            <button className={clsx(classes.backButton, navBarButtonClasses.whiteInfo)}>←</button>
          </Link>
          <div className={classes.headerRow}>
            <span>
              <div className="d-flex">
                {props.isCandidate ? (
                  <>
                    <div>
                      <Trans>Proposal Candidate</Trans>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Trans>Proposal {i18n.number(parseInt(proposal.id || '0'))}</Trans>
                    </div>
                    <div>
                      {/* <ProposalStatus
                        status={proposal?.status}
                        className={classes.proposalStatus}
                      /> */}
                    </div>
                  </>
                )}
              </div>
            </span>
            <div className={classes.proposalTitleWrapper}>
              <div className={classes.proposalTitle}>
                <h1>{proposal.version.title} </h1>
              </div>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="d-flex justify-content-end align-items-end">
            {isActiveForVoting && voteButton}
          </div>
        )}
      </div>

      <div className={classes.byLineWrapper}>
        {activeLocale === Locales.ja_JP ? (
          <HoverCard
            hoverCardContent={(tip: string) => <ByLineHoverCard proposerAddress={tip} />}
            tip={proposal && proposal.proposer ? proposal.proposer : ''}
            id="byLineHoverCard"
          >
            <div className={classes.proposalByLineWrapperJp}>
              <Trans>
                <span className={classes.proposedByJp}>Proposed by: </span>
                <span className={classes.proposerJp}>{proposer}</span>
                {/* <span className={classes.propTransactionWrapperJp}>
                  {proposedAtTransactionHash}
                </span> */}
              </Trans>
            </div>
          </HoverCard>
        ) : (
          <>
            <h3>Proposed by</h3>

            <div className={classes.byLineContentWrapper}>
              <HoverCard
                hoverCardContent={(tip: string) => <ByLineHoverCard proposerAddress={tip} />}
                tip={proposal && proposal.proposer ? proposal.proposer : ''}
                id="byLineHoverCard"
              >
                <h3>
                  {proposer}
                  {/* <span className={classes.propTransactionWrapper}>
                    {proposedAtTransactionHash}
                  </span> */}
                </h3>
              </HoverCard>
            </div>
          </>
        )}
      </div>

      <p className={classes.versionHistory}>
        <strong>Version {proposal.versionsCount}</strong>{' '}
        {/* <span>updated {updatedTimestamp && dayjs(updatedTimestamp).fromNow()}</span> */}
        <span>
          {proposal.versionsCount === 1 ? 'created' : 'updated'}{' '}
          {dayjs(proposal.lastUpdatedTimestamp * 1000).fromNow()}
        </span>
      </p>

      {isMobile && (
        <div className={classes.mobileSubmitProposalButton}>{isActiveForVoting && voteButton}</div>
      )}

      {proposal && isActiveForVoting && hasVoted && (
        <Alert variant="success" className={classes.voterIneligibleAlert}>
          {getTranslatedVoteCopyFromString(proposalVote)}
        </Alert>
      )}

      {/* {proposal && isActiveForVoting && proposalCreationTimestamp && !!availableVotes && !hasVoted && (
        <Alert variant="success" className={classes.voterIneligibleAlert}>
          <Trans>
            Only Nouns you owned or were delegated to you before{' '}
            {i18n.date(new Date(proposalCreationTimestamp * 1000), {
              dateStyle: 'long',
              timeStyle: 'long',
            })}{' '}
            are eligible to vote.
          </Trans>
        </Alert>
      )} */}
    </>
  );
};

export default CandidateHeader;
