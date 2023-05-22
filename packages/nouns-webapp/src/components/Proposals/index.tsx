import {
  PartialProposal,
  PartialProposalCandidate,
  ProposalCandidate,
  ProposalState,
  useProposalThreshold,
} from '../../wrappers/nounsDao';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import ProposalStatus from '../ProposalStatus';
import classes from './Proposals.module.css';
import { useHistory } from 'react-router-dom';
import { useBlockNumber, useEthers } from '@usedapp/core';
import { isMobileScreen } from '../../utils/isMobile';
import clsx from 'clsx';
import { useUserNounTokenBalance, useUserVotes } from '../../wrappers/nounToken';
import { Trans } from '@lingui/macro';
import { ClockIcon } from '@heroicons/react/solid';
import proposalStatusClasses from '../ProposalStatus/ProposalStatus.module.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useActiveLocale } from '../../hooks/useActivateLocale';
import { SUPPORTED_LOCALE_TO_DAYSJS_LOCALE, SupportedLocale } from '../../i18n/locales';
import { useEffect, useState } from 'react';
import DelegationModal from '../DelegationModal';
import { i18n } from '@lingui/core';
import en from 'dayjs/locale/en';
import { AVERAGE_BLOCK_TIME_IN_SECS } from '../../utils/constants';
import Section from '../../layout/Section';
import CandidateCard from '../CandidateCard';
import { Link } from 'react-router-dom';
import { useCandidateProposals } from '../../wrappers/nounsData';

dayjs.extend(relativeTime);

const getCountdownCopy = (
  proposal: PartialProposal,
  currentBlock: number,
  locale: SupportedLocale,
) => {
  const timestamp = Date.now();
  const startDate =
    proposal && timestamp && currentBlock
      ? dayjs(timestamp).add(
          AVERAGE_BLOCK_TIME_IN_SECS * (proposal.startBlock - currentBlock),
          'seconds',
        )
      : undefined;

  const endDate =
    proposal && timestamp && currentBlock
      ? dayjs(timestamp).add(
          AVERAGE_BLOCK_TIME_IN_SECS * (proposal.endBlock - currentBlock),
          'seconds',
        )
      : undefined;

  const expiresDate = proposal && dayjs(proposal.eta).add(14, 'days');

  const now = dayjs();

  if (startDate?.isBefore(now) && endDate?.isAfter(now)) {
    return (
      <Trans>
        Ends {endDate.locale(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE[locale] || en).fromNow()}
      </Trans>
    );
  }
  if (endDate?.isBefore(now)) {
    return (
      <Trans>
        Expires {expiresDate.locale(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE[locale] || en).fromNow()}
      </Trans>
    );
  }
  return (
    <Trans>
      Starts{' '}
      {dayjs(startDate)
        .locale(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE[locale] || en)
        .fromNow()}
    </Trans>
  );
};

