import { env } from "bun";

function MurmurHash3(seed: string) {
	let hash = 1779033703 ^ seed.length;
	for (let i = 0; i < seed.length; i++) {
		const bitwise_xor_from_character = hash ^ seed.charCodeAt(i);
		hash = Math.imul(bitwise_xor_from_character, 3432918353);
		hash = (hash << 13) | (hash >>> 19);
	}
	return () => {
		hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
		hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
		return (hash ^ (hash >>> 16)) >>> 0;
	};
}

function SimpleFastCounter32() {
	const generateSeed = MurmurHash3(env.RANDOM_SEED ?? "RANDOM_SEED");
	let seed_1 = generateSeed();
	let seed_2 = generateSeed();
	let seed_3 = generateSeed();
	let seed_4 = generateSeed();
	return () => {
		seed_1 >>>= 0;
		seed_2 >>>= 0;
		seed_3 >>>= 0;
		seed_4 >>>= 0;
		let cast32 = (seed_1 + seed_2) | 0;
		seed_1 = seed_2 ^ (seed_2 >>> 9);
		seed_2 = (seed_3 + (seed_3 << 3)) | 0;
		seed_3 = (seed_3 << 21) | (seed_3 >>> 11);
		seed_4 = (seed_4 + 1) | 0;
		cast32 = (cast32 + seed_4) | 0;
		seed_3 = (seed_3 + cast32) | 0;
		return (cast32 >>> 0) / 4294967296;
	};
}

export const seededRandom = SimpleFastCounter32();
