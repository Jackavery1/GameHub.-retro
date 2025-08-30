
/**
 * 🏆 Tournois Décentralisés
 * Smart contracts pour tournois avec récompenses automatiques
 */

class DecentralizedTournaments {
  constructor() {
    this.tournaments = new Map();
    this.participants = new Map();
    this.bets = new Map();
    this.rewards = new Map();
  }

  async createTournament(creatorId, gameId, entryFee, prizePool, maxParticipants = 32) {
    try {
      const tournamentId = Date.now().toString();
      const tournament = {
        id: tournamentId,
        creatorId,
        gameId,
        entryFee,
        prizePool,
        maxParticipants,
        participants: [],
        status: 'registration',
        createdAt: new Date(),
        startTime: null,
        endTime: null,
        results: [],
        bets: []
      };
      
      this.tournaments.set(tournamentId, tournament);
      console.log('✅ Tournoi créé:', tournamentId, 'prize pool:', prizePool, 'GHT');
      return tournament;
    } catch (error) {
      console.error('Erreur création tournoi:', error);
      throw error;
    }
  }

  async joinTournament(userId, tournamentId) {
    try {
      const tournament = this.tournaments.get(tournamentId);
      if (!tournament || tournament.status !== 'registration') {
        throw new Error('Tournoi non disponible');
      }
      
      if (tournament.participants.length >= tournament.maxParticipants) {
        throw new Error('Tournoi complet');
      }
      
      const participant = {
        userId,
        tournamentId,
        joinedAt: new Date(),
        status: 'active',
        score: 0,
        rank: null
      };
      
      tournament.participants.push(participant);
      this.participants.set(userId + '_' + tournamentId, participant);
      
      console.log('✅ Participant inscrit:', userId);
      return participant;
    } catch (error) {
      console.error('Erreur inscription tournoi:', error);
      throw error;
    }
  }

  async placeBet(bettorId, tournamentId, participantId, amount, betType = 'win') {
    try {
      const betId = Date.now().toString();
      const bet = {
        id: betId,
        bettorId,
        tournamentId,
        participantId,
        amount,
        type: betType,
        odds: this.calculateOdds(participantId, tournamentId),
        timestamp: new Date(),
        status: 'active'
      };
      
      this.bets.set(betId, bet);
      const tournament = this.tournaments.get(tournamentId);
      tournament.bets.push(bet);
      
      console.log('✅ Paris placé:', amount, 'GHT sur', participantId);
      return bet;
    } catch (error) {
      console.error('Erreur placement paris:', error);
      throw error;
    }
  }

  calculateOdds(participantId, tournamentId) {
    // Simulation de calcul de cotes basé sur les performances
    const baseOdds = 2.0;
    const performanceBonus = Math.random() * 0.5;
    return baseOdds + performanceBonus;
  }

  async startTournament(tournamentId) {
    try {
      const tournament = this.tournaments.get(tournamentId);
      if (!tournament) {
        throw new Error('Tournoi non trouvé');
      }
      
      tournament.status = 'active';
      tournament.startTime = new Date();
      
      console.log('✅ Tournoi démarré:', tournamentId);
      return tournament;
    } catch (error) {
      console.error('Erreur démarrage tournoi:', error);
      throw error;
    }
  }

  async endTournament(tournamentId, results) {
    try {
      const tournament = this.tournaments.get(tournamentId);
      if (!tournament) {
        throw new Error('Tournoi non trouvé');
      }
      
      tournament.status = 'completed';
      tournament.endTime = new Date();
      tournament.results = results;
      
      // Distribution automatique des récompenses
      await this.distributeRewards(tournamentId, results);
      
      console.log('✅ Tournoi terminé:', tournamentId);
      return tournament;
    } catch (error) {
      console.error('Erreur fin tournoi:', error);
      throw error;
    }
  }

  async distributeRewards(tournamentId, results) {
    try {
      const tournament = this.tournaments.get(tournamentId);
      const rewards = [];
      
      // Distribution des prix
      results.forEach((result, index) => {
        const reward = {
          userId: result.userId,
          rank: index + 1,
          amount: this.calculateReward(tournament.prizePool, index + 1),
          timestamp: new Date()
        };
        
        rewards.push(reward);
        this.rewards.set(result.userId + '_' + tournamentId, reward);
      });
      
      console.log('✅ Récompenses distribuées pour:', tournamentId);
      return rewards;
    } catch (error) {
      console.error('Erreur distribution récompenses:', error);
      throw error;
    }
  }

  calculateReward(prizePool, rank) {
    const distribution = {
      1: 0.5, // 50% pour le 1er
      2: 0.3, // 30% pour le 2ème
      3: 0.2  // 20% pour le 3ème
    };
    
    return Math.floor(prizePool * (distribution[rank] || 0));
  }

  async getActiveTournaments() {
    return Array.from(this.tournaments.values())
      .filter(tournament => tournament.status === 'registration' || tournament.status === 'active');
  }
}

module.exports = DecentralizedTournaments;