const Proposals = ({
  proposals,
  nounsRequired,
}: {
  proposals: PartialProposal[];
  nounsRequired?: number;
}) => {
  const history = useHistory();

  const { account } = useEthers();
  const connectedAccountNounVotes = useUserVotes() || 0;
  const currentBlock = useBlockNumber();
  const isMobile = isMobileScreen();
  const activeLocale = useActiveLocale();
  const [showDelegateModal, setShowDelegateModal] = useState(false);

  const threshold = (useProposalThreshold() ?? 0) + 1;
  const hasEnoughVotesToPropose = account !== undefined && connectedAccountNounVotes >= threshold;
  const hasNounBalance = (useUserNounTokenBalance() ?? 0) > 0;

  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Proposals', 'Candidates'];

  const nullStateCopy = () => {
    if (account !== null) {
      if (connectedAccountNounVotes > 0) {
        return <Trans>Making a proposal requires {threshold} votes</Trans>;
      }
      return <Trans>You have no Votes.</Trans>;
    }
    return <Trans>Connect wallet to make a proposal.</Trans>;
  };

  // Get candidates
  const { loading, error, data: allCandidates } = useCandidateProposals();
  const [candidates, setCandidates] = useState<PartialProposalCandidate[]>([]);

  useEffect(() => {
    if (!loading && !error && allCandidates) {
      const filteredCandidates: PartialProposalCandidate[] = allCandidates[
        'proposalCandidates'
      ].filter((candidate: ProposalCandidate) => candidate.canceled === false);
      setCandidates(filteredCandidates);
    }
    if (error) {
      console.error(error);
    }
  }, [loading, error, allCandidates]);

  return (
    <div className={classes.proposals}>
      {showDelegateModal && <DelegationModal onDismiss={() => setShowDelegateModal(false)} />}
      <div className={classes.sectionWrapper}>
        <Section fullWidth={false} className={classes.section}>
          <Col
            lg={10}
            className={clsx(
              classes.headerWrapper,
              !hasEnoughVotesToPropose ? classes.forceFlexRow : '',
            )}
          >
            <div className={classes.tabs}>
              {tabs.map((tab, index) => (
                <button
                  className={clsx(classes.tab, index === activeTab ? classes.activeTab : '')}
                  onClick={() => setActiveTab(index)}
                >
                  <Trans>{tab}</Trans>
                </button>
              ))}
            </div>

            {hasEnoughVotesToPropose ? (
              <div className={classes.nounInWalletBtnWrapper}>
                <div className={classes.submitProposalButtonWrapper}>
                  <Button
                    className={classes.generateBtn}
                    onClick={() => history.push('create-proposal')}
                  >
                    <Trans>Submit Proposal</Trans>
                  </Button>
                </div>

                {hasNounBalance && (
                  <div className={classes.delegateBtnWrapper}>
                    <Button
                      className={classes.changeDelegateBtn}
                      onClick={() => setShowDelegateModal(true)}
                    >
                      <Trans>Delegate</Trans>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={clsx('d-flex', classes.nullStateSubmitProposalBtnWrapper)}>
                {!isMobile && <div className={classes.nullStateCopy}>{nullStateCopy()}</div>}
                <div className={classes.nullBtnWrapper}>
                  <Button className={classes.generateBtnDisabled}>
                    <Trans>Submit Proposal</Trans>
                  </Button>
                </div>
                {!isMobile && hasNounBalance && (
                  <div className={classes.delegateBtnWrapper}>
                    <Button
                      className={classes.changeDelegateBtn}
                      onClick={() => setShowDelegateModal(true)}
                    >
                      <Trans>Delegate</Trans>
                    </Button>
                  </div>
                )}
              </div>
            )}
            {/* </div> */}
          </Col>
        </Section>
      </div>
      {isMobile && <div className={classes.nullStateCopy}>{nullStateCopy()}</div>}
      {isMobile && hasNounBalance && (
        <div>
          <Button className={classes.changeDelegateBtn} onClick={() => setShowDelegateModal(true)}>
            <Trans>Delegate</Trans>
          </Button>
        </div>
      )}
      <Section fullWidth={false} className={classes.section}>
        {activeTab === 0 && (
          <Col lg={10} className={classes.proposalsList}>
            {proposals?.length ? (
              proposals
                .slice(0)
                .reverse()
                .map((p, i) => {
                  const isPropInStateToHaveCountDown =
                    p.status === ProposalState.UPDATABLE ||
                    p.status === ProposalState.PENDING ||
                    p.status === ProposalState.ACTIVE ||
                    p.status === ProposalState.QUEUED;

                  const countdownPill = (
                    <div className={classes.proposalStatusWrapper}>
                      <div
                        className={clsx(
                          proposalStatusClasses.proposalStatus,
                          classes.countdownPill,
                        )}
                      >
                        <div className={classes.countdownPillContentWrapper}>
                          <span className={classes.countdownPillClock}>
                            <ClockIcon height={16} width={16} />
                          </span>{' '}
                          <span className={classes.countdownPillText}>
                            {getCountdownCopy(p, currentBlock || 0, activeLocale)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <a
                      className={clsx(classes.proposalLink, classes.proposalLinkWithCountdown)}
                      href={`/vote/${p.id}`}
                      key={i}
                    >
                      <div className={classes.proposalInfoWrapper}>
                        <span className={classes.proposalTitle}>
                          <span className={classes.proposalId}>
                            {i18n.number(parseInt(p.id || '0'))}
                          </span>{' '}
                          <span>{p.title}</span>
                        </span>

                        {isPropInStateToHaveCountDown && (
                          <div className={classes.desktopCountdownWrapper}>{countdownPill}</div>
                        )}
                        <div
                          className={clsx(classes.proposalStatusWrapper, classes.votePillWrapper)}
                        >
                          <ProposalStatus status={p.status}></ProposalStatus>
                        </div>
                      </div>

                      {isPropInStateToHaveCountDown && (
                        <div className={classes.mobileCountdownWrapper}>{countdownPill}</div>
                      )}
                    </a>
                  );
                })
            ) : (
              <Alert variant="secondary" className={classes.alert}>
                <Alert.Heading>
                  <Trans>No proposals found</Trans>
                </Alert.Heading>
                <p>
                  <Trans>Proposals submitted by community members will appear here.</Trans>
                </p>
              </Alert>
            )}
          </Col>
        )}
        {activeTab === 1 && (
          <Col lg={10} className={classes.proposalsList}>
            <Row>
              <Col lg={9}>
                {nounsRequired && candidates?.length ? (
                  candidates
                    .slice(0)
                    .reverse()
                    .map((c, i) => {
                      return (
                        <div>
                          <CandidateCard candidate={c} key={c.id} nounsRequired={nounsRequired} />
                        </div>
                      );
                    })
                ) : (
                  <Alert variant="secondary" className={classes.alert}>
                    <Alert.Heading>
                      <Trans>No candidates found</Trans>
                    </Alert.Heading>
                    <p>
                      <Trans>Candidates submitted by community members will appear here.</Trans>
                    </p>
                  </Alert>
                )}
              </Col>
              <Col lg={3} className={classes.candidatesSidebar}>
                <h4>
                  <strong>
                    <Trans>About Proposal Candidates</Trans>
                  </strong>
                </h4>
                {/* TODO: add real copy */}
                <p>
                  <Trans>
                    Nullam id dolor id nibh ultricies vehicula ut id elit. Cras justo odio, dapibus
                    ac facilisis in, egestas eget quam.
                  </Trans>
                </p>
                <h5>
                  <strong>
                    <Trans>Current threshold: </Trans> {threshold} Nouns
                  </strong>
                </h5>
                <Link to="/create-candidate" className={clsx(classes.button)}>
                  Create a candidate
                </Link>
              </Col>
            </Row>
          </Col>
        )}
      </Section>
    </div>
  );
};
export default Proposals;
