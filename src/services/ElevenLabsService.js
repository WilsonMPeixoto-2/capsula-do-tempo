export const ElevenLabsService = {
  apiKey: localStorage.getItem('elevenlabs_key') || '',
  currentAudio: null,
  
  voiceMap: {
    'SISTEMA DA NAVE': 'zrHiDhphv9ZnVxwIclzj', 
    'G.E.T. MÓVEL': 'zrHiDhphv9ZnVxwIclzj', 
    'Cadu': 'D38z5RcWu1voky8WS1ja', 
    'Mila': '21m00Tcm4TlvDq8ikWAM', 
    'Juiz': '2EiwWnXFnvU5JabPnv8n', 
    'default': 'EXAVITQu4vr4xnSDxMaL'
  },

  setApiKey(key) {
    if (key) {
      this.apiKey = key;
      localStorage.setItem('elevenlabs_key', key);
    } else {
      this.apiKey = '';
      localStorage.removeItem('elevenlabs_key');
    }
  },

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    window.speechSynthesis.cancel();
  },

  async speak(text, speakerName, sceneId) {
    this.stop();
    if (!text) return;

    // 1. Try local pre-rendered audio first
    if (sceneId) {
      const localPath = `/assets/audio/voice/${sceneId}.mp3`;
      try {
        const check = await fetch(localPath, { method: 'HEAD' });
        if (check.ok) {
          this.currentAudio = new Audio(localPath);
          this.currentAudio.volume = 0.9;
          this.currentAudio.play();
          return;
        }
      } catch (e) {
        console.warn("Local audio check failed", e);
      }
    }

    // 2. Try ElevenLabs if Key exists
    if (!this.apiKey) {
      this.speakNative(text);
      return;
    }

    let voiceId = this.voiceMap.default;
    for (const [key, id] of Object.entries(this.voiceMap)) {
      if (speakerName && speakerName.includes(key)) {
        voiceId = id;
        break;
      }
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
             stability: 0.5,
             similarity_boost: 0.75,
             style: speakerName && speakerName.includes('Juiz') ? 0.7 : (speakerName && speakerName.includes('Cadu') ? 0.2 : 0.0)
          }
        })
      });

      if (!response.ok) {
        console.warn("ElevenLabs Error. Falling back to native.", response.statusText);
        this.speakNative(text);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      this.currentAudio = new Audio(url);
      
      this.currentAudio.volume = 0.8;
      this.currentAudio.play();
    } catch (e) {
      console.error("ElevenLabs fetch failed:", e);
      this.speakNative(text);
    }
  },

  speakNative(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};
