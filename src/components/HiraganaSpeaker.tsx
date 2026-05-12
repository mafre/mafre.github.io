import { useEffect, useMemo, useState } from 'react';

type HiraganaSpeakerProps = {
	text?: string;
	rate?: number;
	pitch?: number;
	volume?: number;
};

export function HiraganaSpeaker({
	text = 'あ',
	rate = 0.85,
	pitch = 1,
	volume = 1,
}: HiraganaSpeakerProps) {
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

	useEffect(() => {
		const synth = window.speechSynthesis;

		const loadVoices = () => {
			const allVoices = synth.getVoices();
			const japaneseVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith('ja'));

			setVoices(japaneseVoices);

			if (!selectedVoiceURI && japaneseVoices.length > 0) {
				setSelectedVoiceURI(japaneseVoices[0].voiceURI);
			}
		};

		loadVoices();

		// Some browsers populate voices asynchronously
		synth.addEventListener('voiceschanged', loadVoices);
		return () => synth.removeEventListener('voiceschanged', loadVoices);
	}, [selectedVoiceURI]);

	const selectedVoice = useMemo(
		() => voices.find((v) => v.voiceURI === selectedVoiceURI),
		[voices, selectedVoiceURI]
	);

	const speak = () => {
		const synth = window.speechSynthesis;
		synth.cancel();

		// Tiny context often sounds better than a totally isolated kana
		const utterance = new SpeechSynthesisUtterance(`${text}`);
		utterance.lang = 'ja-JP';
		utterance.rate = rate;
		utterance.pitch = pitch;
		utterance.volume = volume;

		if (selectedVoice) {
			utterance.voice = selectedVoice;
		}

		synth.speak(utterance);
	};

	const stop = () => {
		window.speechSynthesis.cancel();
	};

	return (
		<div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
			<div style={{ fontSize: 48, lineHeight: 1.1 }}>{text}</div>

			<label>
				Japanese voice:
				<select
					value={selectedVoiceURI}
					onChange={(e) => setSelectedVoiceURI(e.target.value)}
					style={{ display: 'block', width: '100%', marginTop: 4 }}
				>
					{voices.length === 0 ? (
						<option value="">No Japanese voice found</option>
					) : (
						voices.map((voice) => (
							<option key={voice.voiceURI} value={voice.voiceURI}>
								{voice.name} ({voice.lang})
							</option>
						))
					)}
				</select>
			</label>

			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={speak}>Play</button>
				<button onClick={stop}>Stop</button>
			</div>
		</div>
	);
}
