import { useEffect } from 'react';
import { ChainId, useEthers } from '@usedapp/core';
import { useAppDispatch, useAppSelector } from './hooks';
import { setActiveAccount } from './state/slices/account';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { setAlertModal } from './state/slices/application';
import classes from './App.module.css';
import '../src/css/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AlertModal from './components/Modal';
import NavBar from './components/NavBar';
import NetworkAlert from './components/NetworkAlert';
import Footer from './components/Footer';
import AuctionPage from './pages/Auction';
import GovernancePage from './pages/Governance';
import CreateProposalPage from './pages/CreateProposal';
import UpdateProposalPage from './pages/UpdateProposal';
import CreateDraftProposalPage from './pages/CreateDraftProposal';
import VotePage from './pages/Vote';
import NoundersPage from './pages/Nounders';
import ExplorePage from './pages/Explore';
import NotFoundPage from './pages/NotFound';
import Playground from './pages/Playground';
import { CHAIN_ID } from './config';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AvatarProvider } from '@davatar/react';
import dayjs from 'dayjs';
import DelegatePage from './pages/DelegatePage';
import CreateCandidatePage from './pages/CreateCandidate';
import CandidatePage from './pages/Candidate';
import EditProposalPage from './pages/EditProposal';
import EditCandidatePage from './pages/EditCandidate';
import ProposalHistory from './pages/ProposalHistory';
import DraftProposals from './pages/DraftProposals';
import DraftProposalPage from './pages/DraftProposal';
import CreateCandidateProposalPage from './pages/CreateCandidateProposalPage';
import CandidateProposals from './pages/CandidateProposals';
import CandidateProposalPage from './pages/CandidateProposalPage';

function App() {
  const { account, chainId, library } = useEthers();
  const dispatch = useAppDispatch();
  dayjs.extend(relativeTime);

  useEffect(() => {
    // Local account array updated
    dispatch(setActiveAccount(account));
  }, [account, dispatch]);

  const alertModal = useAppSelector(state => state.application.alertModal);

  return (
    <div className={`${classes.wrapper}`}>
      {Number(CHAIN_ID) !== chainId && <NetworkAlert />}
      {alertModal.show && (
        <AlertModal
          title={alertModal.title}
          content={<p>{alertModal.message}</p>}
          onDismiss={() => dispatch(setAlertModal({ ...alertModal, show: false }))}
        />
      )}
      <BrowserRouter>
        <AvatarProvider
          provider={chainId === ChainId.Mainnet ? library : undefined}
          batchLookups={true}
        >
          <NavBar />
          <Switch>
            <Route exact path="/" component={AuctionPage} />
            <Redirect from="/auction/:id" to="/noun/:id" />
            <Route
              exact
              path="/noun/:id"
              render={props => <AuctionPage initialAuctionId={Number(props.match.params.id)} />}
            />
            <Route exact path="/nounders" component={NoundersPage} />
            <Route exact path="/create-proposal" component={CreateProposalPage} />
            <Route exact path="/create-candidate" component={CreateCandidatePage} />
            <Route exact path="/create-draft-proposal" component={CreateDraftProposalPage} />
            <Route exact path="/candidates/create" component={CreateCandidateProposalPage} />
            <Route exact path="/candidates" component={CandidateProposals} />
            <Route exact path="/candidates/:id" component={CandidateProposalPage} />
            <Route exact path="/update-proposal/:id" component={UpdateProposalPage} />
            <Route exact path="/draft-proposals" component={DraftProposals} />
            <Route exact path="/draft-proposals/:id" component={DraftProposalPage} />
            <Route exact path="/vote" component={GovernancePage} />
            <Route exact path="/vote/:id" component={VotePage} />
            <Route exact path="/vote/:id/history" component={ProposalHistory} />
            <Route exact path="/vote/:id/edit" component={EditProposalPage} />
            <Route exact path="/candidate/:id" component={CandidatePage} />
            <Route exact path="/candidate/:id/edit" component={EditCandidatePage} />
            <Route exact path="/playground" component={Playground} />
            <Route exact path="/delegate" component={DelegatePage} />
            <Route exact path="/explore" component={ExplorePage} />
            <Route component={NotFoundPage} />
          </Switch>
          <Footer />
        </AvatarProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
