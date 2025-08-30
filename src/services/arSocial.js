
/**
 * 👥 Système Social AR
 * Avatars AR, chat vocal spatialisé et interactions sociales
 */

class ARSocialSystem {
  constructor() {
    this.avatars = new Map();
    this.chatRooms = new Map();
    this.spatialAudio = null;
    this.userAvatar = null;
  }

  async init() {
    await this.initSpatialAudio();
    await this.createUserAvatar();
    console.log('✅ Système social AR initialisé');
  }

  async initSpatialAudio() {
    try {
      // Initialiser l'audio spatialisé
      this.spatialAudio = {
        context: new (window.AudioContext || window.webkitAudioContext)(),
        sources: new Map(),
        listeners: new Map()
      };
      
      console.log('✅ Audio spatialisé initialisé');
    } catch (error) {
      console.error('Erreur audio spatialisé:', error);
    }
  }

  async createUserAvatar() {
    this.userAvatar = {
      id: 'user-' + Date.now(),
      name: 'Joueur',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      model: 'default-avatar',
      animations: ['idle', 'wave', 'dance'],
      currentAnimation: 'idle'
    };
    
    console.log('✅ Avatar utilisateur créé');
  }

  async addFriendAvatar(friendId, friendData) {
    const avatar = {
      id: friendId,
      name: friendData.name,
      position: friendData.position || { x: 0, y: 0, z: 2 },
      rotation: friendData.rotation || { x: 0, y: 0, z: 0 },
      model: friendData.model || 'default-avatar',
      animations: friendData.animations || ['idle'],
      currentAnimation: 'idle',
      isOnline: true
    };
    
    this.avatars.set(friendId, avatar);
    console.log('✅ Avatar ami ajouté:', friendData.name);
  }

  updateAvatarPosition(avatarId, position, rotation) {
    const avatar = this.avatars.get(avatarId);
    if (avatar) {
      avatar.position = position;
      avatar.rotation = rotation;
      
      // Mettre à jour l'audio spatialisé
      this.updateSpatialAudio(avatarId, position);
    }
  }

  updateSpatialAudio(avatarId, position) {
    if (this.spatialAudio && this.spatialAudio.sources.has(avatarId)) {
      const source = this.spatialAudio.sources.get(avatarId);
      const distance = this.calculateDistance(this.userAvatar.position, position);
      
      // Ajuster le volume selon la distance
      const volume = Math.max(0, 1 - distance / 10);
      source.gain.gain.value = volume;
    }
  }

  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  async joinChatRoom(roomId) {
    const room = {
      id: roomId,
      participants: new Set(),
      messages: [],
      spatialAudio: true
    };
    
    this.chatRooms.set(roomId, room);
    room.participants.add(this.userAvatar.id);
    
    console.log('✅ Rejoint le chat room:', roomId);
  }

  sendMessage(roomId, message) {
    const room = this.chatRooms.get(roomId);
    if (room) {
      const messageObj = {
        id: Date.now(),
        sender: this.userAvatar.id,
        content: message,
        timestamp: new Date(),
        position: this.userAvatar.position
      };
      
      room.messages.push(messageObj);
      console.log('💬 Message envoyé:', message);
    }
  }

  playAvatarAnimation(avatarId, animation) {
    const avatar = this.avatars.get(avatarId);
    if (avatar && avatar.animations.includes(animation)) {
      avatar.currentAnimation = animation;
      console.log('🎭 Animation jouée:', animation, 'pour', avatar.name);
    }
  }

  shareExperience(experienceData) {
    const share = {
      id: Date.now(),
      type: experienceData.type,
      data: experienceData.data,
      timestamp: new Date(),
      sender: this.userAvatar.id
    };
    
    console.log('📤 Expérience partagée:', experienceData.type);
    return share;
  }
}

module.exports = ARSocialSystem;
