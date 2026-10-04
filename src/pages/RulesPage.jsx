import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

export const RulesPage = () => {
  return (
    <>
      <Header />
      <main className="max-w-450 w-full mx-auto px-3">
        <div className="rules-page">
          <section className="rules-main">
            <div className="rules-wrap">
              <h1 className="rules-title">Event Rules</h1>
              <p className="rules-subtitle">
                Failure to comply with the rules may result in disqualification. The host has final say on all outcomes.
              </p>
              <div className="rules-sections">
                <section className="rules-section">
                  <h2 className="rules-section-title">1. Deadlines</h2>
                  <div className="rules-section-body">
                    <p>
                      Deadlines for tournament registration or submitting work for each round are displayed on the main page. Participants who fail to submit their work by the deadline will be disqualified from the tournament. Exceptions may be made if we are notified of a delay in submission.
                    </p>
                    <p>
                      If a participant fails to submit their work for a round and does not notify the judges in any way, they are considered disqualified from the tournament and will never ever be allowed to participate in any future events.
                    </p>
                  </div>
                </section>

                <section className="rules-section">
                  <h2 className="rules-section-title">2. How Challenges Work</h2>
                  <div className="rules-section-body">
                    <p>
                      Each match involves two players who are randomly paired by the host. The host assigns either a Truth or Dare challenge to each player. Challenges are selected randomly from the approved pool.
                    </p>
                    <p>
                      Players must complete their challenge in full to advance. The audience and host vote on the outcome. The player with the lower score is eliminated.
                    </p>
                  </div>
                </section>

                <section className="rules-section">
                  <h2 className="rules-section-title">3. Fair Play &amp; Conduct</h2>
                  <div className="rules-section-body">
                    <p>
                      All participants must behave respectfully towards other players, spectators, and the host. Toxic behaviour, harassment, or cheating of any kind will result in immediate disqualification.
                    </p>
                  </div>
                </section>

                <section className="rules-section">
                  <h2 className="rules-section-title">4. Tournament Progression</h2>
                  <div className="rules-section-body">
                    <p>
                      The tournament consists of 4 rounds: Round of 16, Quarterfinals, Semifinals, and The Final. One player is eliminated per match. The bracket advances automatically after each round.
                    </p>
                    <p>
                      A player who refuses to complete a challenge without a valid reason is automatically eliminated. The host may choose to substitute a challenge if it is deemed unfit.
                    </p>
                  </div>
                </section>

                <section className="rules-section rules-section-last">
                  <h2 className="rules-section-title">5. Prizes &amp; Winner</h2>
                  <ul className="rules-bullets">
                    <li>The last player standing wins the full £50 prize pool</li>
                    <li>Entry fee (£0.50) is collected in person by the host at check-in</li>
                    <li>No refunds once the event has started</li>
                    <li>The host has final say in all disputes</li>
                  </ul>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};
