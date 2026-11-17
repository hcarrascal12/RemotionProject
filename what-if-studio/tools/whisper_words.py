import sys, json
from faster_whisper import WhisperModel
audio, out, model = sys.argv[1], sys.argv[2], sys.argv[3]
m = WhisperModel(model, device='cpu', compute_type='int8')
import numpy as np, subprocess
raw = subprocess.run(['ffmpeg','-v','error','-i',audio,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
sig = np.frombuffer(raw, dtype=np.float32)
segs, info = m.transcribe(sig, language='es', word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False)
words = []
for s in segs:
    for w in s.words:
        words.append({'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)})
json.dump(words, open(out, 'w'), ensure_ascii=False)
print(len(words), 'words;', info.language, round(info.duration, 1), 's')
for w in words: print(f"{w['s']:6.2f}-{w['e']:6.2f} {w['w']}")
